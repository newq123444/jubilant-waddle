// ============================================================
// src/routes/index.ts — All API routes
// ============================================================
import { Router } from 'express';
import { authenticate, isManager, isClinical, isStaff, isFinance, tenantGuard } from '../middleware/auth';
import * as authCtrl from '../controllers/auth.controller';
import * as residentsCtrl from '../controllers/residents.controller';
import * as notesCtrl from '../controllers/careNotes.controller';
import * as emarCtrl from '../controllers/emar.controller';
import * as incidentsCtrl from '../controllers/incidents.controller';
import * as scheduleCtrl from '../controllers/schedule.controller';
import * as billingCtrl from '../controllers/billing.controller';
import * as tasksCtrl from '../controllers/tasks.controller';
import * as notificationsCtrl from '../controllers/notifications.controller';
import * as aiHandoverCtrl from '../controllers/aiHandover.controller';
import * as aiInsightsCtrl from '../controllers/aiInsights.controller';
import * as weightCtrl from '../controllers/weight.controller';
import * as photosCtrl from '../controllers/photos.controller';
import * as activitiesCtrl from '../controllers/activities.controller';
import * as wellbeingCtrl from '../controllers/wellbeing.controller';
import * as predictiveCareCtrl from '../controllers/predictiveCare.controller';
import * as familyPortalCtrl from '../controllers/familyPortal.controller';
import * as cqcComplianceCtrl from '../controllers/cqcCompliance.controller';
import * as voiceSbarCtrl from '../controllers/voiceSbar.controller';
import { upload } from '../middleware/upload'; // getBillingSummary added
import * as aiService from '../services/ai.service';
import { query } from '../models/db';
import { AppError } from '../utils/errors';

const router = Router();

// ── Auth (public) ─────────────────────────────────────────────────────────
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh', authCtrl.refreshToken);
router.post('/auth/logout', authenticate, authCtrl.logout);
router.post('/auth/change-password', authenticate, authCtrl.changePassword);
router.get('/auth/me', authenticate, (req, res) => res.json(req.user));

// All routes below require authentication + tenant guard
router.use(authenticate, tenantGuard);

// ── Residents ─────────────────────────────────────────────────────────────
router.get('/residents',            isStaff, residentsCtrl.listResidents);
router.get('/residents/:id',        isStaff, residentsCtrl.getResident);
router.post('/residents',           isManager, residentsCtrl.createResident);
router.patch('/residents/:id',      isManager, residentsCtrl.updateResident);
router.post('/residents/:id/discharge', isManager, residentsCtrl.dischargeResident);

// ── Care Notes ────────────────────────────────────────────────────────────
router.get('/care-notes',           isStaff, notesCtrl.listNotes);
router.post('/care-notes',          isStaff, notesCtrl.createNote);
router.patch('/care-notes/:id',     isStaff, notesCtrl.updateNote);
router.delete('/care-notes/:id',    isManager, notesCtrl.deleteNote);

// ── eMAR ──────────────────────────────────────────────────────────────────
router.get('/emar',                 isStaff, emarCtrl.getEmar);
router.post('/emar/administer',     isClinical, emarCtrl.recordAdministration);
router.get('/emar/missed-report',   isManager, emarCtrl.getMissedDosesReport);
router.get('/medications',          isStaff, emarCtrl.listMedications);
router.post('/medications',         isClinical, emarCtrl.createMedication);
router.delete('/medications/:id',   isClinical, emarCtrl.discontinueMedication);

// ── Incidents ─────────────────────────────────────────────────────────────
router.get('/incidents',            isStaff, incidentsCtrl.listIncidents);
router.post('/incidents',           isStaff, incidentsCtrl.createIncident);
router.patch('/incidents/:id/status', isStaff, incidentsCtrl.updateIncidentStatus);

// ── Scheduling ────────────────────────────────────────────────────────────
router.get('/schedule',             isStaff, scheduleCtrl.getWeekRota);
router.post('/schedule/shift',      isManager, scheduleCtrl.upsertShift);
router.delete('/schedule/:staffId/:date', isManager, scheduleCtrl.deleteShift);

// ── Staff ─────────────────────────────────────────────────────────────────
router.get('/staff/:id', isManager, async (req, res, next) => {
  try {
    const { rows: [staff] } = await query(
      `SELECT sp.*, u.first_name, u.last_name, u.email, u.role
       FROM staff_profiles sp JOIN users u ON u.id = sp.user_id
       WHERE sp.id = $1 AND sp.care_home_id = $2`,
      [req.params.id, req.user!.care_home_id]
    );
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (err) { next(err); }
});
router.patch('/staff/:id', isManager, async (req, res, next) => {
  try {
    const { id } = req.params;
    const careHomeId = req.user!.care_home_id;
    const { jobTitle, contractHours, hourlyRate, dbsNumber, dbsExpires } = req.body;
    const { rows: [sp] } = await query(
      `UPDATE staff_profiles SET
         job_title = COALESCE($1, job_title),
         contract_hours = COALESCE($2, contract_hours),
         hourly_rate = COALESCE($3, hourly_rate),
         dbs_number = COALESCE($4, dbs_number),
         dbs_expires = COALESCE($5, dbs_expires)
       WHERE id = $6 AND care_home_id = $7 RETURNING *`,
      [jobTitle, contractHours, hourlyRate, dbsNumber, dbsExpires, id, careHomeId]
    );
    if (!sp) return res.status(404).json({ error: 'Staff not found' });
    res.json(sp);
  } catch (err) { next(err); }
});
router.get('/staff', isManager, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT sp.*, u.first_name, u.last_name, u.email, u.role, u.phone, u.last_login,
        JSON_AGG(jsonb_build_object(
          'id', tr.id, 'course', tr.course_name,
          'expires', tr.expiry_date, 'status', tr.status
        )) FILTER (WHERE tr.id IS NOT NULL) AS training
       FROM staff_profiles sp
       JOIN users u ON u.id = sp.user_id
       LEFT JOIN training_records tr ON tr.staff_id = sp.id
       WHERE sp.care_home_id = $1 AND u.active = TRUE AND u.deleted_at IS NULL
       GROUP BY sp.id, u.first_name, u.last_name, u.email, u.role, u.phone, u.last_login
       ORDER BY u.last_name, u.first_name`,
      [req.user!.care_home_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Training ──────────────────────────────────────────────────────────────
router.get('/training', isManager, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT tr.*, sp.id AS staff_profile_id,
        u.first_name || ' ' || u.last_name AS staff_name, u.role
       FROM training_records tr
       JOIN staff_profiles sp ON sp.id = tr.staff_id
       JOIN users u ON u.id = sp.user_id
       WHERE tr.care_home_id = $1
       ORDER BY tr.expiry_date ASC`,
      [req.user!.care_home_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch('/training/:id', isManager, async (req, res, next) => {
  try {
    const { id } = req.params;
    const careHomeId = req.user!.care_home_id;
    const { completedDate, expiryDate, status, provider, notes } = req.body;
    const { rows: [tr] } = await query(
      `UPDATE training_records SET
         completed_date = COALESCE($1, completed_date),
         expiry_date = COALESCE($2, expiry_date),
         status = COALESCE($3, status),
         provider = COALESCE($4, provider),
         notes = COALESCE($5, notes)
       WHERE id = $6 AND care_home_id = $7 RETURNING *`,
      [completedDate, expiryDate, status, provider, notes, id, careHomeId]
    );
    if (!tr) return res.status(404).json({ error: 'Training record not found' });
    res.json(tr);
  } catch (err) { next(err); }
});
router.post('/training', isManager, async (req, res, next) => {
  try {
    const { staffId, courseName, provider, completedDate, expiryDate, notes } = req.body;
    const { rows: [tr] } = await query(
      `INSERT INTO training_records (care_home_id, staff_id, course_name, provider, completed_date, expiry_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user!.care_home_id, staffId, courseName, provider, completedDate, expiryDate, notes, req.user!.id]
    );
    res.status(201).json(tr);
  } catch (err) { next(err); }
});

// ── Compliance ────────────────────────────────────────────────────────────




// ── AI Insights ───────────────────────────────────────────────────────────
router.get('/ai/validate-data',                    isManager,  aiInsightsCtrl.validateCareData);
router.get('/ai/insights/:residentId',             isClinical, aiInsightsCtrl.generateResidentInsights);
router.get('/ai/care-quality',                     isManager,  aiInsightsCtrl.careQualityDashboard);

// ── Notifications ─────────────────────────────────────────────────────────
router.get('/notifications',              isStaff,   notificationsCtrl.listNotifications);
router.post('/notifications/read-all',    isStaff,   notificationsCtrl.markAllRead);
router.patch('/notifications/:id/read',   isStaff,   notificationsCtrl.markRead);
router.post('/notifications/generate',    isStaff,   notificationsCtrl.generateAlerts);

// ── AI Handover & Care Plan ───────────────────────────────────────────────
router.get('/ai/handover',                isClinical, aiHandoverCtrl.generateHandover);
router.get('/ai/care-plan/:residentId',   isManager,  aiHandoverCtrl.generateCarePlan);

// ── Weight Tracking ───────────────────────────────────────────────────────
router.get('/weights',                                isStaff,   weightCtrl.getAllWeights);
router.get('/residents/:residentId/weights',          isStaff,   weightCtrl.getWeightHistory);
router.post('/residents/:residentId/weights',         isClinical, weightCtrl.recordWeight);

// ── Activities ────────────────────────────────────────────────────────────
router.get('/activities',                             isStaff, activitiesCtrl.listActivities);
router.get('/activities/sessions',                    isStaff, activitiesCtrl.listSessions);
router.get('/activities/wellbeing-dashboard',         isStaff, activitiesCtrl.getWellbeingDashboard);
router.get('/activities/:id',                         isStaff, activitiesCtrl.getActivity);
router.get('/activities/:id/eligible-residents',      isStaff, activitiesCtrl.getEligibleResidents);
router.post('/activities',                            isStaff, activitiesCtrl.createActivity);
router.patch('/activities/:id',                       isStaff, activitiesCtrl.updateActivity);
router.delete('/activities/:id',                      isManager, activitiesCtrl.deleteActivity);
router.post('/activities/sessions',                   isStaff, activitiesCtrl.createSession);
router.get('/activities/sessions/:id/participants',   isStaff, activitiesCtrl.getSessionParticipants);
router.post('/activities/sessions/:id/participants',  isStaff, activitiesCtrl.addParticipant);
router.patch('/activities/sessions/:sessionId/participants/:residentId', isStaff, activitiesCtrl.updateParticipant);
router.delete('/activities/sessions/:sessionId/participants/:residentId', isStaff, activitiesCtrl.removeParticipant);
router.get('/residents/:id/activities',               isStaff, activitiesCtrl.getResidentActivityHistory);

// ── Wellbeing ─────────────────────────────────────────────────────────────
router.post('/wellbeing/log',                             isStaff, wellbeingCtrl.logWellbeing);
router.get('/wellbeing/overview',                         isStaff, wellbeingCtrl.getWellbeingOverview);
router.get('/wellbeing/isolation-alerts',                 isStaff, wellbeingCtrl.getSocialIsolationAlerts);
router.patch('/wellbeing/isolation-alerts/:id',           isManager, wellbeingCtrl.acknowledgeSocialAlert);
router.post('/wellbeing/generate-isolation-alerts',       isManager, wellbeingCtrl.generateIsolationAlerts);
router.get('/wellbeing/:residentId',                      isStaff, wellbeingCtrl.getResidentWellbeing);
router.get('/residents/:id/life-story',                   isStaff, wellbeingCtrl.getResidentLifeStory);
router.put('/residents/:id/life-story',                   isStaff, wellbeingCtrl.updateResidentLifeStory);
router.get('/residents/:id/environment',                  isStaff, wellbeingCtrl.getEnvironmentPreferences);
router.put('/residents/:id/environment',                  isStaff, wellbeingCtrl.updateEnvironmentPreferences);


// -- Predictive Care
router.get('/predictive/dashboard',                           isManager,  predictiveCareCtrl.getRiskDashboard);
router.get('/predictive/residents/:residentId/risk',          isClinical, predictiveCareCtrl.calculateFallsRisk);
router.get('/predictive/residents/:residentId/history',       isClinical, predictiveCareCtrl.getRiskHistory);
router.get('/predictive/alerts',                              isManager,  predictiveCareCtrl.getAlerts);
router.patch('/predictive/alerts/:id/acknowledge',            isManager,  predictiveCareCtrl.acknowledgeAlert);
router.post('/predictive/analyze',                            isManager,  predictiveCareCtrl.runPredictiveAnalysis);


// ── Controlled Drug Register ─────────────────────────────────────────────
router.get('/medications/cd-register',    isClinical, async (req, res, next) => {
  try {
    const careHomeId = req.user!.care_home_id;
    const { residentId } = req.query;
    const where = residentId
      ? 'WHERE cdr.care_home_id=$1 AND cdr.resident_id=$2'
      : 'WHERE cdr.care_home_id=$1';
    const params = residentId ? [careHomeId, residentId] : [careHomeId];
    const { rows } = await query(
      `SELECT cdr.*,
         r.first_name || ' ' || r.last_name AS resident_name, r.room_number,
         u1.first_name || ' ' || u1.last_name AS administered_by_name, u1.role AS administered_by_role,
         u2.first_name || ' ' || u2.last_name AS witnessed_by_name
       FROM cd_register cdr
       JOIN residents r ON r.id=cdr.resident_id
       JOIN users u1 ON u1.id=cdr.administered_by
       LEFT JOIN users u2 ON u2.id=cdr.witnessed_by
       ${where}
       ORDER BY cdr.administration_time DESC LIMIT 200`, params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/medications/cd-register',   isClinical, async (req, res, next) => {
  try {
    const careHomeId = req.user!.care_home_id;
    const { residentId, medicationName, dose, quantity, administeredBy, witnessedBy, balance, notes, administrationTime } = req.body;
    const { rows: [entry] } = await query(
      `INSERT INTO cd_register (care_home_id, resident_id, medication_name, dose, quantity, administered_by, witnessed_by, balance, notes, administration_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [careHomeId, residentId, medicationName, dose, quantity, administeredBy, witnessedBy||null, balance, notes||null, administrationTime||new Date()]
    );
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

// ── Photos & Belongings ───────────────────────────────────────────────────
router.post('/residents/:id/photo',           isStaff,   upload.single('photo'), photosCtrl.uploadResidentPhoto);
router.delete('/residents/:id/photo',         isStaff,   photosCtrl.removeResidentPhoto);
router.get('/residents/:residentId/belongings',    isStaff,   photosCtrl.listBelongings);
router.post('/residents/:residentId/belongings',   isStaff,   upload.single('photo'), photosCtrl.uploadBelongingPhoto);
router.delete('/belongings/:id',              isStaff,   photosCtrl.deleteBelonging);
router.post('/staff/avatar',                  isStaff,   upload.single('photo'), photosCtrl.uploadStaffAvatar);

// ── Care Tasks ────────────────────────────────────────────────────────────
router.get('/tasks',                  isStaff,   tasksCtrl.listTasks);
router.post('/tasks/generate',        isStaff,   tasksCtrl.generateDailyTasks);
router.post('/tasks/seed-templates',  isStaff,   tasksCtrl.seedTemplates);
router.post('/tasks/:id/complete',    isStaff,   tasksCtrl.completeTask);
router.post('/tasks/:id/defer',       isStaff,   tasksCtrl.deferTask);
router.post('/tasks/:id/start',       isStaff,   tasksCtrl.startTask);
router.post('/tasks/:id/release',     isStaff,   tasksCtrl.releaseTask);
router.get('/tasks/stream',           isStaff,   tasksCtrl.sseStream);

router.get('/compliance/actions', isManager, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ca.*, u.first_name||' '||u.last_name AS assigned_name
       FROM compliance_actions ca
       LEFT JOIN users u ON u.id = ca.assigned_to
       WHERE ca.care_home_id = $1 ORDER BY ca.due_date ASC NULLS LAST`,
      [req.user!.care_home_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/compliance/actions', isManager, async (req, res, next) => {
  try {
    const { title, description, kloeDomain, priority, dueDate, assignedTo } = req.body;
    const { rows: [action] } = await query(
      `INSERT INTO compliance_actions (care_home_id, title, description, kloe_domain, priority, due_date, assigned_to, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user!.care_home_id, title, description, kloeDomain, priority, dueDate, assignedTo, req.user!.id]
    );
    res.status(201).json(action);
  } catch (err) { next(err); }
});

router.patch('/compliance/actions/:id', isManager, async (req, res, next) => {
  try {
    const { status, evidenceNotes } = req.body;
    const { rows: [action] } = await query(
      `UPDATE compliance_actions SET status = $1, evidence_notes = $2,
        completed_by = $3, completed_at = $4
       WHERE id = $5 AND care_home_id = $6 RETURNING *`,
      [status, evidenceNotes, status==='closed'?req.user!.id:null, status==='closed'?new Date():null,
       req.params.id, req.user!.care_home_id]
    );
    res.json(action);
  } catch (err) { next(err); }
});

// -- CQC Compliance
router.get('/compliance/cqc-scores',                 isManager, cqcComplianceCtrl.getDomainScores);
router.post('/compliance/cqc-scores/calculate',      isManager, cqcComplianceCtrl.calculateDomainScores);
router.post('/compliance/evidence-pack',             isManager, cqcComplianceCtrl.generateEvidencePack);
router.get('/compliance/evidence-packs',             isManager, cqcComplianceCtrl.getEvidencePacks);
router.get('/compliance/policy-reviews',             isManager, cqcComplianceCtrl.getPolicyReviewStatus);
router.post('/compliance/policy-reviews',            isManager, cqcComplianceCtrl.createPolicyReview);
router.get('/compliance/inspection-checklist/:domain', isManager, cqcComplianceCtrl.getInspectionChecklist);
router.patch('/compliance/inspection-checklist/:id/item', isManager, cqcComplianceCtrl.updateChecklistItem);
router.get('/compliance/overview',                   isManager, cqcComplianceCtrl.getComplianceOverview);

router.post('/policies', isManager, async (req, res, next) => {
  try {
    const careHomeId = req.user!.care_home_id;
    const { title, category, content, reviewDate } = req.body;
    const { rows: [policy] } = await query(
      `INSERT INTO policies (care_home_id, title, category, content, review_date, created_by, version)
       VALUES ($1,$2,$3,$4,$5,$6,1) RETURNING *`,
      [careHomeId, title, category, content, reviewDate, req.user!.id]
    );
    res.status(201).json(policy);
  } catch (err) { next(err); }
});
router.get('/policies', isStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM policies WHERE care_home_id = $1 ORDER BY title',
      [req.user!.care_home_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Family Portal ─────────────────────────────────────────────────────────
router.get('/family/messages', isStaff, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT fm.*, r.first_name||' '||r.last_name AS resident_name
       FROM family_messages fm
       JOIN residents r ON r.id = fm.resident_id
       WHERE fm.care_home_id = $1 ORDER BY fm.created_at DESC`,
      [req.user!.care_home_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/family/messages', isStaff, async (req, res, next) => {
  try {
    const careHomeId = req.user!.care_home_id;
    const { residentId, recipientName, recipientEmail, subject, body } = req.body;
    const { rows: [msg] } = await query(
      `INSERT INTO family_messages (care_home_id, resident_id, sender_id, recipient_name, recipient_email, subject, body, direction)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'outbound') RETURNING *`,
      [careHomeId, residentId, req.user!.id, recipientName, recipientEmail, subject, body]
    );
    res.status(201).json(msg);
  } catch (err) { next(err); }
});
router.patch('/family/messages/:id/read', isStaff, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows: [msg] } = await query(
      `UPDATE family_messages SET read_at = NOW() WHERE id = $1 AND care_home_id = $2 RETURNING *`,
      [id, req.user!.care_home_id]
    );
    res.json(msg || { id, read: true });
  } catch (err) { next(err); }
});
router.get('/family/contacts/:residentId', isStaff, async (req, res, next) => {
  try {
    const { residentId } = req.params;
    const careHomeId = req.user!.care_home_id;
    const { rows } = await query(
      `SELECT DISTINCT recipient_name, recipient_email FROM family_messages
       WHERE care_home_id = $1 AND resident_id = $2 ORDER BY recipient_name`,
      [careHomeId, residentId]
    );
    res.json(rows);
  } catch (err) { next(err); }
});
router.post('/family/messages/:id/reply', isStaff, async (req, res, next) => {
  try {
    const { body } = req.body;
    const careHomeId = req.user!.care_home_id;
    const { rows: [parent] } = await query(
      'SELECT * FROM family_messages WHERE id = $1 AND care_home_id = $2',
      [req.params.id, careHomeId]
    );
    if (!parent) return next(new AppError(404, 'Message not found'));

    await query(
      'UPDATE family_messages SET read = TRUE, read_at = NOW() WHERE id = $1', [parent.id]
    );
    const { rows: [reply] } = await query(
      `INSERT INTO family_messages (care_home_id, resident_id, from_user_id, from_name, body, parent_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [careHomeId, parent.resident_id, req.user!.id,
       `${req.user!.first_name} ${req.user!.last_name}`, body, parent.id]
    );
    res.status(201).json(reply);
  } catch (err) { next(err); }
});

// ── Family Portal (Enhanced) ──────────────────────────────────────────────
router.get('/family/dashboard/:residentId',                isStaff,   familyPortalCtrl.getFamilyDashboard);
router.get('/family/daily-summary/:residentId',            isStaff,   familyPortalCtrl.getDailySummary);
router.post('/family/daily-summary/:residentId/generate',  isStaff,   familyPortalCtrl.generateDailySummary);
router.get('/family/weekly-report/:residentId',            isStaff,   familyPortalCtrl.getWeeklyReport);
router.post('/family/weekly-reports/generate',             isManager, familyPortalCtrl.generateWeeklyReports);
router.get('/family/photos/:residentId',                   isStaff,   familyPortalCtrl.listPhotos);
router.post('/family/photos/:residentId',                  isStaff,   upload.single('photo'), familyPortalCtrl.uploadFamilyPhoto);

// -- Voice & SBAR
router.post('/voice/transcribe',              isStaff, upload.single('audio'), voiceSbarCtrl.transcribeAudio);
router.post('/voice/create-note',             isStaff, voiceSbarCtrl.createNoteFromVoice);
router.get('/voice/history',                  isStaff, voiceSbarCtrl.getVoiceHistory);
router.post('/sbar/generate',                 isClinical, voiceSbarCtrl.generateSbarHandover);
router.get('/sbar/handovers',                 isClinical, voiceSbarCtrl.listSbarHandovers);
router.get('/sbar/handovers/:id',             isClinical, voiceSbarCtrl.getSbarHandover);
router.patch('/sbar/handovers/:id/approve',   isManager, voiceSbarCtrl.approveSbarHandover);

// ── Billing ───────────────────────────────────────────────────────────────
router.get('/invoices/summary',     isFinance, billingCtrl.getBillingSummary);
router.get('/invoices',             isFinance, billingCtrl.listInvoices);
router.post('/invoices',            isFinance, billingCtrl.createInvoice);
router.patch('/invoices/:id/status', isFinance, billingCtrl.updateInvoiceStatus);

// ── AI ────────────────────────────────────────────────────────────────────
router.post('/ai/family-summary',   isStaff, aiService.generateFamilySummary);
router.post('/ai/compliance-scan',  isManager, aiService.complianceScan);
router.post('/ai/scheduling',       isManager, aiService.schedulingSuggestions);
router.post('/ai/medication-flags', isClinical, aiService.medicationFlags);

router.get('/ai/audit', isManager, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT al.*, u.first_name||' '||u.last_name AS requested_by_name
       FROM ai_audit_log al
       JOIN users u ON u.id = al.requested_by
       WHERE al.care_home_id = $1 ORDER BY al.created_at DESC LIMIT 100`,
      [req.user!.care_home_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Audit Log ─────────────────────────────────────────────────────────────
router.get('/audit-log', isManager, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM audit_log WHERE care_home_id = $1
       ORDER BY created_at DESC LIMIT 200`,
      [req.user!.care_home_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── Reports ───────────────────────────────────────────────────────────────
router.get('/reports/dashboard', isStaff, async (req, res, next) => {
  try {
    const careHomeId = req.user!.care_home_id;
    const today = new Date().toISOString().slice(0, 10);

    const [residents, incidents, missedMeds, notes, expiringTraining, unreadMessages] =
      await Promise.all([
        query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE active) AS active,
               COUNT(*) FILTER (WHERE active AND risk_level='high') AS high_risk
               FROM residents WHERE care_home_id = $1`, [careHomeId]),
        query(`SELECT COUNT(*) AS open FROM incidents WHERE care_home_id = $1 AND status != 'closed'`, [careHomeId]),
        query(`SELECT COUNT(*) FROM med_administrations WHERE care_home_id = $1 AND status = 'missed' AND administration_date = $2`, [careHomeId, today]),
        query(`SELECT COUNT(*) FROM care_notes WHERE care_home_id = $1 AND created_at::date = $2 AND deleted_at IS NULL`, [careHomeId, today]),
        query(`SELECT COUNT(*) FROM training_records WHERE care_home_id = $1 AND expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'`, [careHomeId]),
        query(`SELECT COUNT(*) FROM family_messages WHERE care_home_id = $1 AND read = FALSE AND from_user_id IS NULL`, [careHomeId]),
      ]);

    res.json({
      residents: residents.rows[0],
      openIncidents: incidents.rows[0].open,
      missedMedsToday: missedMeds.rows[0].count,
      notesToday: notes.rows[0].count,
      expiringTraining: expiringTraining.rows[0].count,
      unreadMessages: unreadMessages.rows[0].count,
    });
  } catch (err) { next(err); }
});

export default router;
