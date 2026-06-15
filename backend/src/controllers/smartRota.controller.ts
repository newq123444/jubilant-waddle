// src/controllers/smartRota.controller.ts
// Smart Rota Builder - AI-style optimal rota generation
import { Request, Response, NextFunction } from 'express';
import { query } from '../models/db';

// ── Generate Rota ─────────────────────────────────────────────────────────
export async function generateRota(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const userId = req.user!.id;
    const { name, weekStart, budgetLimitPence, constraints } = req.body;

    if (!name || !weekStart) {
      return res.status(400).json({ error: 'name and weekStart are required' });
    }

    // Query all active staff with their roles, contracted hours, hourly rates
    const { rows: staff } = await query(
      `SELECT u.id AS user_id, u.first_name, u.last_name, u.role,
              sp.contract_hours, sp.hourly_rate, sp.job_title
       FROM users u
       JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE u.care_home_id = $1 AND u.active = TRUE AND u.deleted_at IS NULL`,
      [careHomeId]
    );

    // Query current resident count and acuity levels
    const { rows: [residentStats] } = await query(
      `SELECT
         COUNT(*) AS total_residents,
         COUNT(*) FILTER (WHERE risk_level = 'high') AS high_risk_count,
         COUNT(*) FILTER (WHERE risk_level = 'medium') AS medium_risk_count,
         COUNT(*) FILTER (WHERE risk_level = 'low') AS low_risk_count
       FROM residents
       WHERE care_home_id = $1 AND active = TRUE`,
      [careHomeId]
    );

    const totalResidents = parseInt(residentStats.total_residents) || 0;

    // Calculate minimum staff requirements
    const dayCarerRatio = 6; // 1:6 during day
    const nightCarerRatio = 10; // 1:10 at night
    const minDayCarers = Math.max(1, Math.ceil(totalResidents / dayCarerRatio));
    const minNightCarers = Math.max(1, Math.ceil(totalResidents / nightCarerRatio));
    const minNursesPerShift = 1;

    // Identify nurses and carers
    const nurses = staff.filter((s: any) =>
      s.role === 'registered_nurse' || s.job_title?.toLowerCase().includes('nurse')
    );
    const carers = staff.filter((s: any) =>
      s.role === 'senior_carer' || s.role === 'carer' || s.role === 'activities'
    );

    // Create rota template
    const { rows: [template] } = await query(
      `INSERT INTO rota_templates (care_home_id, name, week_start, status, constraints, budget_limit_pence, created_by)
       VALUES ($1, $2, $3, 'draft', $4, $5, $6) RETURNING *`,
      [careHomeId, name, weekStart, JSON.stringify(constraints || {}), budgetLimitPence || null, userId]
    );

    const shifts: any[] = [];
    const weekStartDate = new Date(weekStart);

    // Track weekly hours per staff member
    const weeklyHours: Record<string, number> = {};
    staff.forEach((s: any) => { weeklyHours[s.user_id] = 0; });

    // Shift definitions
    const shiftDefs = [
      { type: 'day', start: '07:00', end: '15:00', hours: 8 },
      { type: 'evening', start: '15:00', end: '22:00', hours: 7 },
      { type: 'night', start: '22:00', end: '07:00', hours: 9 },
    ];

    // For each day of the week (7 days)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const shiftDate = new Date(weekStartDate);
      shiftDate.setDate(shiftDate.getDate() + dayOffset);
      const dateStr = shiftDate.toISOString().slice(0, 10);

      for (const shiftDef of shiftDefs) {
        const isNight = shiftDef.type === 'night';
        const requiredCarers = isNight ? minNightCarers : minDayCarers;

        // Assign nurses (at least 1 per shift)
        let nursesAssigned = 0;
        for (const nurse of nurses) {
          if (nursesAssigned >= minNursesPerShift) break;
          const currentHours = weeklyHours[nurse.user_id] || 0;
          const contractHours = parseFloat(nurse.contract_hours) || 48;
          // Respect 48-hour weekly working time limit
          if (currentHours + shiftDef.hours <= Math.min(48, contractHours)) {
            shifts.push({
              staffId: nurse.user_id,
              shiftDate: dateStr,
              shiftType: shiftDef.type,
              startTime: shiftDef.start,
              endTime: shiftDef.end,
              roleRequired: 'registered_nurse',
            });
            weeklyHours[nurse.user_id] = currentHours + shiftDef.hours;
            nursesAssigned++;
          }
        }

        // Assign carers proportional to residents
        let carersAssigned = 0;
        for (const carer of carers) {
          if (carersAssigned >= requiredCarers) break;
          const currentHours = weeklyHours[carer.user_id] || 0;
          const contractHours = parseFloat(carer.contract_hours) || 48;
          // Respect 48-hour weekly working time limit
          if (currentHours + shiftDef.hours <= Math.min(48, contractHours)) {
            shifts.push({
              staffId: carer.user_id,
              shiftDate: dateStr,
              shiftType: shiftDef.type,
              startTime: shiftDef.start,
              endTime: shiftDef.end,
              roleRequired: carer.role === 'senior_carer' ? 'senior_carer' : 'carer',
            });
            weeklyHours[carer.user_id] = currentHours + shiftDef.hours;
            carersAssigned++;
          }
        }
      }
    }

    // Insert all shifts
    const insertedShifts: any[] = [];
    for (const shift of shifts) {
      const { rows: [inserted] } = await query(
        `INSERT INTO rota_shifts (care_home_id, template_id, staff_id, shift_date, shift_type, start_time, end_time, role_required, auto_generated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE) RETURNING *`,
        [careHomeId, template.id, shift.staffId, shift.shiftDate, shift.shiftType, shift.startTime, shift.endTime, shift.roleRequired]
      );
      insertedShifts.push(inserted);
    }

    res.status(201).json({
      template,
      shifts: insertedShifts,
      meta: {
        totalResidents,
        staffAvailable: staff.length,
        nursesAvailable: nurses.length,
        carersAvailable: carers.length,
        minDayCarers,
        minNightCarers,
        shiftsGenerated: insertedShifts.length,
      },
    });
  } catch (err) { next(err); }
}

// ── Get Rota Template ─────────────────────────────────────────────────────
export async function getRotaTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const { id } = req.params;

    const { rows: [template] } = await query(
      `SELECT rt.*, u.first_name || ' ' || u.last_name AS created_by_name
       FROM rota_templates rt
       LEFT JOIN users u ON u.id = rt.created_by
       WHERE rt.id = $1 AND rt.care_home_id = $2`,
      [id, careHomeId]
    );

    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Get all shifts with staff names and roles
    const { rows: shifts } = await query(
      `SELECT rs.*, u.first_name || ' ' || u.last_name AS staff_name, u.role AS staff_role
       FROM rota_shifts rs
       JOIN users u ON u.id = rs.staff_id
       WHERE rs.template_id = $1 AND rs.care_home_id = $2
       ORDER BY rs.shift_date, rs.start_time`,
      [id, careHomeId]
    );

    res.json({ template, shifts });
  } catch (err) { next(err); }
}

// ── List Rota Templates ───────────────────────────────────────────────────
export async function listRotaTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;

    const { rows } = await query(
      `SELECT rt.*, u.first_name || ' ' || u.last_name AS created_by_name,
              (SELECT COUNT(*) FROM rota_shifts WHERE template_id = rt.id) AS shift_count
       FROM rota_templates rt
       LEFT JOIN users u ON u.id = rt.created_by
       WHERE rt.care_home_id = $1
       ORDER BY rt.week_start DESC`,
      [careHomeId]
    );

    res.json(rows);
  } catch (err) { next(err); }
}

// ── Update Rota Shift ─────────────────────────────────────────────────────
export async function updateRotaShift(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const { id } = req.params;
    const { staffId, shiftDate, shiftType, startTime, endTime, notes } = req.body;

    const { rows: [shift] } = await query(
      `UPDATE rota_shifts SET
         staff_id = COALESCE($1, staff_id),
         shift_date = COALESCE($2, shift_date),
         shift_type = COALESCE($3, shift_type),
         start_time = COALESCE($4, start_time),
         end_time = COALESCE($5, end_time),
         notes = COALESCE($6, notes),
         auto_generated = FALSE
       WHERE id = $7 AND care_home_id = $8
       RETURNING *`,
      [staffId || null, shiftDate || null, shiftType || null, startTime || null, endTime || null, notes || null, id, careHomeId]
    );

    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    res.json(shift);
  } catch (err) { next(err); }
}

// ── Publish Rota ──────────────────────────────────────────────────────────
export async function publishRota(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;
    const { id } = req.params;

    // Update template status to published
    const { rows: [template] } = await query(
      `UPDATE rota_templates SET status = 'published', updated_at = NOW()
       WHERE id = $1 AND care_home_id = $2 AND status = 'draft'
       RETURNING *`,
      [id, careHomeId]
    );

    if (!template) return res.status(404).json({ error: 'Template not found or already published' });

    // Get the shifts for this template
    const { rows: rotaShifts } = await query(
      `SELECT * FROM rota_shifts WHERE template_id = $1 AND care_home_id = $2`,
      [id, careHomeId]
    );

    // Copy shifts to the main schedule (shifts) table
    for (const shift of rotaShifts) {
      // Find staff_profile id for this user
      const { rows: [sp] } = await query(
        `SELECT id FROM staff_profiles WHERE user_id = $1 AND care_home_id = $2`,
        [shift.staff_id, careHomeId]
      );
      if (sp) {
        await query(
          `INSERT INTO shifts (care_home_id, staff_id, shift_date, shift_type, start_time, end_time, role_on_shift, notes, created_by)
           VALUES ($1, $2, $3, $4::shift_type, $5, $6, $7, $8, $9)
           ON CONFLICT (staff_id, shift_date) DO UPDATE SET
             shift_type = EXCLUDED.shift_type,
             start_time = EXCLUDED.start_time,
             end_time = EXCLUDED.end_time,
             role_on_shift = EXCLUDED.role_on_shift,
             notes = EXCLUDED.notes,
             updated_at = NOW()`,
          [careHomeId, sp.id, shift.shift_date, shift.shift_type, shift.start_time, shift.end_time, shift.role_required, shift.notes, req.user!.id]
        );
      }
    }

    res.json({ template, message: 'Rota published and copied to schedule', shiftsPublished: rotaShifts.length });
  } catch (err) { next(err); }
}

// ── Get Staff Constraints ─────────────────────────────────────────────────
export async function getStaffConstraints(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomeId = req.user!.care_home_id;

    // Get staff with their weekly hours from shifts this week
    const { rows } = await query(
      `SELECT
         u.id AS user_id,
         u.first_name || ' ' || u.last_name AS staff_name,
         u.role,
         sp.contract_hours,
         sp.hourly_rate,
         COALESCE(
           (SELECT SUM(
             EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600
           )
           FROM shifts s
           WHERE s.staff_id = sp.id AND s.care_home_id = $1
             AND s.shift_date >= date_trunc('week', CURRENT_DATE)
             AND s.shift_date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
             AND s.shift_type NOT IN ('off', 'annual_leave', 'sick')
           ), 0
         ) AS hours_this_week
       FROM users u
       JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE u.care_home_id = $1 AND u.active = TRUE AND u.deleted_at IS NULL
       ORDER BY u.last_name, u.first_name`,
      [careHomeId]
    );

    // Check for constraint violations
    const staffWithConstraints = rows.map((s: any) => {
      const hoursThisWeek = parseFloat(s.hours_this_week) || 0;
      const contractHours = parseFloat(s.contract_hours) || 0;
      const violations: string[] = [];

      if (hoursThisWeek > 48) {
        violations.push('Exceeds 48-hour working time directive limit');
      }
      if (contractHours > 0 && hoursThisWeek > contractHours) {
        violations.push(`Exceeds contracted hours (${contractHours}h)`);
      }

      return {
        ...s,
        hoursThisWeek,
        contractHours,
        maxWeeklyHours: 48,
        remainingHours: Math.max(0, Math.min(48, contractHours || 48) - hoursThisWeek),
        violations,
        hasViolation: violations.length > 0,
      };
    });

    res.json(staffWithConstraints);
  } catch (err) { next(err); }
}
