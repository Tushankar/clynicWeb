// Client-side display metadata for plan-gated features (labels + the tier that
// unlocks them). Convenience only — the backend requireFeature middleware is the
// real lock (hard rule 5). Keys mirror config/plans.js in clinic-api.
export const FEATURE_META = {
  DOCTOR_DASHBOARD: { label: 'Doctor dashboard', tier: 'Standard' },
  DOCTOR_CALENDAR: { label: 'Doctor calendar', tier: 'Standard' },
  PRESCRIPTIONS: { label: 'Digital prescriptions', tier: 'Standard' },
  PATIENT_TIMELINE: { label: 'Patient timeline', tier: 'Standard' },
  REPORT_UPLOADS: { label: 'Report uploads', tier: 'Standard' },
  BILLING: { label: 'Billing', tier: 'Standard' },
  PATIENT_PORTAL: { label: 'Patient portal', tier: 'Standard' },
  UNIVERSAL_SEARCH: { label: 'Universal search', tier: 'Standard' },
  INTERNAL_CHAT: { label: 'Internal chat', tier: 'Standard' },
  NOTIFICATION_CENTER: { label: 'Notifications', tier: 'Standard' },
  ONLINE_PREPAYMENT: { label: 'Online prepayment', tier: 'Standard' },
  WHATSAPP_REMINDERS: { label: 'WhatsApp reminders', tier: 'Standard' },
  CMS_BASIC: { label: 'Website CMS', tier: 'Standard' },
  WEBSITE_LIVE: { label: 'Public website', tier: 'Basic' },
  CRM: { label: 'CRM & retention', tier: 'Premium' },
  MULTI_BRANCH: { label: 'Multi-branch', tier: 'Premium' },
  ANALYTICS: { label: 'Owner analytics', tier: 'Premium' },
  AI_FEATURES: { label: 'AI assistant', tier: 'Premium' },
  CMS_ADVANCED: { label: 'Advanced website CMS', tier: 'Premium' },
};

export const featureLabel = (key) => FEATURE_META[key]?.label || key;
export const featureTier = (key) => FEATURE_META[key]?.tier || 'a higher';
