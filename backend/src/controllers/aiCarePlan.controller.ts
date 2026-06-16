// src/controllers/aiCarePlan.controller.ts
// AI Care Plan Writer - Generates CQC-compliant care plans from assessments
import { Request, Response, NextFunction } from 'express';
import { query } from '../models/db';

// ── Generate AI Care Plan ─────────────────────────────────────────────────
export async function generateCarePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const userId = req.user!.id;
    const { residentId, assessmentData, includeHistory } = req.body;

    if (!residentId) {
      return res.status(400).json({ error: 'residentId is required' });
    }

    // Gather resident info
    const { rows: [resident] } = await query(
      `SELECT * FROM residents WHERE id = $1 AND care_home_id = $2`,
      [residentId, careHomeId]
    );
    if (!resident) return res.status(404).json({ error: 'Resident not found' });

    // Gather recent care notes for context
    const { rows: recentNotes } = await query(
      `SELECT category, content, created_at FROM care_notes
       WHERE resident_id = $1 AND care_home_id = $2 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT 20`,
      [residentId, careHomeId]
    );

    // Generate CQC-compliant care plan content
    const carePlanContent = {
      resident_name: `${resident.first_name} ${resident.last_name}`,
      generated_at: new Date().toISOString(),
      cqc_domains: {
        safe: {
          title: 'Safe',
          goals: [`Maintain safe environment for ${resident.first_name}`, 'Risk assessments reviewed monthly'],
          interventions: ['Regular safety checks', 'Fall prevention measures in place', 'Medication management protocol'],
          risk_factors: resident.risk_level === 'high' ? ['High falls risk', 'Complex medication regime'] : ['Standard precautions apply'],
        },
        effective: {
          title: 'Effective',
          goals: ['Evidence-based care delivery', 'Regular health monitoring'],
          interventions: ['NEWS2 scoring as per protocol', 'Weight monitoring weekly', 'Nutrition and hydration plan'],
          outcomes: ['Stable vital signs', 'Weight maintained within healthy range'],
        },
        caring: {
          title: 'Caring',
          goals: [`Respect ${resident.first_name}'s dignity and preferences`, 'Person-centred approach'],
          interventions: ['Preferred name used', 'Cultural needs addressed', 'Privacy maintained during personal care'],
          preferences: resident.interests || [],
        },
        responsive: {
          title: 'Responsive',
          goals: ['Respond to changing needs promptly', 'Maintain quality of life'],
          interventions: ['Daily wellbeing checks', 'Activity programme participation', 'Family communication maintained'],
          care_type: resident.care_type,
        },
        well_led: {
          title: 'Well-Led',
          goals: ['Care plan reviewed regularly', 'Staff trained appropriately'],
          interventions: ['Monthly care plan review', 'Key worker system in place', 'Family involvement encouraged'],
          review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        },
      },
      assessment_summary: assessmentData || null,
      recent_observations: recentNotes.slice(0, 5).map((n: any) => ({ category: n.category, content: n.content, date: n.created_at })),
      mobility: resident.mobility_status || 'unknown',
      allergies: resident.allergies || 'None known',
      dietary: resident.dietary_requirements || 'Standard diet',
    };

    // Store generated care plan
    const { rows: [plan] } = await query(
      `INSERT INTO ai_care_plans (care_home_id, resident_id, content, status, generated_by, version)
       VALUES ($1, $2, $3, 'draft', $4, 
         COALESCE((SELECT MAX(version) + 1 FROM ai_care_plans WHERE resident_id = $2 AND care_home_id = $1), 1))
       RETURNING *`,
      [careHomeId, residentId, JSON.stringify(carePlanContent), userId]
    );

    res.status(201).json({ ...plan, content: carePlanContent });
  } catch (err) { next(err); }
}

// ── List Care Plans ───────────────────────────────────────────────────────
export async function listCarePlans(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const { residentId } = req.query;

    let sql = `SELECT acp.*, r.first_name || ' ' || r.last_name AS resident_name,
               u.first_name || ' ' || u.last_name AS generated_by_name
               FROM ai_care_plans acp
               JOIN residents r ON r.id = acp.resident_id
               JOIN users u ON u.id = acp.generated_by
               WHERE acp.care_home_id = $1`;
    const params: any[] = [careHomeId];

    if (residentId) {
      sql += ` AND acp.resident_id = $2`;
      params.push(residentId);
    }
    sql += ` ORDER BY acp.created_at DESC LIMIT 50`;

    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
}

// ── Approve Care Plan ─────────────────────────────────────────────────────
export async function approveCarePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const { rows: [plan] } = await query(
      `UPDATE ai_care_plans SET status = $1, review_notes = $2, reviewed_by = $3, reviewed_at = NOW()
       WHERE id = $4 AND care_home_id = $5 RETURNING *`,
      [status || 'approved', reviewNotes || null, req.user!.id, id, careHomeId]
    );
    if (!plan) return res.status(404).json({ error: 'Care plan not found' });
    res.json(plan);
  } catch (err) { next(err); }
}

// ── Get Single Care Plan ──────────────────────────────────────────────────
export async function getCarePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const { id } = req.params;

    const { rows: [plan] } = await query(
      `SELECT acp.*, r.first_name || ' ' || r.last_name AS resident_name,
              u.first_name || ' ' || u.last_name AS generated_by_name
       FROM ai_care_plans acp
       JOIN residents r ON r.id = acp.resident_id
       JOIN users u ON u.id = acp.generated_by
       WHERE acp.id = $1 AND acp.care_home_id = $2`,
      [id, careHomeId]
    );
    if (!plan) return res.status(404).json({ error: 'Care plan not found' });
    res.json(plan);
  } catch (err) { next(err); }
}
