// src/types/index.ts — All shared TypeScript types for CareVista

export type UserRole =
  | 'home_manager' | 'deputy_manager' | 'registered_nurse'
  | 'senior_carer' | 'carer' | 'activities'
  | 'finance' | 'admin' | 'super_admin' | 'group_admin'
  | 'cleaning' | 'kitchen' | 'maintenance';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  careHomeId: string;
  careHomeName: string;
  phone?: string;
}

export interface Resident {
  id: string;
  care_home_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nhs_number?: string;
  room_number: string;
  admission_date: string;
  care_type: 'residential' | 'nursing' | 'dementia' | 'respite' | 'palliative';
  status: 'active' | 'hospital' | 'leave' | 'discharged' | 'deceased';
  risk_level: 'low' | 'medium' | 'high';
  dnacpr: boolean;
  allergies?: string;
  dietary_requirements?: string;
  mobility_notes?: string;
  key_worker_id?: string;
  gp_name?: string;
  gp_phone?: string;
  funding_type?: string;
  weekly_fee_pence?: number;
  created_at: string;
  updated_at: string;
  photo_url?: string;
}

export interface CareNote {
  id: string;
  resident_id: string;
  resident_name?: string;
  staff_id: string;
  staff_name?: string;
  author_name?: string;
  note_type: string;
  body: string;
  flagged: boolean;
  created_at: string;
}

export interface Medication {
  id: string;
  resident_id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  times_of_day: string[];
  prescriber: string;
  start_date: string;
  end_date?: string;
  prn: boolean;
  controlled: boolean;
  status: 'active' | 'discontinued';
  instructions?: string;
  notes?: string;
}

export type MedAdministration = Administration;

export interface Administration {
  id: string;
  medication_id: string;
  resident_id: string;
  administered_by: string;
  administered_at: string;
  scheduled_time: string;
  status: 'given' | 'missed' | 'refused' | 'held';
  actual_time?: string;
  notes?: string;
}

export interface EmarEntry {
  resident: Resident;
  medications: Medication[];
  administrations: Administration[];
}

export interface Incident {
  id: string;
  care_home_id: string;
  resident_id?: string;
  resident_name?: string;
  reported_by_id: string;
  reported_by_name?: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'closed';
  incident_date: string;
  location?: string;
  description: string;
  immediate_action?: string;
  witnesses?: string;
  notified_family: boolean;
  notified_gp: boolean;
  notified_cqc: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  staff_id: string;
  staff_name?: string;
  care_home_id: string;
  shift_date: string;
  shift_type: 'day' | 'evening' | 'night' | 'sleep-in';
  start_time: string;
  end_time: string;
  role_cover?: string;
  notes?: string;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  care_home_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  employee_number?: string;
  job_title?: string;
  phone?: string;
  start_date?: string;
  contracted_hours?: number;
  hourly_rate?: number;
  dbs_number?: string;
  dbs_expiry?: string;
  active: boolean;
}

export interface TrainingRecord {
  id: string;
  staff_id: string;
  staff_name?: string;
  course_name: string;
  completed_date: string;
  expiry_date?: string;
  status: 'current' | 'expiring' | 'expired';
  provider?: string;
  certificate_url?: string;
}

export type KloeDomain = 'safe' | 'effective' | 'caring' | 'responsive' | 'well_led';

export interface ComplianceAction {
  id: string;
  care_home_id: string;
  title: string;
  description?: string;
  category: string;
  kloe_domain?: KloeDomain;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'closed';
  assigned_to_id?: string;
  assigned_to_name?: string;
  assigned_to?: string;
  assigned_name?: string;
  due_date?: string;
  evidence_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMessage {
  id: string;
  resident_id: string;
  resident_name?: string;
  contact_name: string;
  direction: 'inbound' | 'outbound';
  subject?: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number?: string;
  resident_id: string;
  resident_name?: string;
  payer_type?: string;
  period_start: string;
  period_end: string;
  period_label?: string;
  fee_per_week_pence: number;
  total_pence: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  funding_type?: string;
  payer_name?: string;
  amount_pence?: number;
  vat_pence?: number;
}

export interface DashboardData {
  residents: { active: number; high_risk: number; on_leave: number; in_hospital: number };
  openIncidents: string;
  missedMedsToday: string;
  expiringTraining: string;
  unreadMessages: string;
  notesToday: string;
  occupancyRate?: number;
}
