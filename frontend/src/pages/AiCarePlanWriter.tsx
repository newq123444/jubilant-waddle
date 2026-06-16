// src/pages/AiCarePlanWriter.tsx - AI Care Plan Writer
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export default function AiCarePlanWriter() {
  const [tab, setTab] = useState<'generate' | 'plans'>('generate');
  const [selectedResident, setSelectedResident] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: residents } = useQuery({ queryKey: ['residents'], queryFn: () => api.get('/residents').then(r => r.data) });
  const { data: plans, isLoading: plansLoading } = useQuery({ queryKey: ['ai-care-plans'], queryFn: () => api.get('/ai/care-plans').then(r => r.data) });

  const generateMutation = useMutation({
    mutationFn: (data: any) => api.post('/ai/care-plan/generate', data).then(r => r.data),
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['ai-care-plans'] }); setSelectedPlan(data); setTab('plans'); },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/ai/care-plans/${id}/approve`, { status }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-care-plans'] }),
  });

  const handleGenerate = () => {
    if (!selectedResident) return;
    generateMutation.mutate({ residentId: selectedResident });
  };

  const cqcDomainColors: Record<string, string> = { safe: '#dc2626', effective: '#2563eb', caring: '#ec4899', responsive: '#d97706', well_led: '#7c3aed' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Care Plan Writer</h1>
          <p className="page-subtitle">Generate CQC-compliant care plans from assessment data using AI</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
        {([['generate', '✨ Generate New'], ['plans', '📋 Care Plans']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: `2px solid ${tab === k ? '#7c3aed' : 'transparent'}`, color: tab === k ? '#7c3aed' : 'var(--text-secondary)', fontWeight: tab === k ? 700 : 500, cursor: 'pointer', fontSize: 14, marginBottom: -2 }}>{l}</button>
        ))}
      </div>

      {tab === 'generate' && (
        <div style={{ maxWidth: 700 }}>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Select Resident</h3>
            <select value={selectedResident} onChange={e => setSelectedResident(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}>
              <option value="">Choose a resident...</option>
              {residents?.map((r: any) => (
                <option key={r.id} value={r.id}>{r.first_name} {r.last_name} - Room {r.room_number}</option>
              ))}
            </select>
          </div>

          <button onClick={handleGenerate} disabled={!selectedResident || generateMutation.isPending} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: (!selectedResident || generateMutation.isPending) ? 0.5 : 1 }}>
            {generateMutation.isPending ? '⏳ Generating...' : '🤖 Generate AI Care Plan'}
          </button>

          {generateMutation.isError && (
            <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>Failed to generate care plan. Please try again.</div>
          )}
        </div>
      )}

      {tab === 'plans' && (
        <div>
          {selectedPlan && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>📄 {selectedPlan.resident_name || 'Care Plan'}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedPlan.status === 'draft' && (
                    <>
                      <button onClick={() => approveMutation.mutate({ id: selectedPlan.id, status: 'approved' })} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✓ Approve</button>
                      <button onClick={() => approveMutation.mutate({ id: selectedPlan.id, status: 'rejected' })} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✗ Reject</button>
                    </>
                  )}
                  <button onClick={() => setSelectedPlan(null)} style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Close</button>
                </div>
              </div>

              {selectedPlan.content && typeof selectedPlan.content === 'object' && selectedPlan.content.cqc_domains && (
                <div style={{ display: 'grid', gap: 16 }}>
                  {Object.entries(selectedPlan.content.cqc_domains).map(([key, domain]: [string, any]) => (
                    <div key={key} style={{ padding: 16, borderRadius: 10, border: `2px solid ${cqcDomainColors[key] || '#e5e7eb'}20`, background: `${cqcDomainColors[key] || '#6b7280'}08` }}>
                      <h4 style={{ margin: '0 0 8px', color: cqcDomainColors[key] || '#374151', fontSize: 15 }}>{domain.title}</h4>
                      <div style={{ fontSize: 13 }}>
                        <strong>Goals:</strong>
                        <ul style={{ margin: '4px 0 8px', paddingLeft: 20 }}>{domain.goals?.map((g: string, i: number) => <li key={i}>{g}</li>)}</ul>
                        <strong>Interventions:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>{domain.interventions?.map((g: string, i: number) => <li key={i}>{g}</li>)}</ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {plansLoading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading care plans...</div>}
          {!plansLoading && (
            <div style={{ display: 'grid', gap: 12 }}>
              {plans?.map((plan: any) => (
                <div key={plan.id} className="card" onClick={() => setSelectedPlan(plan)} style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{plan.resident_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Version {plan.version} - Generated by {plan.generated_by_name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: plan.status === 'approved' ? '#dcfce7' : plan.status === 'rejected' ? '#fef2f2' : '#f3f4f6', color: plan.status === 'approved' ? '#16a34a' : plan.status === 'rejected' ? '#dc2626' : '#6b7280' }}>{plan.status.toUpperCase()}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(plan.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              ))}
              {plans?.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No care plans generated yet. Use the Generate tab to create one.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
