import CleanClinical from './templates/CleanClinical';
import WarmFamilyCare from './templates/WarmFamilyCare';
import ModernSpecialist from './templates/ModernSpecialist';

// Template id (clinics.website.template) → component. Falls back to Clean Clinical.
export const TEMPLATES = {
  'clean-clinical': CleanClinical,
  'warm-family': WarmFamilyCare,
  'modern-specialist': ModernSpecialist,
};

export const TEMPLATE_META = [
  { id: 'clean-clinical', name: 'Clean Clinical', blurb: 'Crisp, calm, minimal — a trustworthy modern clinic look.' },
  { id: 'warm-family', name: 'Warm Family Care', blurb: 'Friendly, warm and approachable for family practices.' },
  { id: 'modern-specialist', name: 'Modern Specialist', blurb: 'Bold, premium, high-contrast — for specialists.' },
];

export function getTemplate(id) {
  return TEMPLATES[id] || CleanClinical;
}
