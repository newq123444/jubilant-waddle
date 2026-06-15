// src/App.tsx — Fully responsive: desktop sidebar, tablet drawer, phone bottom nav
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useDashboard } from './hooks';

import Dashboard      from './pages/Dashboard';
import Residents      from './pages/Residents';
import ResidentDetail from './pages/ResidentDetail';
import CareNotes      from './pages/CareNotes';
import Emar           from './pages/Emar';
import Incidents      from './pages/Incidents';
import Schedule       from './pages/Schedule';
import Staff          from './pages/Staff';
import Training       from './pages/Training';
import Compliance     from './pages/Compliance';
import FamilyPortal   from './pages/FamilyPortal';
import Billing        from './pages/Billing';
import AiTools        from './pages/AiTools';
import AuditLog       from './pages/AuditLog';
import Policies       from './pages/Policies';
import Profile        from './pages/Profile';
import TaskBoard      from './pages/TaskBoard';
import CDRegister     from './pages/CDRegister';
import AiInsights     from './pages/AiInsights';
import PredictiveCare from './pages/PredictiveCare';
import Activities     from './pages/Activities';
import WellbeingHub   from './pages/WellbeingHub';
import NotificationCentre from './components/NotificationCentre';
import SbarHandover from './pages/SbarHandover';
import News2Calculator from './pages/News2Calculator';
import WoundTracker from './pages/WoundTracker';
import InfectionTracker from './pages/InfectionTracker';
import ContinenceAssessment from './pages/ContinenceAssessment';
import SmartRota from './pages/SmartRota';
import NaturalLanguageSearch from './pages/NaturalLanguageSearch';
import RiskAssessments from './pages/RiskAssessments';
import MedInteractionChecker from './pages/MedInteractionChecker';
import { ROLE_LABELS } from './utils/formatters';

// ── Nav config ────────────────────────────────────────────────────────────
const NAV_ALL = [
  { section: 'Overview' },
  { path: '/',           label: 'Dashboard',    icon: '📊', roles: null },
  { section: 'Care' },
  { path: '/tasks',      label: 'Task Board',   icon: '📋', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','admin','super_admin','group_admin'], badge: 'tasks' },
  { path: '/residents',  label: 'Residents',    icon: '👥', roles: null },
  { path: '/care-notes', label: 'Care Notes',   icon: '📝', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','admin','super_admin','group_admin'] },
  { path: '/emar',       label: 'Medications',  icon: '💊', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','admin','super_admin','group_admin'], badge: 'meds' },
  { path: '/incidents',  label: 'Incidents',    icon: '⚠️', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','admin','super_admin','group_admin'], badge: 'incidents' },
  { path: '/activities', label: 'Activities',   icon: '🎯', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','activities','admin','super_admin','group_admin'] },
  { path: '/wellbeing',  label: 'Wellbeing Hub', icon: '💚', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','activities','admin','super_admin','group_admin'] },
  { path: '/news2',     label: 'NEWS2 Vitals', icon: '🫀', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','admin','super_admin','group_admin'] },
  { path: '/wounds',    label: 'Wound Tracker', icon: '🩹', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','admin','super_admin','group_admin'] },
  { path: '/continence', label: 'Continence Care', icon: '📋', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','admin','super_admin','group_admin'] },
  { path: '/risk-assessments', label: 'Risk Assessments', icon: '⚡', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','admin','super_admin','group_admin'] },
  { path: '/med-interactions', label: 'Med Interactions', icon: '💊', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','admin','super_admin','group_admin'] },
  { section: 'Team', roles: ['home_manager','deputy_manager','admin','super_admin','group_admin','registered_nurse','senior_carer'] },
  { path: '/schedule',   label: 'Rota',         icon: '📅', roles: ['home_manager','deputy_manager','admin','super_admin','group_admin','registered_nurse','senior_carer'] },
  { path: '/staff',      label: 'Staff',        icon: '👤', roles: ['home_manager','deputy_manager','admin','super_admin','group_admin'] },
  { path: '/training',   label: 'Training',     icon: '🎓', roles: ['home_manager','deputy_manager','admin','super_admin','group_admin'], badge: 'training' },
  { path: '/smart-rota', label: 'AI Smart Rota', icon: '🤖', roles: ['home_manager','deputy_manager','admin','super_admin','group_admin'] },
  { section: 'Governance', roles: ['home_manager','deputy_manager','super_admin','group_admin','registered_nurse'] },
  { path: '/compliance', label: 'CQC Compliance', icon: '✅', roles: ['home_manager','deputy_manager','super_admin','group_admin'] },
  { path: '/policies',   label: 'Policies',     icon: '📋', roles: null },
  { path: '/infections', label: 'Infection Control', icon: '🦠', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','admin','super_admin','group_admin'] },
  { section: 'Communications' },
  { path: '/family',     label: 'Family Portal', icon: '💬', roles: null, badge: 'messages' },
  { section: 'Finance', roles: ['home_manager','deputy_manager','admin','finance','super_admin','group_admin'] },
  { path: '/billing',    label: 'Billing',      icon: '💷', roles: ['home_manager','deputy_manager','admin','finance','super_admin','group_admin'] },
  { path: '/cd-register', label: 'CD Register',   icon: '💊', roles: ['home_manager','deputy_manager','registered_nurse','super_admin','group_admin'] },
  { section: 'Tools', roles: ['home_manager','deputy_manager','registered_nurse','super_admin','group_admin'] },
  { path: '/nl-search', label: 'Smart Search', icon: '🔍', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','carer','admin','super_admin','group_admin'] },
  { path: '/ai-tools',   label: 'AI Tools',     icon: '🤖', roles: ['home_manager','deputy_manager','registered_nurse','super_admin','group_admin'] },
  { path: '/ai-insights', label: 'AI Insights',   icon: '🧠', roles: ['home_manager','deputy_manager','registered_nurse','super_admin','group_admin'] },
  { path: '/predictive-care', label: 'Falls & Risk AI', icon: '🎯', roles: ['home_manager','deputy_manager','registered_nurse','super_admin','group_admin'] },
  { path: '/sbar-handover', label: 'SBAR Handover', icon: '📋', roles: ['home_manager','deputy_manager','registered_nurse','senior_carer','super_admin','group_admin'] },
  { path: '/audit-log',  label: 'Audit Log',    icon: '🔍', roles: ['home_manager','super_admin','group_admin'] },
];

// Bottom nav — most important 5 items for phone
const BOTTOM_NAV = [
  { path: '/',           label: 'Home',      icon: '📊', badge: null },
  { path: '/residents',  label: 'Residents', icon: '👥', badge: null },
  { path: '/care-notes', label: 'Notes',     icon: '📝', badge: null },
  { path: '/emar',       label: 'Meds',      icon: '💊', badge: 'meds' },
  { path: '/incidents',  label: 'Incidents', icon: '⚠️', badge: 'incidents' },
];

const ROLE_COLORS: Record<string, string> = {
  home_manager: '#7c3aed',   deputy_manager: '#2563eb',
  registered_nurse: '#0891b2', senior_carer: '#059669',
  carer: '#d97706',          activities: '#ec4899',
  finance: '#dc2626',        admin: '#6366f1',
  super_admin: '#1e40af',    group_admin: '#1e40af',
  cleaning: '#14b8a6',       kitchen: '#f97316',
  maintenance: '#64748b',
};

// ── Hook: detect screen size ──────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState(() => ({
    isPhone:  window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  }));
  useEffect(() => {
    const handler = () => setBp({
      isPhone:   window.innerWidth < 640,
      isTablet:  window.innerWidth >= 640 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
    });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return bp;
}

export default function App() {
  const { user, logout } = useAuthStore();
  
  // Dark mode
  const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('darkMode') === 'true');
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);
  const { data: dash }   = useDashboard();
  const navigate         = useNavigate();
  const location         = useLocation();
  const { isPhone, isTablet, isDesktop } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen]  = useState(false);
  const [collapsed, setCollapsed]      = useState(false);

  // Close drawer on route change (mobile/tablet)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  // Close drawer on desktop resize
  useEffect(() => { if (isDesktop) setSidebarOpen(false); }, [isDesktop]);

  const role      = user?.role || '';
  const roleColor = ROLE_COLORS[role] || '#2563eb';

  const getBadge = (key?: string | null): number => {
    if (!dash || !key) return 0;
    if (key === 'incidents') return parseInt(dash.openIncidents)    || 0;
    if (key === 'messages')  return parseInt(dash.unreadMessages)   || 0;
    if (key === 'training')  return parseInt(dash.expiringTraining) || 0;
    if (key === 'tasks')     return parseInt(dash.overdueTasksCount) || 0;
    return 0;
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const sidebarW = isDesktop ? (collapsed ? 60 : 240) : 240;
  const mainML   = isDesktop ? sidebarW : 0;

  // ── Sidebar content (shared between desktop + mobile drawer) ────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: (isDesktop && collapsed) ? '16px 14px' : '16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.06)', minHeight: 64, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${roleColor},${roleColor}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: `0 0 12px ${roleColor}50` }}>⚕</div>
        {!(isDesktop && collapsed) && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>CareVista</div>
            <div style={{ fontSize: '0.65rem', color: '#5a6a7f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.careHomeName}</div>
          </div>
        )}
        {isDesktop && (
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', color: '#5a6a7f', cursor: 'pointer', padding: 4, borderRadius: 4, flexShrink: 0, fontSize: 14 }}>
            {collapsed ? '→' : '←'}
          </button>
        )}
        {!isDesktop && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#5a6a7f', cursor: 'pointer', padding: 4, borderRadius: 4, marginLeft: 'auto', fontSize: 18 }}>✕</button>
        )}
      </div>

      {/* Role badge */}
      {!(isDesktop && collapsed) && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <div style={{ padding: '5px 10px', borderRadius: 20, background: roleColor + '20', border: `1px solid ${roleColor}40`, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: roleColor, flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: roleColor, whiteSpace: 'nowrap' }}>{ROLE_LABELS[role] || role}</span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_ALL.map((item, i) => {
          if ('section' in item && !('path' in item)) {
            if (item.roles && !item.roles.includes(role)) return null;
            if (isDesktop && collapsed) return <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,.05)', margin: '6px 0' }} />;
            return <div key={i} style={{ padding: '12px 16px 4px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#3d4f66' }}>{item.section}</div>;
          }
          const navItem = item as { path: string; label: string; icon: string; roles: string[] | null; badge?: string };
          if (navItem.roles && !navItem.roles.includes(role)) return null;
          const badgeCount = getBadge(navItem.badge);
          const isActive   = navItem.path === '/' ? location.pathname === '/' : location.pathname.startsWith(navItem.path);
          return (
            <NavLink key={navItem.path} to={navItem.path} end={navItem.path === '/'}
              style={{
                display: 'flex', alignItems: 'center',
                gap: (isDesktop && collapsed) ? 0 : 10,
                padding: (isDesktop && collapsed) ? '10px 14px' : '10px 16px',
                justifyContent: (isDesktop && collapsed) ? 'center' : 'flex-start',
                color: isActive ? '#fff' : '#9aa5b4', fontSize: '0.87rem',
                textDecoration: 'none', transition: 'all 150ms', position: 'relative',
                background: isActive ? roleColor + '25' : 'transparent',
                borderLeft: `3px solid ${isActive ? roleColor : 'transparent'}`,
                minHeight: 44,
              }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{navItem.icon}</span>
              {!(isDesktop && collapsed) && <span style={{ fontWeight: isActive ? 600 : 400, flex: 1 }}>{navItem.label}</span>}
              {!(isDesktop && collapsed) && badgeCount > 0 && (
                <span style={{ background: '#dc2626', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center' }}>{badgeCount}</span>
              )}
              {(isDesktop && collapsed) && badgeCount > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User footer */}
      <div style={{ padding: (isDesktop && collapsed) ? '12px 10px' : '12px 14px', borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
        {!(isDesktop && collapsed) && (
          <div style={{ paddingBottom: 8 }}>
            <NotificationCentre />
          </div>
        )}
        <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center', gap: (isDesktop && collapsed) ? 0 : 10, textDecoration: 'none', justifyContent: (isDesktop && collapsed) ? 'center' : 'flex-start', marginBottom: (isDesktop && collapsed) ? 0 : 10, minHeight: 44 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${roleColor},${roleColor}aa)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!(isDesktop && collapsed) && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.68rem', color: '#4a5568' }}>My Profile</div>
            </div>
          )}
        </NavLink>
        {!(isDesktop && collapsed) && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <button onClick={() => setDarkMode(d => !d)} style={{ flex: 1, padding: '7px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: '#6b7280', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left' }}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        )}
        {!(isDesktop && collapsed) && (
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: '#6b7280', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left' }}>
            🚪 Sign Out
          </button>
        )}
        {(isDesktop && collapsed) && (
          <button onClick={handleLogout} title="Sign out" style={{ width: '100%', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px 0', marginTop: 8, fontSize: 18 }}>🚪</button>
        )}
      </div>
    </>
  );

  return (
    <div className="app-shell">

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      {isDesktop && (
        <nav className={`sidebar${collapsed ? ' collapsed' : ''}`} style={{ width: sidebarW }}>
          <SidebarContent />
        </nav>
      )}

      {/* ── Mobile/Tablet: Slide-over drawer + overlay ─────────── */}
      {!isDesktop && (
        <>
          {/* Overlay */}
          <div
            className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <nav className={`sidebar${sidebarOpen ? ' mobile-open' : ''}`} style={{ width: sidebarW }}>
            <SidebarContent />
          </nav>
        </>
      )}

      {/* ── Mobile/Tablet Top Bar ───────────────────────────────── */}
      {!isDesktop && (
        <header className="topbar">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#9aa5b4', cursor: 'pointer', fontSize: 22, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 }}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${roleColor},${roleColor}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>⚕</div>
          <span className="topbar-title">CareVista</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Unread badge on messages */}
            {getBadge('messages') > 0 && (
              <Link to="/family" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', textDecoration: 'none' }}>
                <span>💬</span>
                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
              </Link>
            )}
            <NotificationCentre />
            <Link to="/profile" style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${roleColor},${roleColor}aa)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Link>
          </div>
        </header>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main
        className={`main-content${isDesktop && collapsed ? ' collapsed' : ''}`}
        style={{ marginLeft: mainML, width: `calc(100% - ${mainML}px)` }}
      >
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/tasks"          element={<TaskBoard />} />
          <Route path="/residents"      element={<Residents />} />
          <Route path="/residents/:id"  element={<ResidentDetail />} />
          <Route path="/care-notes"     element={<CareNotes />} />
          <Route path="/emar"           element={<Emar />} />
          <Route path="/incidents"      element={<Incidents />} />
          <Route path="/activities"     element={<Activities />} />
          <Route path="/wellbeing"      element={<WellbeingHub />} />
          <Route path="/schedule"       element={<Schedule />} />
          <Route path="/staff"          element={<Staff />} />
          <Route path="/training"       element={<Training />} />
          <Route path="/compliance"     element={<Compliance />} />
          <Route path="/policies"       element={<Policies />} />
          <Route path="/family"         element={<FamilyPortal />} />
          <Route path="/billing"        element={<Billing />} />
          <Route path="/ai-tools"       element={<AiTools />} />
          <Route path="/cd-register"    element={<CDRegister />} />
          <Route path="/ai-insights"    element={<AiInsights />} />
          <Route path="/predictive-care" element={<PredictiveCare />} />
          <Route path="/sbar-handover" element={<SbarHandover />} />
          <Route path="/news2"          element={<News2Calculator />} />
          <Route path="/wounds"         element={<WoundTracker />} />
          <Route path="/infections"     element={<InfectionTracker />} />
          <Route path="/continence"     element={<ContinenceAssessment />} />
          <Route path="/smart-rota"      element={<SmartRota />} />
          <Route path="/nl-search"       element={<NaturalLanguageSearch />} />
          <Route path="/risk-assessments" element={<RiskAssessments />} />
          <Route path="/med-interactions" element={<MedInteractionChecker />} />
          <Route path="/audit-log"      element={<AuditLog />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ── Phone Bottom Nav ─────────────────────────────────────── */}
      {isPhone && (
        <nav className="bottom-nav">
          {BOTTOM_NAV.map(item => {
            const badgeCount = getBadge(item.badge);
            const isActive   = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} className={`bottom-nav-item${isActive ? ' active' : ''}`}>
                <span className="icon" style={{ position: 'relative' }}>
                  {item.icon}
                  {badgeCount > 0 && (
                    <span className="bottom-nav-badge">{badgeCount > 9 ? '9+' : badgeCount}</span>
                  )}
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          {/* More button — opens drawer */}
          <button
            className="bottom-nav-item"
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none' }}
          >
            <span className="icon">☰</span>
            <span>More</span>
          </button>
        </nav>
      )}

    </div>
  );
}
