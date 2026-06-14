import React, { useState } from 'react';
import { useComplianceActions, useCreateComplianceAction, useUpdateComplianceAction } from '../hooks';
import { formatDate } from '../utils/formatters';
import type { ComplianceAction } from '../types';

const KLOE_DOMAINS = ['Safe','Effective','Caring','Responsive','Well-led'];
const PRIORITIES = ['low','medium','high','critical'];

export default function Compliance() {
  const { data: actions = [], isLoading } = useComplianceActions();
  const createAction = useCreateComplianceAction();
  const updateAction = useUpdateComplianceAction();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'Safe', priority: 'medium', due_date: '' });

  const arr = Array.isArray(actions) ? actions as ComplianceAction[] : [];
  const filtered = arr.filter(a => !filterStatus || a.status === filterStatus);
  const overdue = arr.filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== 'closed').length;
  const open = arr.filter(a => a.status !== 'closed').length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAction.mutateAsync(form);
    setShowCreate(false);
    setForm({ title: '', description: '', category: 'Safe', priority: 'medium', due_date: '' });
  };

  const pc = (p: string) => p === 'critical' ? '#7c3aed' : p === 'high' ? '#dc2626' : p === 'medium' ? '#d97706' : '#16a34a';
  const pb = (p: string) => p === 'critical' ? '#f5f3ff' : p === 'high' ? '#fef2f2' : p === 'medium' ? '#fffbeb' : '#f0fdf4';
  const sc = (s: string) => s === 'closed' ? '#16a34a' : s === 'in_progress' ? '#2563eb' : '#d97706';

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">✅ CQC Compliance</h1><p className="page-subtitle">{open} open · {overdue} overdue</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Action</button>
      </div>

      {/* Domain scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
        {KLOE_DOMAINS.map(d => {
          const domainActions = arr.filter(a => a.category === d);
          const closed = domainActions.filter(a => a.status === 'closed').length;
          const total = domainActions.length;
          const score = total > 0 ? Math.round(closed / total * 100) : 100;
          const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
          return (
            <div key={d} className="card" style={{ borderTop: `3px solid ${color}` }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{d}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{score}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{closed}/{total} complete</div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20, border: '2px solid #3b82f6' }}>
          <div className="card-header"><span className="card-title">+ New Compliance Action</span><button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>✕</button></div>
          <div className="card-body">
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}><label className="form-label">Title *</label><input type="text" className="form-input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Action title…" /></div>
              <div><label className="form-label">Domain</label><select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{KLOE_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="form-label">Priority</label><select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div><label className="form-label">Due Date</label><input type="date" className="form-input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
              <div></div>
              <div style={{ gridColumn: '1/-1' }}><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div style={{ gridColumn: '1/-1' }}><button type="submit" className="btn btn-primary" disabled={createAction.isPending}>{createAction.isPending ? 'Saving…' : 'Create Action'}</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-body" style={{ display: 'flex', gap: 10 }}>
          {['', 'open', 'in_progress', 'closed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 14px', borderRadius: 20, border: `2px solid ${filterStatus === s ? '#3b82f6' : 'var(--border)'}`, background: filterStatus === s ? '#eff6ff' : 'white', color: filterStatus === s ? '#2563eb' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: filterStatus === s ? 700 : 400 }}>{s || 'All'}</button>
          ))}
        </div>
      </div>

      {isLoading ? <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((a: ComplianceAction) => (
            <div key={a.id} className="card" style={{ borderLeft: `4px solid ${pc(a.priority)}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 18px', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: pb(a.priority), color: pc(a.priority), fontWeight: 700 }}>{a.priority}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--surface-2)', color: sc(a.status), fontWeight: 700 }}>{a.status.replace('_',' ')}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>{a.category}</span>
                  </div>
                  {a.description && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{a.description}</div>}
                  {a.due_date && <div style={{ fontSize: 12, color: new Date(a.due_date) < new Date() && a.status !== 'closed' ? '#dc2626' : 'var(--text-muted)' }}>Due: {formatDate(a.due_date)}{new Date(a.due_date) < new Date() && a.status !== 'closed' ? ' ⚠️ OVERDUE' : ''}</div>}
                </div>
                {a.status !== 'closed' && (
                  <button onClick={() => updateAction.mutateAsync({ id: a.id, data: { status: a.status === 'open' ? 'in_progress' : 'closed' } })} className="btn btn-ghost btn-sm">
                    {a.status === 'open' ? '▶ Start' : '✅ Close'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>✅ No compliance actions found</div>}
        </div>
      )}
    </div>
  );
}
