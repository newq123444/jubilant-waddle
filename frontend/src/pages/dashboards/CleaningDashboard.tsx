// src/pages/dashboards/CleaningDashboard.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useDashboard } from '../../hooks';
import FacilityMap from '../../components/FacilityMap';
import StaffWellnessWidget from '../../components/StaffWellnessWidget';

export default function CleaningDashboard() {
  const { user } = useAuthStore();
  const { data: dash } = useDashboard();
  const [selectedFloor, setSelectedFloor] = useState<string>('all');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Room data aligned with FacilityMap - single source of truth
  const rooms = [
    { room: '1', resident: 'Margaret Hollis', status: 'clean', lastCleaned: '07:45', floor: 'ground' },
    { room: '2', resident: 'Arthur Pemberton', status: 'needs-attention', lastCleaned: '06:30', floor: 'ground' },
    { room: '3', resident: 'Dorothy Sinclair', status: 'clean', lastCleaned: '08:10', floor: 'ground' },
    { room: '4', resident: 'Harold Fletcher', status: 'overdue', lastCleaned: 'Yesterday 14:00', floor: 'ground' },
    { room: '5', resident: 'Edith Turner', status: 'clean', lastCleaned: '07:20', floor: 'ground' },
    { room: '6', resident: 'Reginald Barnes', status: 'clean', lastCleaned: '08:00', floor: 'ground' },
    { room: '7', resident: 'Vera Chapman', status: 'needs-attention', lastCleaned: '06:45', floor: 'ground' },
    { room: '8', resident: null, status: 'clean', lastCleaned: '08:00', floor: 'ground' },
    { room: '9', resident: 'Elsie Hartley', status: 'clean', lastCleaned: '07:55', floor: 'first' },
    { room: '10', resident: 'Frederick Osborne', status: 'clean', lastCleaned: '08:15', floor: 'first' },
    { room: '11', resident: 'Agnes Whitfield', status: 'needs-attention', lastCleaned: '06:00', floor: 'first' },
    { room: '12', resident: 'George Bradshaw', status: 'overdue', lastCleaned: 'Yesterday 16:00', floor: 'first' },
    { room: '13', resident: 'Winifred Stanton', status: 'clean', lastCleaned: '08:05', floor: 'first' },
    { room: '14', resident: 'Ernest Higgins', status: 'clean', lastCleaned: '07:50', floor: 'first' },
    { room: '15', resident: null, status: 'clean', lastCleaned: '08:00', floor: 'first' },
    { room: '16', resident: 'Bertram Cross', status: 'clean', lastCleaned: '08:20', floor: 'first' },
    { room: '17', resident: 'Gladys Perkins', status: 'clean', lastCleaned: '07:50', floor: 'second' },
    { room: '18', resident: 'Norman Yates', status: 'needs-attention', lastCleaned: '06:15', floor: 'second' },
    { room: '19', resident: 'Florence Webb', status: 'clean', lastCleaned: '08:00', floor: 'second' },
    { room: '20', resident: 'Albert Moss', status: 'needs-attention', lastCleaned: '06:45', floor: 'second' },
    { room: '21', resident: 'Mabel Kirby', status: 'clean', lastCleaned: '07:55', floor: 'second' },
    { room: '22', resident: null, status: 'clean', lastCleaned: '08:00', floor: 'second' },
    { room: '23', resident: 'Cecil Rowlands', status: 'clean', lastCleaned: '08:10', floor: 'second' },
    { room: '24', resident: 'Iris Loveday', status: 'clean', lastCleaned: '07:30', floor: 'second' },
  ];

  const filteredRooms = selectedFloor === 'all' ? rooms : rooms.filter(r => r.floor === selectedFloor);
  const cleanCount = rooms.filter(r => r.status === 'clean').length;
  const attentionCount = rooms.filter(r => r.status === 'needs-attention').length;
  const overdueCount = rooms.filter(r => r.status === 'overdue').length;

  const ipacZones = [
    { zone: 'Ground Floor Corridor', score: 98, status: 'excellent' },
    { zone: 'First Floor Corridor', score: 92, status: 'good' },
    { zone: 'Second Floor Corridor', score: 87, status: 'good' },
    { zone: 'Dining Room', score: 95, status: 'excellent' },
    { zone: 'Lounge Area', score: 90, status: 'good' },
    { zone: 'Kitchen Area', score: 96, status: 'excellent' },
    { zone: 'Bathrooms (Shared)', score: 78, status: 'needs-improvement' },
    { zone: 'Laundry Room', score: 85, status: 'good' },
  ];

  const chemicals = [
    { name: 'Multi-Surface Cleaner', stock: 85, coshh: true, expiry: '2025-08-15', hazard: 'Low' },
    { name: 'Bleach Concentrate', stock: 60, coshh: true, expiry: '2025-06-30', hazard: 'High' },
    { name: 'Anti-Bacterial Spray', stock: 45, coshh: true, expiry: '2025-09-20', hazard: 'Medium' },
    { name: 'Floor Polish', stock: 30, coshh: true, expiry: '2025-07-10', hazard: 'Low' },
    { name: 'Window Cleaner', stock: 70, coshh: true, expiry: '2025-11-05', hazard: 'Low' },
    { name: 'Toilet Cleaner', stock: 55, coshh: true, expiry: '2025-05-28', hazard: 'High' },
    { name: 'Hand Sanitiser (Bulk)', stock: 90, coshh: false, expiry: '2026-01-15', hazard: 'Low' },
    { name: 'Disinfectant Wipes', stock: 25, coshh: false, expiry: '2025-04-20', hazard: 'Low' },
  ];

  const deepCleanSchedule = [
    { area: 'Room 4 (Harold Fletcher)', date: 'Today', priority: 'urgent', reason: 'Infection control' },
    { area: 'Room 12 (George Bradshaw)', date: 'Today', priority: 'high', reason: 'Weekly deep clean' },
    { area: 'Dining Room', date: 'Tomorrow', priority: 'medium', reason: 'Scheduled monthly' },
    { area: 'Main Lounge', date: 'Wed 15 Jan', priority: 'medium', reason: 'Scheduled monthly' },
    { area: 'Laundry Room', date: 'Thu 16 Jan', priority: 'low', reason: 'Quarterly deep clean' },
    { area: 'All Bathrooms', date: 'Fri 17 Jan', priority: 'high', reason: 'Weekly rotation' },
  ];

  const todayTasks = [
    { id: 1, task: 'Morning room checks - Ground floor', time: '07:00', done: true },
    { id: 2, task: 'Bathroom deep clean - Rooms 1-6', time: '08:00', done: true },
    { id: 3, task: 'Corridor mopping - All floors', time: '09:00', done: false },
    { id: 4, task: 'Dining room pre-lunch clean', time: '11:00', done: false },
    { id: 5, task: 'Afternoon room checks - First floor', time: '13:00', done: false },
    { id: 6, task: 'Laundry collection round', time: '14:00', done: false },
    { id: 7, task: 'Deep clean - Room 4 (infection control)', time: '15:00', done: false },
    { id: 8, task: 'Evening communal area tidy', time: '17:00', done: false },
  ];

  const auditScores = [
    { month: 'Aug', score: 88 },
    { month: 'Sep', score: 91 },
    { month: 'Oct', score: 89 },
    { month: 'Nov', score: 93 },
    { month: 'Dec', score: 95 },
    { month: 'Jan', score: 94 },
  ];

  const laundryStats = { soiled: 12, washing: 8, drying: 5, clean: 24, pending: 6 };

  const getStatusColor = (status: string) => {
    if (status === 'clean') return '#16a34a';
    if (status === 'needs-attention') return '#d97706';
    return '#dc2626';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'clean') return 'Clean';
    if (status === 'needs-attention') return 'Needs Attention';
    return 'Overdue';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'urgent') return '#dc2626';
    if (priority === 'high') return '#d97706';
    if (priority === 'medium') return '#2563eb';
    return '#6b7280';
  };

  const getIpacColor = (status: string) => {
    if (status === 'excellent') return '#16a34a';
    if (status === 'good') return '#2563eb';
    return '#d97706';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.firstName} 🧹</h1>
          <p className="page-subtitle">Cleaning &amp; Housekeeping · {today}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 12px', borderRadius: 20, background: '#14b8a620', border: '1px solid #14b8a640', fontSize: 12, fontWeight: 600, color: '#14b8a6' }}>
            Shift: 07:00 - 15:00
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Rooms Clean', value: `${cleanCount}/${rooms.length}`, icon: '✅', color: '#16a34a', sub: 'Today' },
          { label: 'Needs Attention', value: attentionCount.toString(), icon: '⚠️', color: '#d97706', sub: 'Requires action' },
          { label: 'Overdue', value: overdueCount.toString(), icon: '🚨', color: '#dc2626', sub: 'Immediate priority' },
          { label: 'Total Residents', value: dash?.residents?.active ?? '...', icon: '👥', color: '#2563eb', sub: `${rooms.length} rooms total` },
          { label: 'Tasks Done', value: `${todayTasks.filter(t => t.done).length}/${todayTasks.length}`, icon: '📋', color: '#7c3aed', sub: 'Today\'s progress' },
        ].map(k => (
          <div key={k.label} style={{ padding: '18px 16px', borderRadius: 12, background: 'white', border: '1px solid var(--border)', borderLeft: `4px solid ${k.color}`, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Facility Map */}
      <div style={{ marginBottom: 16 }}>
        <FacilityMap context="cleaning" />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Room Cleaning Status */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">🏠 Room Cleaning Schedule</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'ground', 'first', 'second'].map(f => (
                <button key={f} onClick={() => setSelectedFloor(f)} style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                  background: selectedFloor === f ? '#14b8a620' : 'transparent',
                  color: selectedFloor === f ? '#14b8a6' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
                }}>{f === 'all' ? 'All Floors' : `${f} Floor`}</button>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 320, overflowY: 'auto' }}>
            {filteredRooms.map(room => (
              <div key={room.room} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: getStatusColor(room.status) + '15', border: `1px solid ${getStatusColor(room.status)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: getStatusColor(room.status), flexShrink: 0 }}>
                  {room.room}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{room.resident || 'Vacant'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last cleaned: {room.lastCleaned}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: getStatusColor(room.status) + '15', color: getStatusColor(room.status) }}>
                  {getStatusLabel(room.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Task Checklist */}
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Today's Tasks</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {todayTasks.map(task => (
              <div key={task.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${task.done ? '#16a34a' : 'var(--border)'}`, background: task.done ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', flexShrink: 0 }}>
                  {task.done && '✓'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text-muted)' : 'inherit' }}>{task.task}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{task.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Infection Control Zones */}
        <div className="card">
          <div className="card-header"><span className="card-title">🛡️ Infection Control (IPAC) Compliance</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {ipacZones.map(zone => (
              <div key={zone.zone} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{zone.zone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ width: `${zone.score}%`, height: '100%', borderRadius: 3, background: getIpacColor(zone.status) }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getIpacColor(zone.status), minWidth: 32 }}>{zone.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chemical Stock - COSHH */}
        <div className="card">
          <div className="card-header"><span className="card-title">🧪 Chemical Stock (COSHH Compliant)</span></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 320, overflowY: 'auto' }}>
            {chemicals.map(chem => (
              <div key={chem.name} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {chem.name}
                    {chem.coshh && <span style={{ padding: '1px 5px', borderRadius: 4, background: '#7c3aed20', color: '#7c3aed', fontSize: 9, fontWeight: 700 }}>COSHH</span>}
                    {chem.hazard === 'High' && <span style={{ padding: '1px 5px', borderRadius: 4, background: '#dc262620', color: '#dc2626', fontSize: 9, fontWeight: 700 }}>HIGH HAZARD</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expires: {chem.expiry}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 50, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ width: `${chem.stock}%`, height: '100%', borderRadius: 3, background: chem.stock < 30 ? '#dc2626' : chem.stock < 50 ? '#d97706' : '#16a34a' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: chem.stock < 30 ? '#dc2626' : chem.stock < 50 ? '#d97706' : '#16a34a', minWidth: 28 }}>{chem.stock}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Deep Clean Calendar */}
        <div className="card">
          <div className="card-header"><span className="card-title">🗓️ Deep Clean Schedule</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {deepCleanSchedule.map((item, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getPriorityColor(item.priority), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{item.area}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.reason}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: item.date === 'Today' ? '#dc2626' : 'var(--text-muted)' }}>{item.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Score Tracker */}
        <div className="card">
          <div className="card-header"><span className="card-title">📈 Cleaning Audit Scores</span></div>
          <div className="card-body" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {auditScores.map(s => (
                <div key={s.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#14b8a6' }}>{s.score}%</span>
                  <div style={{ width: '100%', borderRadius: 4, background: '#14b8a6', height: `${(s.score - 80) * 6}px`, minHeight: 8 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.month}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 8, background: '#14b8a610', border: '1px solid #14b8a630' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#14b8a6' }}>Current Rating: Excellent</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>CQC domain: Safe environment - Outstanding</div>
            </div>
          </div>
        </div>

        {/* Laundry Management */}
        <div className="card">
          <div className="card-header"><span className="card-title">👕 Laundry Management</span></div>
          <div className="card-body" style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'Soiled (Awaiting)', value: laundryStats.soiled, color: '#dc2626', icon: '🧺' },
                { label: 'Washing', value: laundryStats.washing, color: '#2563eb', icon: '🌀' },
                { label: 'Drying', value: laundryStats.drying, color: '#d97706', icon: '☀️' },
                { label: 'Clean (Ready)', value: laundryStats.clean, color: '#16a34a', icon: '✅' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px', borderRadius: 8, background: s.color + '08', border: `1px solid ${s.color}20`, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#d9770610', border: '1px solid #d9770630' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#d97706' }}>{laundryStats.pending} items pending collection</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Next collection round: 14:00</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Wellbeing */}
      <div style={{ marginTop: 16 }}>
        <StaffWellnessWidget />
      </div>
    </div>
  );
}
