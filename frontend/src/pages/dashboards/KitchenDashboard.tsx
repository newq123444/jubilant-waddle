// src/pages/dashboards/KitchenDashboard.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useDashboard, useResidents } from '../../hooks';
import StaffWellnessWidget from '../../components/StaffWellnessWidget';
import type { Resident } from '../../types';

export default function KitchenDashboard() {
  const { user } = useAuthStore();
  const { data: dash } = useDashboard();
  const { data: residents = [] } = useResidents({ active: true });
  const [activeService, setActiveService] = useState<string>('lunch');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const allResidents = residents as Resident[];

  // Parse dietary requirements from resident data
  const dietaryBreakdown = {
    standard: allResidents.filter(r => !r.dietary_requirements || r.dietary_requirements === 'No restrictions').length,
    diabetic: allResidents.filter(r => r.dietary_requirements?.toLowerCase().includes('diabetic')).length,
    pureed: allResidents.filter(r => r.dietary_requirements?.toLowerCase().includes('pureed') || r.dietary_requirements?.toLowerCase().includes('puréed')).length,
    soft: allResidents.filter(r => r.dietary_requirements?.toLowerCase().includes('soft')).length,
    thickened: allResidents.filter(r => r.dietary_requirements?.toLowerCase().includes('thickened')).length,
    vegetarian: allResidents.filter(r => r.dietary_requirements?.toLowerCase().includes('vegetarian')).length,
    glutenFree: allResidents.filter(r => r.dietary_requirements?.toLowerCase().includes('gluten')).length,
    fortified: allResidents.filter(r => r.dietary_requirements?.toLowerCase().includes('fortified')).length,
  };

  // Meal service status
  const mealServices = {
    breakfast: { status: 'completed', served: 22, total: 24, time: '07:30 - 09:00', temp: 72 },
    lunch: { status: 'in-progress', served: 8, total: 24, time: '12:00 - 13:30', temp: 74 },
    dinner: { status: 'not-started', served: 0, total: 24, time: '17:30 - 19:00', temp: 0 },
    supper: { status: 'not-started', served: 0, total: 24, time: '20:00 - 20:30', temp: 0 },
  };

  // Food temperature log (HACCP)
  const tempLogs = [
    { item: 'Soup (Tomato)', time: '11:45', temp: 74, required: 63, status: 'pass' },
    { item: 'Roast Chicken', time: '11:50', temp: 78, required: 75, status: 'pass' },
    { item: 'Mashed Potato', time: '11:55', temp: 71, required: 63, status: 'pass' },
    { item: 'Vegetables (Mixed)', time: '11:55', temp: 68, required: 63, status: 'pass' },
    { item: 'Gravy', time: '12:00', temp: 76, required: 63, status: 'pass' },
    { item: 'Rice Pudding', time: '12:05', temp: 65, required: 63, status: 'pass' },
    { item: 'Fridge Unit 1', time: '07:00', temp: 3, required: 5, status: 'pass' },
    { item: 'Fridge Unit 2', time: '07:00', temp: 4, required: 5, status: 'pass' },
    { item: 'Freezer', time: '07:00', temp: -19, required: -18, status: 'pass' },
  ];

  // Weekly menu
  const weeklyMenu = [
    { day: 'Monday', lunch: 'Shepherd\'s Pie / Fish Fingers', dinner: 'Soup & Sandwich Selection' },
    { day: 'Tuesday', lunch: 'Roast Chicken / Vegetable Lasagne', dinner: 'Jacket Potato Bar' },
    { day: 'Wednesday', lunch: 'Beef Stew / Cheese Omelette', dinner: 'Quiche & Salad' },
    { day: 'Thursday', lunch: 'Fish & Chips / Mushroom Risotto', dinner: 'Light Bites Selection' },
    { day: 'Friday', lunch: 'Cottage Pie / Macaroni Cheese', dinner: 'Soup & Roll' },
    { day: 'Saturday', lunch: 'Roast Pork / Nut Roast', dinner: 'Cold Meat Platter' },
    { day: 'Sunday', lunch: 'Full Roast Dinner / Quorn Roast', dinner: 'Sandwich & Cake' },
  ];

  const todayMenu = weeklyMenu[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Stock alerts
  const stockAlerts = [
    { item: 'Semi-Skimmed Milk', level: 15, unit: 'litres', reorder: true, supplier: 'Brakes' },
    { item: 'White Bread (Sliced)', level: 4, unit: 'loaves', reorder: true, supplier: 'Brakes' },
    { item: 'Fresh Chicken', level: 3, unit: 'kg', reorder: false, supplier: 'Local Butcher' },
    { item: 'Thickening Powder', level: 2, unit: 'tins', reorder: true, supplier: 'Nutricia' },
    { item: 'Fortisip Compact', level: 8, unit: 'bottles', reorder: false, supplier: 'Nutricia' },
    { item: 'Gluten-Free Flour', level: 1, unit: 'kg', reorder: true, supplier: 'Brakes' },
    { item: 'Fresh Eggs (Free Range)', level: 36, unit: 'eggs', reorder: false, supplier: 'Local Farm' },
    { item: 'Butter', level: 2, unit: 'blocks', reorder: true, supplier: 'Brakes' },
  ];

  // Hygiene audit
  const hygieneAreas = [
    { area: 'Main Prep Area', score: 5, maxScore: 5 },
    { area: 'Cooking Zone', score: 5, maxScore: 5 },
    { area: 'Storage (Dry)', score: 4, maxScore: 5 },
    { area: 'Storage (Cold)', score: 5, maxScore: 5 },
    { area: 'Dishwash Area', score: 4, maxScore: 5 },
    { area: 'Waste Management', score: 5, maxScore: 5 },
  ];

  // Special events
  const specialEvents = [
    { event: 'Margaret\'s Birthday Tea', date: 'Wed 15 Jan', guests: 4, dietary: 'Diabetic cake needed' },
    { event: 'Family Open Day Buffet', date: 'Sat 18 Jan', guests: 30, dietary: 'Full allergen matrix required' },
    { event: 'Burns Night Supper', date: 'Sat 25 Jan', guests: 24, dietary: 'Haggis alternatives for vegetarians' },
  ];

  const getServiceColor = (status: string) => {
    if (status === 'completed') return '#16a34a';
    if (status === 'in-progress') return '#d97706';
    return '#6b7280';
  };

  const getServiceIcon = (status: string) => {
    if (status === 'completed') return '✅';
    if (status === 'in-progress') return '🔥';
    return '⏳';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.firstName} 👨‍🍳</h1>
          <p className="page-subtitle">Kitchen &amp; Catering · {today}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 12px', borderRadius: 20, background: '#f9731620', border: '1px solid #f9731640', fontSize: 12, fontWeight: 600, color: '#f97316' }}>
            EHO Rating: 5/5 ★
          </span>
          {dash && (
            <span style={{ padding: '6px 12px', borderRadius: 20, background: '#16a34a20', border: '1px solid #16a34a40', fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
              {dash.residents?.active ?? '...'} Residents
            </span>
          )}
        </div>
      </div>

      {/* Meal Service Status - Top Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {Object.entries(mealServices).map(([key, service]) => (
          <div key={key} onClick={() => setActiveService(key)} style={{
            padding: '16px', borderRadius: 12, background: 'white', border: `1px solid ${activeService === key ? '#f97316' : 'var(--border)'}`,
            borderLeft: `4px solid ${getServiceColor(service.status)}`, boxShadow: activeService === key ? '0 4px 12px rgba(249,115,22,.15)' : '0 2px 8px rgba(0,0,0,.05)',
            cursor: 'pointer', transition: 'all 150ms'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}>{key}</span>
              <span style={{ fontSize: 16 }}>{getServiceIcon(service.status)}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: getServiceColor(service.status) }}>{service.served}/{service.total}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{service.time}</div>
            {service.temp > 0 && (
              <div style={{ fontSize: 11, marginTop: 4, padding: '2px 6px', borderRadius: 4, background: '#16a34a10', color: '#16a34a', display: 'inline-block' }}>
                Serving temp: {service.temp}C
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Dietary Requirements Matrix */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🥗 Dietary Requirements Matrix ({allResidents.length} residents)</span>
          </div>
          <div className="card-body" style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Standard Diet', count: dietaryBreakdown.standard, color: '#16a34a', icon: '🍽️' },
                { label: 'Diabetic', count: dietaryBreakdown.diabetic, color: '#d97706', icon: '🩸' },
                { label: 'Pureed', count: dietaryBreakdown.pureed, color: '#dc2626', icon: '🥣' },
                { label: 'Soft Diet', count: dietaryBreakdown.soft, color: '#2563eb', icon: '🥄' },
                { label: 'Thickened Fluids', count: dietaryBreakdown.thickened, color: '#7c3aed', icon: '🥤' },
                { label: 'Vegetarian', count: dietaryBreakdown.vegetarian, color: '#059669', icon: '🥬' },
                { label: 'Gluten-Free', count: dietaryBreakdown.glutenFree, color: '#ec4899', icon: '🌾' },
                { label: 'Fortified', count: dietaryBreakdown.fortified, color: '#0891b2', icon: '💪' },
              ].map(d => (
                <div key={d.label} style={{ padding: '8px 10px', borderRadius: 8, background: d.color + '08', border: `1px solid ${d.color}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: d.color }}>{d.count}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Individual resident dietary notes */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Special Dietary Notes:</div>
              <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                {allResidents.filter(r => r.dietary_requirements && r.dietary_requirements !== 'No restrictions').slice(0, 8).map(r => (
                  <div key={r.id} style={{ fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Rm {r.room_number} - {r.first_name} {r.last_name}</span>
                    <span style={{ color: '#d97706' }}>{r.dietary_requirements}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Food Temperature Log (HACCP) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🌡️ Temperature Log (HACCP)</span>
            <span style={{ padding: '3px 8px', borderRadius: 12, background: '#16a34a15', color: '#16a34a', fontSize: 11, fontWeight: 600 }}>All Compliant</span>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 340, overflowY: 'auto' }}>
            <div style={{ padding: '8px 16px', background: 'var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Item</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Time</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Temp</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</span>
            </div>
            {tempLogs.map((log, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{log.item}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.time}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: log.status === 'pass' ? '#16a34a' : '#dc2626' }}>{log.temp}&deg;C</span>
                <span style={{ padding: '2px 6px', borderRadius: 4, background: '#16a34a15', color: '#16a34a', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>PASS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Weekly Menu */}
        <div className="card">
          <div className="card-header"><span className="card-title">📅 Weekly Menu Plan</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {weeklyMenu.map((day, i) => {
              const isToday = day.day === ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
              return (
                <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', background: isToday ? '#f9731608' : 'transparent' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#f97316' : 'var(--text-muted)', marginBottom: 2 }}>
                    {day.day} {isToday && '(Today)'}
                  </div>
                  <div style={{ fontSize: 11 }}>
                    <span style={{ fontWeight: 600 }}>L:</span> {day.lunch}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 600 }}>D:</span> {day.dinner}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="card">
          <div className="card-header"><span className="card-title">📦 Stock & Inventory</span></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 300, overflowY: 'auto' }}>
            {stockAlerts.map((item, i) => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{item.item}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Supplier: {item.supplier}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.reorder ? '#dc2626' : '#16a34a' }}>{item.level} {item.unit}</div>
                  {item.reorder && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#dc262615', color: '#dc2626', fontWeight: 600 }}>REORDER</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen Hygiene + Special Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><span className="card-title">🧼 Kitchen Hygiene Audit</span></div>
            <div className="card-body" style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#16a34a15', border: '2px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#16a34a' }}>
                  {hygieneAreas.reduce((s, a) => s + a.score, 0)}/{hygieneAreas.reduce((s, a) => s + a.maxScore, 0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>Excellent</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Last audit: Today 06:30</div>
                </div>
              </div>
              {hygieneAreas.map(a => (
                <div key={a.area} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0' }}>
                  <span>{a.area}</span>
                  <span style={{ fontWeight: 600, color: a.score === a.maxScore ? '#16a34a' : '#d97706' }}>{a.score}/{a.maxScore}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div className="card-header"><span className="card-title">🎉 Special Events</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              {specialEvents.map((evt, i) => (
                <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{evt.event}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{evt.date} | {evt.guests} guests | {evt.dietary}</div>
                </div>
              ))}
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
