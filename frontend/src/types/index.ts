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
  mobility_status?: 'independent' | 'walking_aid' | 'wheelchair' | 'bed_bound';
  interests?: string[];
  wellbeing_score?: number;
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

// ── Activities & Wellbeing ────────────────────────────────────────────────
export type MobilityStatus = 'independent' | 'walking_aid' | 'wheelchair' | 'bed_bound';
export type MobilityRequirement = 'any' | 'walking_aid_or_better' | 'wheelchair_or_better' | 'independent_only';

export interface Activity {
  id: string;
  care_home_id: string;
  name: string;
  description?: string;
  activity_type: string;
  required_mobility_level: MobilityRequirement;
  duration_minutes: number;
  max_participants: number;
  location?: string;
  facilitator?: string;
  recurring: boolean;
  recurrence_pattern?: string;
  category: string;
  sensory_friendly: boolean;
  cognitive_level: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivitySession {
  id: string;
  care_home_id: string;
  activity_id: string;
  activity_name?: string;
  category?: string;
  required_mobility_level?: string;
  location?: string;
  duration_minutes?: number;
  sensory_friendly?: boolean;
  session_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  facilitator_id?: string;
  facilitator_name?: string;
  notes?: string;
  mood_rating_avg?: number;
  participant_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityParticipant {
  id: string;
  session_id: string;
  resident_id: string;
  first_name?: string;
  last_name?: string;
  room_number?: string;
  mobility_status?: string;
  photo_url?: string;
  attendance: 'registered' | 'attended' | 'declined' | 'unable';
  engagement_level?: 'high' | 'medium' | 'low' | 'none';
  mood_before?: string;
  mood_after?: string;
  notes?: string;
  created_at: string;
  // For history view
  session_date?: string;
  start_time?: string;
  end_time?: string;
  session_status?: string;
  activity_name?: string;
  activity_type?: string;
}

export interface WellbeingStats {
  stats: {
    unique_participants: string;
    total_participations: string;
    total_attended: string;
    high_engagement: string;
    medium_engagement: string;
    low_engagement: string;
    attendance_rate: string;
  };
  popular_activities: Array<{ name: string; category: string; participant_count: string }>;
  inactive_residents: Array<{
    id: string;
    first_name: string;
    last_name: string;
    room_number: string;
    mobility_status: string;
    last_activity_date: string | null;
  }>;
  week_stats: {
    sessions_this_week: string;
    completed: string;
    upcoming: string;
  };
}

// ── Wellbeing Tracking ────────────────────────────────────────────────────
export type MoodLevel = 'very_happy' | 'happy' | 'neutral' | 'low' | 'very_low';
export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
export type SocialEngagement = 'high' | 'moderate' | 'low' | 'isolated';
export type AppetiteLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'refused';
export type EnergyLevel = 'high' | 'moderate' | 'low' | 'very_low';

export interface WellbeingLog {
  id: string;
  care_home_id: string;
  resident_id: string;
  logged_by: string;
  logged_by_name?: string;
  log_date: string;
  mood: MoodLevel;
  pain_level: number | null;
  sleep_quality: SleepQuality;
  social_engagement: SocialEngagement;
  appetite: AppetiteLevel;
  energy_level: EnergyLevel;
  notes?: string;
  created_at: string;
}

export interface WellbeingOverview {
  todayLogs: Array<WellbeingLog & { first_name: string; last_name: string; room_number: string; photo_url?: string }>;
  needsAttention: Array<{ id: string; first_name: string; last_name: string; room_number: string; photo_url?: string; mood: MoodLevel; pain_level: number | null; log_date: string }>;
  stats: { happy_count: string; neutral_count: string; low_count: string; avg_pain: string; logged_residents: string };
}

export interface ResidentLifeStory {
  id: string;
  resident_id: string;
  occupation?: string;
  hometown?: string;
  spouse_info?: string;
  children_info?: string;
  pets?: string;
  hobbies?: string[];
  favorite_music?: string[];
  favorite_tv?: string[];
  favorite_foods?: string[];
  conversation_topics?: string[];
  comfort_items?: string[];
  daily_routine_preferences?: string;
  religious_preferences?: string;
  dislikes?: string[];
  important_dates?: Record<string, string>;
  life_achievements?: string;
  war_service?: string;
  personality_traits?: string[];
  communication_style?: string;
  updated_at?: string;
  updated_by?: string;
  updated_by_name?: string;
}

export type AlertSeverity = 'mild' | 'moderate' | 'severe';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface SocialIsolationAlert {
  id: string;
  care_home_id: string;
  resident_id: string;
  first_name?: string;
  last_name?: string;
  room_number?: string;
  photo_url?: string;
  alert_type: 'no_visitors' | 'no_activities' | 'no_social_notes' | 'low_engagement';
  days_since_last: number;
  severity: AlertSeverity;
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  resolved_at?: string;
  created_at: string;
}

export interface EnvironmentPreferences {
  id: string;
  resident_id: string;
  preferred_lighting?: string;
  preferred_temperature?: string;
  preferred_music_volume?: string;
  calming_sounds?: string[];
  aromatherapy?: string[];
  room_decorations?: string;
  photo_display_preference?: string;
  tv_volume?: string;
  noise_sensitivity?: 'low' | 'moderate' | 'high';
  notes?: string;
  updated_at?: string;
}

// ── Predictive Care ───────────────────────────────────────────────────────
export interface PredictiveRiskScore {
  id: string;
  care_home_id: string;
  resident_id: string;
  risk_type: 'falls' | 'deterioration';
  score: number;
  factors: Record<string, any>;
  generated_at: string;
}

export interface PredictiveAlert {
  id: string;
  care_home_id: string;
  resident_id: string;
  resident_name?: string;
  room_number?: string;
  alert_type: string;
  risk_score: number;
  threshold: number;
  factors: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  resolved_at?: string;
  created_at: string;
}

export interface PredictiveRiskDashboardItem {
  resident_id: string;
  first_name: string;
  last_name: string;
  room_number: string;
  risk_level: string;
  falls_score: number | null;
  falls_generated_at: string | null;
  deterioration_score: number | null;
  deterioration_generated_at: string | null;
}

// ── Family Portal ─────────────────────────────────────────────────────────
export interface FamilyDailySummary {
  id: string;
  resident_id: string;
  summary_date: string;
  meals_summary: string | null;
  activities_summary: string | null;
  mood_summary: string | null;
  care_notes_summary: string | null;
  photo_urls: string[];
  generated_at: string;
  generated_by: string;
}

export interface FamilyWeeklyReport {
  id: string;
  resident_id: string;
  week_start: string;
  week_end: string;
  report_content: string;
  wellbeing_score_avg: number | null;
  highlights: string[];
  concerns: string[];
  generated_at: string;
  sent_at: string | null;
}

export interface FamilyPhoto {
  id: string;
  resident_id: string;
  photo_url: string;
  caption: string | null;
  activity_session_id: string | null;
  uploaded_by_name?: string;
  created_at: string;
}

export interface FamilyDashboardData {
  resident: {
    id: string;
    first_name: string;
    last_name: string;
    room_number: string;
    photo_url: string | null;
  };
  today_summary: FamilyDailySummary | null;
  recent_photos: FamilyPhoto[];
  unread_messages: number;
  latest_wellbeing: any;
}

// ── CQC Compliance ────────────────────────────────────────────────────────
export interface CqcDomainScore {
  id: string;
  domain: string;
  score: number;
  evidence_count: number;
  gaps_count: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  calculated_at: string;
}

export interface CqcEvidencePack {
  id: string;
  domains_included: string[];
  date_range_start: string;
  date_range_end: string;
  content: any;
  status: 'generating' | 'complete' | 'failed';
  created_at: string;
}

export interface PolicyReview {
  id: string;
  policy_id: string;
  policy_title?: string;
  reviewer_name?: string;
  reviewer_id: string;
  review_date: string;
  next_review_date: string | null;
  status: string;
  changes_made: string | null;
  notes: string | null;
  created_at: string;
}

export interface PolicyWithReview {
  id: string;
  title: string;
  category: string | null;
  review_date: string | null;
  status: string;
  version: string | null;
  latest_review_date: string | null;
  latest_reviewer: string | null;
  next_review_date: string | null;
  is_overdue: boolean;
}

export interface InspectionChecklist {
  id: string;
  title: string;
  domain: string;
  items: Array<{ label: string; completed: boolean; evidence?: string }>;
  completed_items: number;
  total_items: number;
  status: string;
}

export interface ComplianceOverview {
  domain_scores: CqcDomainScore[];
  overdue_policies_count: number;
  expiring_training_count: number;
  open_actions_count: number;
  overall_readiness_score: number;
}
