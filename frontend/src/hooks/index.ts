// src/hooks/index.ts — All hooks for CareVista
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api, residentsApi, notesApi, emarApi, incidentsApi,
  scheduleApi, staffApi, complianceApi, familyApi,
  billingApi, aiApi, dashboardApi, auditApi, policiesApi,
  activitiesApi, wellbeingApi, predictiveApi, voiceApi, sbarApi,
  news2Api, woundsApi, infectionsApi, continenceApi,
  smartRotaApi, nlSearchApi, riskAssessmentsApi, medInteractionsApi,
} from '../services/api';
import { toast } from '../utils/toast';

export function useResidents(params?: object) {
  return useQuery({ queryKey: ['residents', params], queryFn: () => residentsApi.list(params).then(r => Array.isArray(r.data) ? r.data : (r.data?.residents ?? r.data)) });
}
export function useResident(id: string) {
  return useQuery({ queryKey: ['residents', id], queryFn: () => residentsApi.get(id).then(r => r.data), enabled: !!id });
}
export function useAdmitResident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => residentsApi.create(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Resident admitted successfully'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to admit resident') });
}
export function useUpdateResident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => residentsApi.update(id, data).then(r => r.data), onSuccess: (_: any, vars: any) => { qc.invalidateQueries({ queryKey: ['residents', vars.id] }); qc.invalidateQueries({ queryKey: ['residents'] }); toast.success('Resident record updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update') });
}
export function useDischargeResident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => residentsApi.discharge(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Resident discharged'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to discharge') });
}
export function useCareNotes(params?: object) {
  return useQuery({ queryKey: ['care-notes', params], queryFn: () => notesApi.list(params).then(r => Array.isArray(r.data) ? r.data : (r.data?.notes ?? r.data)) });
}
export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => notesApi.create(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['care-notes'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Care note saved'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save note') });
}
export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => notesApi.delete(id).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['care-notes'] }); toast.success('Note deleted'); } });
}
export function useResidentMedications(residentId: string) {
  return useQuery({
    queryKey: ['medications', residentId],
    queryFn: () => api.get('/medications', { params: { residentId, active: 'all' } }).then(r => r.data),
    enabled: !!residentId,
  });
}
export function useEmar(date?: string) {
  return useQuery({ queryKey: ['emar', date], queryFn: () => emarApi.get({ date }).then(r => r.data), refetchInterval: 60_000 });
}
export function useMedications(params?: object) {
  return useQuery({ queryKey: ['medications', params], queryFn: () => emarApi.listMedications(params).then(r => r.data) });
}
export function useCreateMedication() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => emarApi.createMedication(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['medications'] }); qc.invalidateQueries({ queryKey: ['emar'], exact: false }); toast.success('Medication added ✅'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to add medication') });
}
export function useDiscontinueMedication() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => emarApi.discontinue(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['medications'] }); qc.invalidateQueries({ queryKey: ['emar'], exact: false }); toast.success('Medication discontinued'); } });
}
export function useRecordAdministration() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => emarApi.administer(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['emar'], exact: false }); qc.invalidateQueries({ queryKey: ['dashboard'], exact: false }); toast.success('Administration recorded ✅'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to record') });
}
export function useMissedMedReport(params?: object) {
  return useQuery({ queryKey: ['emar-missed', params], queryFn: () => emarApi.missedReport(params).then(r => r.data) });
}
export function useIncidents(params?: object) {
  return useQuery({ queryKey: ['incidents', params], queryFn: () => incidentsApi.list(params).then(r => r.data) });
}
export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => incidentsApi.create(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Incident reported'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to report') });
}
export function useUpdateIncidentStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => incidentsApi.updateStatus(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Incident updated'); } });
}
export function useWeekRota(startDate: string, endDate: string) {
  return useQuery({ queryKey: ['schedule', startDate, endDate], queryFn: () => scheduleApi.getWeek(startDate, endDate).then(r => r.data), enabled: !!startDate && !!endDate });
}
export function useUpsertShift() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => scheduleApi.upsertShift(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedule'] }); toast.success('Shift updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update shift') });
}
export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ staffId, date }: { staffId: string; date: string }) => scheduleApi.deleteShift(staffId, date).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedule'] }); toast.success('Shift removed'); } });
}
export function useStaff() {
  return useQuery({ queryKey: ['staff'], queryFn: () => staffApi.list().then(r => r.data) });
}
export function useTraining(params?: object) {
  return useQuery({ queryKey: ['training', params], queryFn: () => staffApi.listTraining(params).then(r => r.data) });
}
export function useAddTraining() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => staffApi.addTraining(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['training'] }); qc.invalidateQueries({ queryKey: ['staff'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Training record added'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to add training') });
}
export function useComplianceActions(params?: object) {
  return useQuery({ queryKey: ['compliance-actions', params], queryFn: () => complianceApi.listActions(params).then(r => r.data) });
}
export function useCreateComplianceAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => complianceApi.createAction(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['compliance-actions'] }); toast.success('Compliance action created'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed') });
}
export function useUpdateComplianceAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => complianceApi.updateAction(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['compliance-actions'] }); toast.success('Action updated'); } });
}
export function useFamilyMessages(params?: object) {
  return useQuery({ queryKey: ['family-messages', params], queryFn: () => familyApi.listMessages(params).then(r => r.data), refetchInterval: 30_000 });
}
export function useSendFamilyMessage() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => familyApi.sendMessage(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['family-messages'] }); toast.success('Message sent'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to send') });
}
export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => familyApi.markRead(id).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['family-messages'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); } });
}
export function useInvoices(params?: object) {
  return useQuery({ queryKey: ['invoices', params], queryFn: () => billingApi.listInvoices(params).then(r => Array.isArray(r.data) ? r.data : (r.data?.invoices ?? r.data)) });
}
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => billingApi.createInvoice(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed') });
}
export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => billingApi.updateInvoice(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice updated'); } });
}
export function useBillingSummary() {
  return useQuery({ queryKey: ['billing-summary'], queryFn: () => billingApi.summary().then(r => r.data) });
}
export function useAuditLog(params?: object) {
  return useQuery({ queryKey: ['audit-log', params], queryFn: () => auditApi.list(params).then(r => r.data) });
}
export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => dashboardApi.get().then(r => r.data), refetchInterval: 120_000 });
}
export function useAiAnalyze() {
  return useMutation({ mutationFn: (data: object) => aiApi.analyze(data).then(r => r.data), onError: (err: any) => toast.error(err.response?.data?.error || 'AI analysis failed') });
}
export function useAiSuggest() {
  return useMutation({ mutationFn: (data: object) => aiApi.suggest(data).then(r => r.data), onError: (err: any) => toast.error(err.response?.data?.error || 'AI suggestion failed') });
}
export function usePolicies(params?: object) {
  return useQuery({ queryKey: ['policies', params], queryFn: () => policiesApi.list(params).then(r => r.data) });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => billingApi.updateInvoice(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed') });
}

// ── Care Tasks ────────────────────────────────────────────────────────────
export function useTasks(params?: object) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get('/tasks', { params }).then(r => r.data),
    refetchInterval: 60_000, // auto-refresh every 60s for status changes
    staleTime: 30_000,
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.post(`/tasks/${id}/complete`, { notes }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'], exact: false }),
  });
}

export function useDeferTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/tasks/${id}/defer`, { reason }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'], exact: false }),
  });
}

export function useStartTask() {
  return useMutation({
    mutationFn: (id: string) => api.post(`/tasks/${id}/start`).then(r => r.data),
  });
}

export function useReleaseTask() {
  return useMutation({
    mutationFn: (id: string) => api.post(`/tasks/${id}/release`).then(r => r.data),
  });
}

export function useGenerateTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date?: string) => api.post('/tasks/generate', {}, { params: { date } }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'], exact: false }),
  });
}

// ── Activities ────────────────────────────────────────────────────────────
export function useActivities(params?: object) {
  return useQuery({ queryKey: ['activities', params], queryFn: () => activitiesApi.list(params).then(r => r.data) });
}
export function useActivity(id: string) {
  return useQuery({ queryKey: ['activities', id], queryFn: () => activitiesApi.get(id).then(r => r.data), enabled: !!id });
}
export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => activitiesApi.create(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Activity created'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create activity') });
}
export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => activitiesApi.update(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Activity updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update activity') });
}
export function useSessions(params?: object) {
  return useQuery({ queryKey: ['activity-sessions', params], queryFn: () => activitiesApi.listSessions(params).then(r => r.data) });
}
export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => activitiesApi.createSession(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['activity-sessions'] }); toast.success('Session scheduled'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create session') });
}
export function useSessionParticipants(sessionId: string) {
  return useQuery({ queryKey: ['session-participants', sessionId], queryFn: () => activitiesApi.getParticipants(sessionId).then(r => r.data), enabled: !!sessionId });
}
export function useAddParticipant() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ sessionId, data }: { sessionId: string; data: object }) => activitiesApi.addParticipant(sessionId, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['session-participants'] }); qc.invalidateQueries({ queryKey: ['activity-sessions'] }); toast.success('Participant added'); }, onError: (err: any) => toast.error(err.response?.data?.message || err.response?.data?.error || 'Cannot add participant') });
}
export function useUpdateParticipant() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ sessionId, residentId, data }: { sessionId: string; residentId: string; data: object }) => activitiesApi.updateParticipant(sessionId, residentId, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['session-participants'] }); toast.success('Participant updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update') });
}
export function useEligibleResidents(activityId: string) {
  return useQuery({ queryKey: ['eligible-residents', activityId], queryFn: () => activitiesApi.eligibleResidents(activityId).then(r => r.data), enabled: !!activityId });
}
export function useResidentActivityHistory(residentId: string) {
  return useQuery({ queryKey: ['resident-activities', residentId], queryFn: () => activitiesApi.residentHistory(residentId).then(r => r.data), enabled: !!residentId });
}
export function useWellbeingDashboard() {
  return useQuery({ queryKey: ['wellbeing-dashboard'], queryFn: () => activitiesApi.wellbeingDashboard().then(r => r.data) });
}

// ── Wellbeing Tracking ────────────────────────────────────────────────────
export function useLogWellbeing() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => wellbeingApi.log(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['wellbeing'] }); qc.invalidateQueries({ queryKey: ['wellbeing-overview'] }); toast.success('Wellbeing logged'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to log wellbeing') });
}
export function useResidentWellbeing(residentId: string, days?: number) {
  return useQuery({ queryKey: ['wellbeing', residentId, days], queryFn: () => wellbeingApi.getResidentWellbeing(residentId, days).then(r => r.data), enabled: !!residentId });
}
export function useWellbeingOverview() {
  return useQuery({ queryKey: ['wellbeing-overview'], queryFn: () => wellbeingApi.getOverview().then(r => r.data), refetchInterval: 60_000 });
}
export function useResidentLifeStory(residentId: string) {
  return useQuery({ queryKey: ['life-story', residentId], queryFn: () => wellbeingApi.getLifeStory(residentId).then(r => r.data), enabled: !!residentId });
}
export function useUpdateLifeStory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ residentId, data }: { residentId: string; data: object }) => wellbeingApi.updateLifeStory(residentId, data).then(r => r.data), onSuccess: (_: any, vars: any) => { qc.invalidateQueries({ queryKey: ['life-story', vars.residentId] }); toast.success('Life story updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update life story') });
}
export function useSocialIsolationAlerts(status?: string) {
  return useQuery({ queryKey: ['isolation-alerts', status], queryFn: () => wellbeingApi.getIsolationAlerts(status).then(r => r.data) });
}
export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => wellbeingApi.acknowledgeAlert(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['isolation-alerts'] }); toast.success('Alert updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update alert') });
}
export function useEnvironmentPreferences(residentId: string) {
  return useQuery({ queryKey: ['environment', residentId], queryFn: () => wellbeingApi.getEnvironment(residentId).then(r => r.data), enabled: !!residentId });
}
export function useUpdateEnvironmentPreferences() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ residentId, data }: { residentId: string; data: object }) => wellbeingApi.updateEnvironment(residentId, data).then(r => r.data), onSuccess: (_: any, vars: any) => { qc.invalidateQueries({ queryKey: ['environment', vars.residentId] }); toast.success('Environment preferences updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update') });
}

// ── Predictive Care ───────────────────────────────────────────────────────
export function usePredictiveRiskDashboard() {
  return useQuery({ queryKey: ['predictive-dashboard'], queryFn: () => predictiveApi.getDashboard().then(r => r.data) });
}
export function usePredictiveAlerts() {
  return useQuery({ queryKey: ['predictive-alerts'], queryFn: () => predictiveApi.getAlerts().then(r => r.data) });
}
export function useResidentRiskHistory(residentId: string) {
  return useQuery({ queryKey: ['predictive-history', residentId], queryFn: () => predictiveApi.getResidentHistory(residentId).then(r => r.data), enabled: !!residentId });
}
export function useRunPredictiveAnalysis() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => predictiveApi.runAnalysis().then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['predictive-dashboard'] }); qc.invalidateQueries({ queryKey: ['predictive-alerts'] }); toast.success('Analysis complete'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Analysis failed') });
}
export function useAcknowledgePredictiveAlert() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => predictiveApi.acknowledgeAlert(id).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['predictive-alerts'] }); toast.success('Alert acknowledged'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to acknowledge alert') });
}

// ── Family Portal (Enhanced) ──────────────────────────────────────────────
export function useFamilyDashboard(residentId: string) {
  return useQuery({ queryKey: ['family-dashboard', residentId], queryFn: () => familyApi.getDashboard(residentId).then(r => r.data), enabled: !!residentId });
}
export function useFamilyDailySummary(residentId: string, date?: string) {
  return useQuery({ queryKey: ['family-daily-summary', residentId, date], queryFn: () => familyApi.getDailySummary(residentId, date).then(r => r.data), enabled: !!residentId });
}
export function useGenerateDailySummary() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ residentId, date }: { residentId: string; date?: string }) => familyApi.generateDailySummary(residentId, date).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['family-daily-summary'] }); qc.invalidateQueries({ queryKey: ['family-dashboard'] }); toast.success('Daily summary generated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to generate summary') });
}
export function useFamilyWeeklyReport(residentId: string, weekStart?: string) {
  return useQuery({ queryKey: ['family-weekly-report', residentId, weekStart], queryFn: () => familyApi.getWeeklyReport(residentId, weekStart).then(r => r.data), enabled: !!residentId });
}
export function useGenerateWeeklyReports() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => familyApi.generateWeeklyReports().then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['family-weekly-report'] }); toast.success('Weekly reports generated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to generate reports') });
}
export function useFamilyPhotos(residentId: string) {
  return useQuery({ queryKey: ['family-photos', residentId], queryFn: () => familyApi.listPhotos(residentId).then(r => r.data), enabled: !!residentId });
}
export function useUploadFamilyPhoto() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ residentId, formData }: { residentId: string; formData: FormData }) => familyApi.uploadPhoto(residentId, formData).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['family-photos'] }); qc.invalidateQueries({ queryKey: ['family-dashboard'] }); toast.success('Photo uploaded'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to upload photo') });
}

// ── CQC Compliance ────────────────────────────────────────────────────────
export function useCqcDomainScores() {
  return useQuery({ queryKey: ['cqc-scores'], queryFn: () => complianceApi.getCqcScores().then(r => r.data) });
}
export function useCalculateCqcScores() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => complianceApi.calculateCqcScores().then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cqc-scores'] }); qc.invalidateQueries({ queryKey: ['compliance-overview'] }); toast.success('CQC scores calculated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to calculate scores') });
}
export function useGenerateEvidencePack() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => complianceApi.generateEvidencePack(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['evidence-packs'] }); toast.success('Evidence pack generated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to generate evidence pack') });
}
export function useCqcEvidencePacks() {
  return useQuery({ queryKey: ['evidence-packs'], queryFn: () => complianceApi.getEvidencePacks().then(r => r.data) });
}
export function usePolicyReviews() {
  return useQuery({ queryKey: ['policy-reviews'], queryFn: () => complianceApi.getPolicyReviews().then(r => r.data) });
}
export function useCreatePolicyReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => complianceApi.createPolicyReview(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['policy-reviews'] }); toast.success('Policy review recorded'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to record review') });
}
export function useInspectionChecklist(domain: string) {
  return useQuery({ queryKey: ['inspection-checklist', domain], queryFn: () => complianceApi.getInspectionChecklist(domain).then(r => r.data), enabled: !!domain });
}
export function useUpdateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => complianceApi.updateChecklistItem(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['inspection-checklist'] }); toast.success('Checklist updated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update checklist') });
}
export function useComplianceOverview() {
  return useQuery({ queryKey: ['compliance-overview'], queryFn: () => complianceApi.getOverview().then(r => r.data) });
}

// ── Voice Notes ───────────────────────────────────────────────────────────
export function useVoiceHistory() {
  return useQuery({ queryKey: ['voice-history'], queryFn: () => voiceApi.getHistory().then(r => r.data) });
}
export function useCreateNoteFromVoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => voiceApi.createNote(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['voice-history'] }); qc.invalidateQueries({ queryKey: ['care-notes'] }); toast.success('Care note created from voice'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create note from voice') });
}

// ── SBAR Handover ─────────────────────────────────────────────────────────
export function useSbarHandovers() {
  return useQuery({ queryKey: ['sbar-handovers'], queryFn: () => sbarApi.list().then(r => r.data) });
}
export function useGenerateSbar() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => sbarApi.generate(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['sbar-handovers'] }); toast.success('SBAR handover generated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to generate SBAR handover') });
}
export function useApproveSbar() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => sbarApi.approve(id).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['sbar-handovers'] }); toast.success('Handover approved'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to approve handover') });
}

// ── NEWS2 ─────────────────────────────────────────────────────────────────
export function useNews2Calculate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => news2Api.calculate(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['news2'] }); toast.success('NEWS2 score calculated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to calculate NEWS2') });
}
export function useNews2History(residentId: string) {
  return useQuery({ queryKey: ['news2', 'history', residentId], queryFn: () => news2Api.getHistory(residentId).then(r => r.data), enabled: !!residentId });
}
export function useNews2Escalations(params?: object) {
  return useQuery({ queryKey: ['news2', 'escalations', params], queryFn: () => news2Api.getEscalations(params).then(r => r.data) });
}
export function useRespondToEscalation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => news2Api.respondToEscalation(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['news2'] }); toast.success('Escalation updated'); } });
}
export function useNews2Trend(residentId: string, days?: number) {
  return useQuery({ queryKey: ['news2', 'trend', residentId, days], queryFn: () => news2Api.getTrend(residentId, days).then(r => r.data), enabled: !!residentId });
}

// ── Wounds ────────────────────────────────────────────────────────────────
export function useCreateWound() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (formData: FormData) => woundsApi.create(formData).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['wounds'] }); toast.success('Wound assessment recorded'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to record wound') });
}
export function useActiveWounds() {
  return useQuery({ queryKey: ['wounds', 'active'], queryFn: () => woundsApi.listActive().then(r => r.data) });
}
export function useWoundTimeline(residentId: string, locationBodyArea?: string) {
  return useQuery({ queryKey: ['wounds', 'timeline', residentId, locationBodyArea], queryFn: () => woundsApi.getTimeline(residentId, locationBodyArea).then(r => r.data), enabled: !!residentId });
}
export function useWoundBodyMap(residentId: string) {
  return useQuery({ queryKey: ['wounds', 'bodymap', residentId], queryFn: () => woundsApi.getBodyMap(residentId).then(r => r.data), enabled: !!residentId });
}
export function useUpdateWound() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => woundsApi.update(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['wounds'] }); toast.success('Wound updated'); } });
}

// ── Infections ────────────────────────────────────────────────────────────
export function useCreateOutbreak() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => infectionsApi.createOutbreak(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['infections'] }); toast.success('Outbreak reported'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create outbreak') });
}
export function useOutbreaks(params?: object) {
  return useQuery({ queryKey: ['infections', 'outbreaks', params], queryFn: () => infectionsApi.listOutbreaks(params).then(r => r.data) });
}
export function useOutbreakDetails(id: string) {
  return useQuery({ queryKey: ['infections', 'outbreak', id], queryFn: () => infectionsApi.getOutbreak(id).then(r => r.data), enabled: !!id });
}
export function useAddInfectionCase() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ outbreakId, data }: { outbreakId: string; data: object }) => infectionsApi.addCase(outbreakId, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['infections'] }); toast.success('Case added'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to add case') });
}
export function useUpdateInfectionCase() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => infectionsApi.updateCase(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['infections'] }); toast.success('Case updated'); } });
}
export function useUpdateOutbreakStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => infectionsApi.updateOutbreakStatus(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['infections'] }); toast.success('Outbreak status updated'); } });
}

// ── Continence ────────────────────────────────────────────────────────────
export function useLogContinence() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => continenceApi.logEvent(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['continence'] }); toast.success('Continence event logged'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to log event') });
}
export function useContinenceLog(residentId: string, days?: number) {
  return useQuery({ queryKey: ['continence', 'log', residentId, days], queryFn: () => continenceApi.getResidentLog(residentId, days).then(r => r.data), enabled: !!residentId });
}
export function useContinencePatterns(residentId: string) {
  return useQuery({ queryKey: ['continence', 'patterns', residentId], queryFn: () => continenceApi.getPatterns(residentId).then(r => r.data), enabled: !!residentId });
}
export function useContinenceAssessment(residentId: string) {
  return useQuery({ queryKey: ['continence', 'assessment', residentId], queryFn: () => continenceApi.getAssessment(residentId).then(r => r.data), enabled: !!residentId });
}
export function useCreateContinenceAssessment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => continenceApi.createAssessment(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['continence'] }); toast.success('Assessment saved'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to save assessment') });
}
export function useContinenceOverview() {
  return useQuery({ queryKey: ['continence', 'overview'], queryFn: () => continenceApi.getOverview().then(r => r.data) });
}

// -- Smart Rota --
export function useGenerateRota() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => smartRotaApi.generate(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['smart-rota'] }); toast.success('Rota generated successfully'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to generate rota') });
}
export function useRotaTemplates() {
  return useQuery({ queryKey: ['smart-rota', 'templates'], queryFn: () => smartRotaApi.listTemplates().then(r => r.data) });
}
export function useRotaTemplate(id: string) {
  return useQuery({ queryKey: ['smart-rota', 'template', id], queryFn: () => smartRotaApi.getTemplate(id).then(r => r.data), enabled: !!id });
}
export function useUpdateRotaShift() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: object }) => smartRotaApi.updateShift(id, data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['smart-rota'] }); toast.success('Shift updated'); } });
}
export function usePublishRota() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => smartRotaApi.publish(id).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['smart-rota'] }); qc.invalidateQueries({ queryKey: ['schedule'] }); toast.success('Rota published'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to publish rota') });
}
export function useRotaConstraints() {
  return useQuery({ queryKey: ['smart-rota', 'constraints'], queryFn: () => smartRotaApi.getConstraints().then(r => r.data) });
}

// -- Natural Language Search --
export function useNlSearch() {
  return useMutation({ mutationFn: (query: string) => nlSearchApi.search(query).then(r => r.data), onError: (err: any) => toast.error(err.response?.data?.error || 'Search failed') });
}
export function useSearchHistory() {
  return useQuery({ queryKey: ['search-history'], queryFn: () => nlSearchApi.getHistory().then(r => r.data) });
}

// -- Risk Assessments --
export function useCalculateWaterlow() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (residentId: string) => riskAssessmentsApi.calculateWaterlow(residentId).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['risk-assessments'] }); toast.success('Waterlow score calculated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to calculate Waterlow') });
}
export function useCalculateMUST() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: object) => riskAssessmentsApi.calculateMUST(data).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['risk-assessments'] }); toast.success('MUST score calculated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to calculate MUST') });
}
export function useCalculateFallsRisk2() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (residentId: string) => riskAssessmentsApi.calculateFalls(residentId).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['risk-assessments'] }); toast.success('Falls risk calculated'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to calculate falls risk') });
}
export function useResidentRiskAssessments(residentId: string) {
  return useQuery({ queryKey: ['risk-assessments', residentId], queryFn: () => riskAssessmentsApi.getResidentAssessments(residentId).then(r => r.data), enabled: !!residentId });
}
export function useOverdueRiskReviews() {
  return useQuery({ queryKey: ['risk-assessments', 'overdue'], queryFn: () => riskAssessmentsApi.getOverdue().then(r => r.data) });
}
export function useRiskOverview() {
  return useQuery({ queryKey: ['risk-assessments', 'overview'], queryFn: () => riskAssessmentsApi.getOverview().then(r => r.data) });
}

// -- Medication Interactions --
export function useCheckMedInteractions() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (residentId: string) => medInteractionsApi.check(residentId).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['med-interactions'] }); toast.success('Interaction check complete'); }, onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to check interactions') });
}
export function useResidentMedInteractions(residentId: string) {
  return useQuery({ queryKey: ['med-interactions', residentId], queryFn: () => medInteractionsApi.getResidentInteractions(residentId).then(r => r.data), enabled: !!residentId });
}
export function useAcknowledgeMedInteraction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => medInteractionsApi.acknowledge(id).then(r => r.data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['med-interactions'] }); toast.success('Interaction acknowledged'); } });
}
export function useMedInteractionAlerts() {
  return useQuery({ queryKey: ['med-interactions', 'alerts'], queryFn: () => medInteractionsApi.getAlerts().then(r => r.data) });
}
