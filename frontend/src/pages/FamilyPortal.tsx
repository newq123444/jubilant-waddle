// src/pages/FamilyPortal.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useResidents } from '../hooks';
import { formatDateTime } from '../utils/formatters';
import type { Resident } from '../types';

export default function FamilyPortal() {
  const qc = useQueryClient();
  const [tab, setTab]               = useState<'inbox'|'sent'>('inbox');
  const [residentFilter, setFilter] = useState('');
  const [showCompose, setCompose]   = useState(false);

  const { data: rawResidents = [] } = useResidents({ active: true });
  const residents: Resident[] = Array.isArray(rawResidents) ? rawResidents : (rawResidents as any)?.residents ?? [];

  const { data: rawMessages = [], isLoading } = useQuery({
    queryKey: ['family-messages', residentFilter],
    queryFn: () => api.get('/family/messages', { params:{ residentId:residentFilter||undefined } }).then(r=>r.data),
    refetchInterval: 30_000,
  });
  const messages: any[] = Array.isArray(rawMessages) ? rawMessages : [];
  const unread = messages.filter(m => !m.read_at && m.direction==='inbound').length;

  const markRead = useMutation({
    mutationFn: (id:string) => api.patch(`/family/messages/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey:['family-messages'] }),
  });

  const filtered = messages.filter(m => tab==='inbox' ? m.direction==='inbound' : m.direction==='outbound');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💬 Family Portal</h1>
          <p className="page-subtitle">{messages.length} messages{unread>0?` · ${unread} unread`:''}</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setCompose(true)}>✉️ Send Message</button>
      </div>

      {unread>0&&(
        <div style={{ padding:'10px 16px', borderRadius:10, background:'#eff6ff', border:'1px solid #bfdbfe', marginBottom:16, display:'flex', alignItems:'center', gap:10, fontSize:13 }}>
          <span>💬</span>
          <span style={{ color:'#1d4ed8', fontWeight:600 }}>{unread} unread message{unread!==1?'s':''} from families</span>
          <button onClick={()=>messages.filter(m=>!m.read_at&&m.direction==='inbound').forEach(m=>markRead.mutate(m.id))}
            style={{ marginLeft:'auto', fontSize:12, color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Mark all read</button>
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <select className="form-input" value={residentFilter} onChange={e=>setFilter(e.target.value)} style={{ flex:'1 1 200px', maxWidth:280 }}>
          <option value="">All Residents</option>
          {residents.map(r=><option key={r.id} value={r.id}>{r.first_name} {r.last_name} — Rm {r.room_number}</option>)}
        </select>
        <div style={{ display:'flex', gap:6 }}>
          {(['inbox','sent'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${tab===t?'#2563eb':'var(--border)'}`, background:tab===t?'#eff6ff':'white', color:tab===t?'#2563eb':'var(--text-muted)', cursor:'pointer', fontSize:13, fontWeight:tab===t?700:400 }}>
              {t==='inbox'?'📥 Inbox':'📤 Sent'}
              {t==='inbox'&&unread>0&&<span style={{ marginLeft:6, background:'#dc2626', color:'white', borderRadius:10, fontSize:10, padding:'1px 5px', fontWeight:700 }}>{unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {isLoading?(
        <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading…</div>
      ):filtered.length===0?(
        <div className="card"><div className="card-body table-empty">No messages found</div></div>
      ):(
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map((m:any)=>{
            const isUnread = !m.read_at && m.direction==='inbound';
            return(
              <div key={m.id} className="card" style={{ borderLeft:`4px solid ${isUnread?'#2563eb':'transparent'}`, cursor:isUnread?'pointer':'default' }}
                onClick={()=>isUnread&&markRead.mutate(m.id)}>
                <div className="card-body">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, gap:12 }}>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                      {isUnread&&<span className="badge badge-blue" style={{ fontSize:10 }}>NEW</span>}
                      <span style={{ fontSize:13, fontWeight:700 }}>{m.subject||'No subject'}</span>
                      {m.resident_name&&<span className="badge badge-neutral" style={{ fontSize:11 }}>👤 {m.resident_name}</span>}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', flexShrink:0, textAlign:'right' }}>
                      <div>{m.direction==='inbound'?`From: ${m.sender_name||m.sender_email}`:`To: ${m.recipient_name}`}</div>
                      <div>{formatDateTime(m.created_at)}</div>
                    </div>
                  </div>
                  <p style={{ fontSize:13, lineHeight:1.7, color:'var(--text-secondary)', margin:0 }}>{m.body?.slice(0,300)}{m.body?.length>300?'…':''}</p>
                  {m.direction==='inbound'&&(
                    <div style={{ marginTop:10 }}>
                      <button onClick={e=>{e.stopPropagation();setCompose(true);}} style={{ padding:'5px 14px', borderRadius:8, border:'1px solid #bfdbfe', background:'#eff6ff', color:'#2563eb', cursor:'pointer', fontSize:12, fontWeight:600 }}>↩️ Reply</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCompose&&<ComposeModal residents={residents} onClose={()=>setCompose(false)} qc={qc}/>}
    </div>
  );
}

function ComposeModal({ residents, onClose, qc }: any) {
  const [form, setForm]   = useState({ residentId:'', recipientName:'', recipientEmail:'', subject:'', body:'' });
  const [saving, setSaving] = useState(false);
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}));

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/family/messages', form);
      qc.invalidateQueries({ queryKey:['family-messages'] });
      onClose();
    } catch (err:any) { alert(err?.response?.data?.error||'Failed to send'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header"><h2 className="modal-title">✉️ Send Message to Family</h2><button className="modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={send}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Regarding Resident *</label>
              <select className="form-input" required value={form.residentId} onChange={e=>set('residentId',e.target.value)}>
                <option value="">Select resident…</option>
                {residents.map((r:Resident)=><option key={r.id} value={r.id}>{r.first_name} {r.last_name} — Rm {r.room_number}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Recipient Name *</label><input className="form-input" required value={form.recipientName} onChange={e=>set('recipientName',e.target.value)} placeholder="e.g. John Smith (son)"/></div>
              <div className="form-group"><label className="form-label">Recipient Email *</label><input className="form-input" required type="email" value={form.recipientEmail} onChange={e=>set('recipientEmail',e.target.value)} placeholder="john@example.com"/></div>
            </div>
            <div className="form-group"><label className="form-label">Subject *</label><input className="form-input" required value={form.subject} onChange={e=>set('subject',e.target.value)} placeholder="Weekly update / Health update…"/></div>
            <div className="form-group"><label className="form-label">Message *</label><textarea className="form-input" required rows={8} value={form.body} onChange={e=>set('body',e.target.value)} placeholder="Dear [Name], I am writing to update you…" style={{ resize:'vertical' }}/></div>
            <div style={{ padding:'10px 12px', borderRadius:8, background:'var(--surface-2)', fontSize:12, color:'var(--text-muted)' }}>
              ℹ️ This message will be logged in the care record.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Sending…':'✉️ Send Message'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
