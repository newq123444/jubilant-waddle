// src/pages/dashboards/MaintenanceDashboard.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useDashboard } from '../../hooks';

export default function MaintenanceDashboard() {
  const { user } = useAuthStore();
  const { data: dash } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>('all');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Maintenance requests
  const requests = [
    { id: 'MR-001', title: 'Radiator not heating - Room 4', priority: 'urgent', status: 'in-progress', reported: '2 hours ago', reporter: 'Priya Sharma', category: 'heating' },
    { id: 'MR-002', title: 'Toilet flush mechanism broken - Room 12', priority: 'high', status: 'open', reported: '4 hours ago', reporter: 'Daniel Hughes', category: 'plumbing' },
    { id: 'MR-003', title: 'Window latch stuck - Room 7', priority: 'medium', status: 'open', reported: 'Yesterday', reporter: 'Lisa Brown', category: 'general' },
    { id: 'MR-004', title: 'Light flickering in corridor (1st floor)', priority: 'medium', status: 'open', reported: 'Yesterday', reporter: 'Amara Osei', category: 'electrical' },
    { id: 'MR-005', title: 'Door closer adjustment - Main entrance', priority: 'low', status: 'scheduled', reported: '2 days ago', reporter: 'Sarah Mitchell', category: 'general' },
    { id: 'MR-006', title: 'Bathroom extractor fan noise - Room 18', priority: 'medium', status: 'open', reported: 'Today', reporter: 'Tom Walsh', category: 'electrical' },
    { id: 'MR-007', title: 'Handrail loose - Staircase B', priority: 'high', status: 'in-progress', reported: 'Today', reporter: 'James Patel', category: 'safety' },
    { id: 'MR-008', title: 'Garden path uneven flagstone', priority: 'low', status: 'scheduled', reported: '3 days ago', reporter: 'Lisa Brown', category: 'grounds' },
  ];

  const filteredRequests = activeTab === 'all' ? requests : requests.filter(r => r.priority === activeTab);

  // Equipment service schedule
  const equipmentSchedule = [
    { equipment: 'Passenger Lift (Main)', lastService: '15 Oct 2024', nextService: '15 Jan 2025', status: 'due', contractor: 'ThyssenKrupp', cert: 'LOLER' },
    { equipment: 'Stairlift (Wing B)', lastService: '20 Nov 2024', nextService: '20 Feb 2025', status: 'ok', contractor: 'Stannah', cert: 'LOLER' },
    { equipment: 'Boiler System', lastService: '01 Dec 2024', nextService: '01 Jun 2025', status: 'ok', contractor: 'British Gas', cert: 'Gas Safe' },
    { equipment: 'Emergency Generator', lastService: '10 Nov 2024', nextService: '10 Feb 2025', status: 'ok', contractor: 'Aggreko', cert: 'ISO 8528' },
    { equipment: 'Fire Suppression System', lastService: '05 Dec 2024', nextService: '05 Mar 2025', status: 'ok', contractor: 'ADT Fire', cert: 'BS 5306' },
    { equipment: 'HVAC Units (x3)', lastService: '22 Sep 2024', nextService: '22 Jan 2025', status: 'overdue', contractor: 'Daikin UK', cert: 'F-Gas' },
    { equipment: 'Hoists (x6)', lastService: '01 Dec 2024', nextService: '01 Mar 2025', status: 'ok', contractor: 'Arjo', cert: 'LOLER' },
    { equipment: 'Nurse Call System', lastService: '15 Nov 2024', nextService: '15 May 2025', status: 'ok', contractor: 'Intercall', cert: 'HTM 08-03' },
  ];

  // H&S Compliance
  const hsCompliance = [
    { check: 'Fire Alarm Test (Weekly)', lastDone: 'Mon 13 Jan', nextDue: 'Mon 20 Jan', status: 'current', frequency: 'Weekly' },
    { check: 'Emergency Lighting Test', lastDone: '01 Jan 2025', nextDue: '01 Feb 2025', status: 'current', frequency: 'Monthly' },
    { check: 'Legionella Flush (Low-use outlets)', lastDone: 'Fri 10 Jan', nextDue: 'Fri 17 Jan', status: 'due-soon', frequency: 'Weekly' },
    { check: 'PAT Testing', lastDone: '15 Oct 2024', nextDue: '15 Apr 2025', status: 'current', frequency: '6-Monthly' },
    { check: 'Fire Extinguisher Inspection', lastDone: '01 Dec 2024', nextDue: '01 Dec 2025', status: 'current', frequency: 'Annual' },
    { check: 'Asbestos Register Review', lastDone: '01 Nov 2024', nextDue: '01 Nov 2025', status: 'current', frequency: 'Annual' },
    { check: 'Water Temperature Checks', lastDone: 'Today', nextDue: 'Tomorrow', status: 'current', frequency: 'Daily' },
    { check: 'Lift Safety Certificate', lastDone: '15 Jul 2024', nextDue: '15 Jan 2025', status: 'overdue', frequency: '6-Monthly' },
  ];

  // Building systems status
  const buildingSystems = [
    { system: 'Central Heating', status: 'operational', detail: '21C avg, all zones active', icon: '🔥' },
    { system: 'Hot Water', status: 'operational', detail: '60C at outlets, legionella safe', icon: '🚿' },
    { system: 'Electrical Supply', status: 'operational', detail: 'All circuits normal', icon: '⚡' },
    { system: 'Fire Alarm Panel', status: 'operational', detail: 'Zone 1-8 all clear', icon: '🚨' },
    { system: 'Nurse Call System', status: 'operational', detail: 'All stations responding', icon: '🔔' },
    { system: 'CCTV System', status: 'warning', detail: 'Camera 5 (car park) offline', icon: '📹' },
    { system: 'Access Control', status: 'operational', detail: 'All doors secure', icon: '🔐' },
    { system: 'Emergency Lighting', status: 'operational', detail: 'Battery backup 100%', icon: '💡' },
  ];

  // Work order stats
  const workOrderStats = {
    completedThisWeek: 12,
    completedThisMonth: 47,
    avgResponseTime: '2.4 hrs',
    avgCompletionTime: '1.2 days',
    openOrders: requests.filter(r => r.status === 'open').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
  };

  // Contractor visits
  const contractorVisits = [
    { contractor: 'ThyssenKrupp', purpose: 'Lift 6-monthly service', date: 'Thu 16 Jan', time: '09:00', duration: '3 hrs' },
    { contractor: 'Daikin UK', purpose: 'HVAC service (overdue)', date: 'Fri 17 Jan', time: '10:00', duration: '4 hrs' },
    { contractor: 'ADT Fire & Security', purpose: 'Fire panel firmware update', date: 'Mon 20 Jan', time: '14:00', duration: '2 hrs' },
    { contractor: 'British Gas', purpose: 'Annual gas safety inspection', date: 'Wed 22 Jan', time: '08:30', duration: '5 hrs' },
  ];

  // PPM Calendar
  const ppmCalendar = [
    { task: 'Gutter clearance', due: 'This week', category: 'Grounds', status: 'scheduled' },
    { task: 'Bathroom sealant check (all)', due: 'This week', category: 'Plumbing', status: 'pending' },
    { task: 'Fire door inspection round', due: 'Next week', category: 'Fire Safety', status: 'scheduled' },
    { task: 'Boiler pressure check', due: 'Daily', category: 'Heating', status: 'done-today' },
    { task: 'Generator test run (30 min)', due: 'Weekly (Wed)', category: 'Electrical', status: 'scheduled' },
    { task: 'Window lock check (all floors)', due: 'Next week', category: 'Security', status: 'pending' },
  ];

  const getPriorityColor = (priority: string) => {
    if (priority === 'urgent') return '#dc2626';
    if (priority === 'high') return '#d97706';
    if (priority === 'medium') return '#2563eb';
    return '#6b7280';
  };

  const getSystemStatusColor = (status: string) => {
    if (status === 'operational') return '#16a34a';
    if (status === 'warning') return '#d97706';
    return '#dc2626';
  };

  const getComplianceColor = (status: string) => {
    if (status === 'current') return '#16a34a';
    if (status === 'due-soon') return '#d97706';
    return '#dc2626';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.firstName} 🔧</h1>
          <p className="page-subtitle">Facilities &amp; Maintenance · {today}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 12px', borderRadius: 20, background: '#64748b20', border: '1px solid #64748b40', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
            On Call: 07:00 - 19:00
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Open Requests', value: workOrderStats.openOrders.toString(), icon: '📋', color: '#dc2626', sub: 'Awaiting action' },
          { label: 'In Progress', value: workOrderStats.inProgress.toString(), icon: '🔨', color: '#d97706', sub: 'Being worked on' },
          { label: 'Done This Week', value: workOrderStats.completedThisWeek.toString(), icon: '✅', color: '#16a34a', sub: `${workOrderStats.completedThisMonth} this month` },
          { label: 'Avg Response', value: workOrderStats.avgResponseTime, icon: '⏱️', color: '#2563eb', sub: 'First response time' },
          { label: 'Systems Status', value: `${buildingSystems.filter(s => s.status === 'operational').length}/${buildingSystems.length}`, icon: '🏢', color: '#7c3aed', sub: 'All operational' },
        ].map(k => (
          <div key={k.label} style={{ padding: '18px 16px', borderRadius: 12, background: 'white', border: '1px solid var(--border)', borderLeft: `4px solid ${k.color}`, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Maintenance Requests Board */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">📋 Maintenance Requests</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'urgent', 'high', 'medium', 'low'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                  background: activeTab === tab ? '#64748b20' : 'transparent',
                  color: activeTab === tab ? '#64748b' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
                }}>{tab}</button>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 340, overflowY: 'auto' }}>
            {filteredRequests.map(req => (
              <div key={req.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getPriorityColor(req.priority), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{req.id}</span>
                    {req.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Reported by {req.reporter} · {req.reported}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: getPriorityColor(req.priority) + '15', color: getPriorityColor(req.priority), textTransform: 'uppercase' }}>
                    {req.priority}
                  </span>
                  <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: req.status === 'in-progress' ? '#d9770615' : req.status === 'scheduled' ? '#2563eb15' : '#6b728015', color: req.status === 'in-progress' ? '#d97706' : req.status === 'scheduled' ? '#2563eb' : '#6b7280' }}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Building Systems Status */}
        <div className="card">
          <div className="card-header"><span className="card-title">🏢 Building Systems</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {buildingSystems.map(sys => (
              <div key={sys.system} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{sys.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{sys.system}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sys.detail}</div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: getSystemStatusColor(sys.status), boxShadow: `0 0 6px ${getSystemStatusColor(sys.status)}60` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* H&S Compliance */}
        <div className="card">
          <div className="card-header"><span className="card-title">🛡️ Health &amp; Safety Compliance</span></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 300, overflowY: 'auto' }}>
            {hsCompliance.map((item, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.check}
                    <span style={{ padding: '1px 5px', borderRadius: 4, background: getComplianceColor(item.status) + '15', color: getComplianceColor(item.status), fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{item.status === 'due-soon' ? 'DUE SOON' : item.status}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    Last: {item.lastDone} | Next: {item.nextDue} | {item.frequency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Service Schedule */}
        <div className="card">
          <div className="card-header"><span className="card-title">⚙️ Equipment Service Schedule</span></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 300, overflowY: 'auto' }}>
            {equipmentSchedule.map((eq, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{eq.equipment}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {eq.contractor} | Cert: {eq.cert} | Next: {eq.nextService}
                  </div>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                  background: eq.status === 'ok' ? '#16a34a15' : eq.status === 'due' ? '#d9770615' : '#dc262615',
                  color: eq.status === 'ok' ? '#16a34a' : eq.status === 'due' ? '#d97706' : '#dc2626',
                  textTransform: 'uppercase'
                }}>{eq.status === 'ok' ? 'OK' : eq.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* PPM Calendar */}
        <div className="card">
          <div className="card-header"><span className="card-title">🗓️ Planned Preventive Maintenance</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {ppmCalendar.map((task, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${task.status === 'done-today' ? '#16a34a' : 'var(--border)'}`,
                  background: task.status === 'done-today' ? '#16a34a' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff'
                }}>
                  {task.status === 'done-today' && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, textDecoration: task.status === 'done-today' ? 'line-through' : 'none' }}>{task.task}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{task.category} | Due: {task.due}</div>
                </div>
                <span style={{
                  padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                  background: task.status === 'done-today' ? '#16a34a15' : task.status === 'scheduled' ? '#2563eb15' : '#d9770615',
                  color: task.status === 'done-today' ? '#16a34a' : task.status === 'scheduled' ? '#2563eb' : '#d97706'
                }}>{task.status === 'done-today' ? 'DONE' : task.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contractor Visits */}
        <div className="card">
          <div className="card-header"><span className="card-title">👷 Contractor Visits</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {contractorVisits.map((visit, i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{visit.contractor}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb' }}>{visit.date}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{visit.purpose}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {visit.time} | Est. duration: {visit.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
