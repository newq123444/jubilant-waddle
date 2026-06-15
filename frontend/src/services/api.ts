// src/services/api.ts — Axios API client with Bearer auth
import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Token injection — reads from localStorage every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('cv_access_token');
  if (token) { if (!cfg.headers) cfg.headers = {} as any; (cfg.headers as any)["Authorization"] = `Bearer ${token}`; }
  return cfg;
});

// ── Residents ──────────────────────────────────────────────────────────────
export const residentsApi = {
  list:      (params?: object) => api.get('/residents', { params }),
  get:       (id: string) => api.get(`/residents/${id}`),
  create:    (data: object) => api.post('/residents', data),
  update:    (id: string, data: object) => api.patch(`/residents/${id}`, data),
  discharge: (id: string, data: object) => api.post(`/residents/${id}/discharge`, data),
};

// ── Care Notes ─────────────────────────────────────────────────────────────
export const notesApi = {
  list:   (params?: object) => api.get('/care-notes', { params }),
  get:    (id: string) => api.get(`/care-notes/${id}`),
  create: (data: object) => api.post('/care-notes', data),
  update: (id: string, data: object) => api.patch(`/care-notes/${id}`, data),
  delete: (id: string) => api.delete(`/care-notes/${id}`),
};

// ── eMAR ───────────────────────────────────────────────────────────────────
export const emarApi = {
  get:              (params?: object) => api.get('/emar', { params }),
  listMedications:  (params?: object) => api.get('/medications', { params }),
  getMedication:    (id: string) => api.get(`/medications/${id}`),
  createMedication: (data: object) => api.post('/medications', data),
  discontinue:      (id: string, data: object) => api.patch(`/medications/${id}/discontinue`, data),
  administer:       (data: object) => api.post('/emar/administer', data),
  missedReport:     (params?: object) => api.get('/emar/missed-report', { params }),
};

// ── Incidents ──────────────────────────────────────────────────────────────
export const incidentsApi = {
  list:         (params?: object) => api.get('/incidents', { params }),
  get:          (id: string) => api.get(`/incidents/${id}`),
  create:       (data: object) => api.post('/incidents', data),
  updateStatus: (id: string, data: object) => api.patch(`/incidents/${id}/status`, data),
};

// ── Schedule ───────────────────────────────────────────────────────────────
export const scheduleApi = {
  getWeek:     (startDate: string, endDate: string) => api.get('/schedule', { params: { start_date: startDate, end_date: endDate } }),
  upsertShift: (data: object) => api.post('/schedule/shift', data),
  deleteShift: (staffId: string, date: string) => api.delete(`/schedule/${staffId}/${date}`),
};

// ── Staff ──────────────────────────────────────────────────────────────────
export const staffApi = {
  list:          () => api.get('/staff'),
  get:           (id: string) => api.get(`/staff/${id}`),
  create:        (data: object) => api.post('/staff', data),
  update:        (id: string, data: object) => api.put(`/staff/${id}`, data),
  listTraining:  (params?: object) => api.get('/training', { params }),
  addTraining:   (data: object) => api.post('/training', data),
  updateTraining:(id: string, data: object) => api.patch(`/training/${id}`, data),
};

// ── Compliance ─────────────────────────────────────────────────────────────
export const complianceApi = {
  listActions:  (params?: object) => api.get('/compliance/actions', { params }),
  createAction: (data: object) => api.post('/compliance/actions', data),
  updateAction: (id: string, data: object) => api.patch(`/compliance/actions/${id}`, data),
  getFramework: () => api.get('/compliance/framework'),
};

// ── Family Portal ──────────────────────────────────────────────────────────
export const familyApi = {
  listMessages: (params?: object) => api.get('/family/messages', { params }),
  sendMessage:  (data: object) => api.post('/family/messages', data),
  markRead:     (id: string) => api.patch(`/family/messages/${id}/read`),
  listContacts: (residentId: string) => api.get(`/family/contacts/${residentId}`),
};

// ── Billing ────────────────────────────────────────────────────────────────
export const billingApi = {
  listInvoices:  (params?: object) => api.get('/invoices', { params }),
  getInvoice:    (id: string) => api.get(`/invoices/${id}`),
  createInvoice: (data: object) => api.post('/invoices', data),
  updateInvoice: (id: string, data: object) => api.patch(`/invoices/${id}/status`, data),
  summary:       () => api.get('/invoices/summary'),
};

// ── AI Tools ───────────────────────────────────────────────────────────────
export const aiApi = {
  analyze:         (data: object) => api.post('/ai/family-summary', data),
  suggest:         (data: object) => api.post('/ai/scheduling', data),
  riskAssess:      (residentId: string) => api.post('/ai/medication-flags', {}),
  handoverSummary: (data: object) => api.post('/ai/compliance-scan', data),
};

// ── Dashboard ──────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/reports/dashboard'),
};

// ── Policies ───────────────────────────────────────────────────────────────
export const policiesApi = {
  list:   (params?: object) => api.get('/policies', { params }),
  get:    (id: string) => api.get(`/policies/${id}`),
  create: (data: object) => api.post('/policies', data),
  update: (id: string, data: object) => api.put(`/policies/${id}`, data),
};

// ── Audit Log ──────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params?: object) => api.get('/audit-log', { params }),
};

// ── Activities ─────────────────────────────────────────────────────────────
export const activitiesApi = {
  list:               (params?: object) => api.get('/activities', { params }),
  get:                (id: string) => api.get(`/activities/${id}`),
  create:             (data: object) => api.post('/activities', data),
  update:             (id: string, data: object) => api.patch(`/activities/${id}`, data),
  delete:             (id: string) => api.delete(`/activities/${id}`),
  listSessions:       (params?: object) => api.get('/activities/sessions', { params }),
  createSession:      (data: object) => api.post('/activities/sessions', data),
  getParticipants:    (sessionId: string) => api.get(`/activities/sessions/${sessionId}/participants`),
  addParticipant:     (sessionId: string, data: object) => api.post(`/activities/sessions/${sessionId}/participants`, data),
  updateParticipant:  (sessionId: string, residentId: string, data: object) => api.patch(`/activities/sessions/${sessionId}/participants/${residentId}`, data),
  removeParticipant:  (sessionId: string, residentId: string) => api.delete(`/activities/sessions/${sessionId}/participants/${residentId}`),
  eligibleResidents:  (activityId: string) => api.get(`/activities/${activityId}/eligible-residents`),
  residentHistory:    (residentId: string) => api.get(`/residents/${residentId}/activities`),
  wellbeingDashboard: () => api.get('/activities/wellbeing-dashboard'),
};

// ── Predictive Care ────────────────────────────────────────────────────────
export const predictiveApi = {
  getDashboard:     () => api.get('/predictive/dashboard'),
  getResidentRisk:  (residentId: string) => api.get(`/predictive/residents/${residentId}/risk`),
  getResidentHistory: (residentId: string) => api.get(`/predictive/residents/${residentId}/history`),
  getAlerts:        () => api.get('/predictive/alerts'),
  acknowledgeAlert: (id: string) => api.patch(`/predictive/alerts/${id}/acknowledge`),
  runAnalysis:      () => api.post('/predictive/analyze'),
};

// ── Wellbeing ──────────────────────────────────────────────────────────────
export const wellbeingApi = {
  log:                    (data: object) => api.post('/wellbeing/log', data),
  getResidentWellbeing:   (residentId: string, days?: number) => api.get(`/wellbeing/${residentId}`, { params: { days } }),
  getOverview:            () => api.get('/wellbeing/overview'),
  getIsolationAlerts:     (status?: string) => api.get('/wellbeing/isolation-alerts', { params: { status } }),
  acknowledgeAlert:       (id: string, data: object) => api.patch(`/wellbeing/isolation-alerts/${id}`, data),
  generateAlerts:         () => api.post('/wellbeing/generate-isolation-alerts'),
  getLifeStory:           (residentId: string) => api.get(`/residents/${residentId}/life-story`),
  updateLifeStory:        (residentId: string, data: object) => api.put(`/residents/${residentId}/life-story`, data),
  getEnvironment:         (residentId: string) => api.get(`/residents/${residentId}/environment`),
  updateEnvironment:      (residentId: string, data: object) => api.put(`/residents/${residentId}/environment`, data),
};
