import PremiumSignature from './templates/premium-signature';
import CleanClinical from './templates/CleanClinical';
import WarmFamilyCare from './templates/WarmFamilyCare';
import ModernSpecialist from './templates/ModernSpecialist';

// Template id (clinics.website.template) → component. Falls back to Premium Signature.
export const TEMPLATES = {
  'premium-signature': PremiumSignature,
  'clean-clinical': CleanClinical,
  'warm-family': WarmFamilyCare,
  'modern-specialist': ModernSpecialist,
};

export const TEMPLATE_META = [
  { id: 'premium-signature', name: 'Premium Signature', blurb: 'The flagship — luxury, editorial, glassmorphic. Navy + emerald with world-class motion.' },
  { id: 'clean-clinical', name: 'Clean Clinical', blurb: 'Crisp, calm, minimal — a trustworthy modern clinic look.' },
  { id: 'warm-family', name: 'Warm Family Care', blurb: 'Friendly, warm and approachable for family practices.' },
  { id: 'modern-specialist', name: 'Modern Specialist', blurb: 'Bold, premium, high-contrast — for specialists.' },
];

export function getTemplate(id) {
  return TEMPLATES[id] || PremiumSignature;
}
