// src/hooks/index.ts — All hooks for CareVista
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api, residentsApi, notesApi, emarApi, incidentsApi,
  scheduleApi, staffApi, complianceApi, familyApi,
  billingApi, aiApi, dashboardApi, auditApi, policiesApi,
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
