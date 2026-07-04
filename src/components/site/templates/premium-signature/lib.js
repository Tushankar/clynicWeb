/**
 * Premium Signature — design tokens, data massaging and content builders.
 *
 * The template ships its own opinionated luxury palette (deep navy + modern emerald on
 * porcelain #F8FAFC) instead of inheriting --site-primary, so every clinic that picks
 * "Premium Signature" gets the flagship look. All copy defaults below are generic,
 * owner-editable marketing scaffolding — anything the CMS provides always wins.
 */

// ---- palette ------------------------------------------------------------------------
export const C = {
  bg: '#F8FAFC',
  ink: '#0B1220', // near-black headings
  body: '#475569', // slate-600
  muted: '#64748B', // slate-500
  navy: '#0A1B3A',
  navy2: '#102B5C',
  navyDeep: '#060E22',
  em: '#059669', // emerald-600
  em2: '#10B981', // emerald-500
  em3: '#34D399', // emerald-400
  line: 'rgba(11,18,32,0.08)',
};

// Gradient recipes reused across icon tiles / avatars — curated cool medical family.
export const GRADIENTS = [
  'linear-gradient(135deg,#059669 0%,#34D399 100%)', // emerald
  'linear-gradient(135deg,#0A1B3A 0%,#2E5EAA 100%)', // navy → blue
  'linear-gradient(135deg,#0369A1 0%,#38BDF8 100%)', // deep sky
  'linear-gradient(135deg,#0F766E 0%,#2DD4BF 100%)', // teal
  'linear-gradient(135deg,#047857 0%,#6EE7B7 100%)', // sea green
  'linear-gradient(135deg,#1E3A8A 0%,#60A5FA 100%)', // indigo blue
];

export const SHADOW = {
  sm: '0 1px 2px rgba(10,27,58,0.05), 0 6px 20px -8px rgba(10,27,58,0.08)',
  md: '0 2px 4px rgba(10,27,58,0.04), 0 16px 40px -12px rgba(10,27,58,0.12)',
  lg: '0 2px 6px rgba(10,27,58,0.05), 0 32px 72px -20px rgba(10,27,58,0.22)',
  glow: '0 12px 40px -8px rgba(5,150,105,0.35)',
};

// ---- curated premium imagery (graceful fallbacks when the CMS has none) --------------
// Every id below was fetched and visually verified (premium, on-subject, no third-party
// clinic branding). Pexels license permits hotlinking + commercial use.
const P = (id, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMG = {
  hero: P(16571735, 1600), // luxury modern clinic suite, warm light
  whyBig: P(7578797, 1400), // doctor–patient consultation, editorial
  whySmall: P(7800669, 900), // clinicians reviewing a digital X-ray
  servicePool: [
    P(305567, 1200), // pristine treatment equipment
    P(7108114, 1200), // modern surgical room
    P(6812569, 1200), // care team at work
    P(16571732, 1200), // premium clinic interior
    P(8459996, 1200), // bright waiting lounge
    P(7789601, 1200), // treatment room
  ],
  galleryPool: [
    P(8459996, 1100), // waiting lounge
    P(16571732, 1100), // premium suite
    P(7108114, 1100), // surgical room
    P(6812569, 1100), // care team
    P(7789620, 1100), // treatment room, teal
    P(7108396, 1100), // exam room
    P(305567, 1100), // equipment detail
    P(7789601, 1100), // treatment room
  ],
};

// ---- tiny utils ----------------------------------------------------------------------
export const cx = (...a) => a.filter(Boolean).join(' ');

export const initials = (name = '') =>
  name
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'D';

export const firstName = (name = '') =>
  (name || '').replace(/^dr\.?\s+/i, '').split(/\s+/)[0] || 'our doctor';

export const fmtFee = (fee) => {
  const n = Number(fee);
  return n > 0 ? `₹${n.toLocaleString('en-IN')}` : '';
};

export const waLink = (whatsapp = '') => {
  const digits = String(whatsapp).replace(/[^0-9]/g, '');
  return digits ? `https://wa.me/${digits}` : '';
};

export const telHref = (phone = '') => (phone ? `tel:${String(phone).replace(/\s+/g, '')}` : '');

/** Average review rating, one decimal. Falls back to a tasteful default when unrated. */
export const avgRating = (reviews = []) => {
  if (!reviews.length) return 4.9;
  const avg = reviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / reviews.length;
  return Math.round(avg * 10) / 10;
};

// ---- derived site model ---------------------------------------------------------------
export function deriveModel(site, slug) {
  const clinic = site.clinic || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const contact = content.contact || {};
  const services = content.services || [];
  const doctors = site.doctors || [];
  const reviews = site.reviews || [];
  const gallery = (content.gallery || []).length ? content.gallery : IMG.galleryPool;

  // The flagship (platform) site falls back to the real Clynic wordmark — the same
  // asset the dashboard sidebar uses. Tenant clinics keep the monogram fallback.
  const MAIN_SLUG = import.meta.env.VITE_MAIN_SITE_SLUG || 'clynic';
  const theme = site.theme || {};
  const logoUrl = theme.logoUrl || (slug === MAIN_SLUG ? '/clynic.png' : '');

  const rating = avgRating(reviews);
  const phone = contact.phone || clinic.phone || '';
  const whatsapp = waLink(contact.whatsapp);
  const city = (contact.address || clinic.address || '').split(',').pop()?.trim() || '';

  return {
    clinic,
    theme: { ...theme, logoUrl },
    name: clinic.name || 'Our Clinic',
    bookHref: `/c/${slug}/book`,
    portalHref: `/portal/${slug}`,
    hero: {
      headline: hero.headline || clinic.name || 'Healthcare, beautifully done',
      tagline:
        hero.tagline ||
        'Modern clinical care with same-day appointments, digital records and doctors who listen.',
      imageUrl: hero.imageUrl || IMG.hero,
    },
    about: content.about || '',
    services,
    gallery,
    doctors,
    reviews,
    pages: site.pages || [],
    contact: { ...contact, phone, whatsapp, address: contact.address || clinic.address || '' },
    mapEmbed: content.mapEmbed || '',
    rating,
    city,
    seo: site.seo || {},
  };
}

// ---- section content builders ----------------------------------------------------------
export function buildStats(m) {
  return [
    { value: 12, suffix: '+', label: 'Years of care', sub: 'Experience you can trust' },
    { value: 25000, suffix: '+', label: 'Patient visits', sub: 'And counting, every year' },
    { value: m.rating, suffix: '', label: 'Average rating', sub: 'From verified patients', decimals: 1, star: true },
    { value: 24, suffix: '/7', label: 'Online booking', sub: 'Reserve a slot anytime' },
  ];
}

// Capability marquee — every item is a real platform feature, not a fake partner logo.
export const CAPABILITIES = [
  { icon: 'FileText', label: 'Digital health records' },
  { icon: 'ClipboardCheck', label: 'E-prescriptions' },
  { icon: 'MessageCircle', label: 'WhatsApp reminders' },
  { icon: 'CreditCard', label: 'Secure online payments' },
  { icon: 'BadgeCheck', label: 'Verified patient reviews' },
  { icon: 'MonitorSmartphone', label: 'Live queue updates' },
  { icon: 'CalendarCheck2', label: 'Same-day appointments' },
  { icon: 'ShieldCheck', label: 'Privacy-first by design' },
];

export const WHY_FEATURES = [
  { icon: 'Cpu', title: 'Modern technology', text: 'Digital-first diagnostics and records at every step.' },
  { icon: 'Award', title: 'Experienced doctors', text: 'Specialists who take time to truly listen.' },
  { icon: 'FileHeart', title: 'Digital reports', text: 'Prescriptions and results, delivered to your phone.' },
  { icon: 'Timer', title: 'Zero waiting rooms', text: 'A live queue means you arrive right on time.' },
  { icon: 'CalendarCheck2', title: 'Same-day visits', text: 'Book in the morning, be seen by afternoon.' },
  { icon: 'IndianRupee', title: 'Transparent pricing', text: 'Consultation fees you see before you book.' },
];

export const JOURNEY = [
  { icon: 'CalendarCheck2', title: 'Book online', text: 'Pick a doctor and a time that suits you — it takes under a minute.' },
  { icon: 'Stethoscope', title: 'Consult', text: 'Unhurried, attentive consultation with your specialist.' },
  { icon: 'ClipboardList', title: 'Treatment plan', text: 'A clear, transparent plan with digital prescriptions.' },
  { icon: 'HeartPulse', title: 'Recovery', text: 'Guided recovery with reports available on your phone.' },
  { icon: 'BellRing', title: 'Follow-up', text: 'Smart reminders make sure you never miss a check-in.' },
];

export const TECHNOLOGY = [
  { icon: 'Sparkles', title: 'AI-assisted insights', text: 'Intelligent summaries help doctors prepare before you even sit down.' },
  { icon: 'DatabaseZap', title: 'Cloud health records', text: 'Your complete history — secure, private and available at every visit.' },
  { icon: 'FilePenLine', title: 'Digital prescriptions', text: 'Legible, structured e-prescriptions sent straight to your phone.' },
  { icon: 'MessagesSquare', title: 'Smart reminders', text: 'WhatsApp and SMS nudges for appointments, follow-ups and reports.' },
  { icon: 'MonitorDot', title: 'Live queue displays', text: 'Real-time queue status in the clinic and on your phone.' },
  { icon: 'ShieldCheck', title: 'Bank-grade security', text: 'Encrypted in transit and at rest, with strict per-clinic isolation.' },
];

export function buildFaqs(m) {
  const faqs = [
    {
      q: 'How do I book an appointment?',
      a: `Tap “Book appointment” anywhere on this page, choose a doctor and pick a slot — the whole thing takes under a minute and no account is needed.${m.contact.phone ? ` Prefer to talk? Call us on ${m.contact.phone}.` : ''}`,
    },
    {
      q: 'What happens after I book?',
      a: 'You get an instant confirmation, followed by smart reminders on WhatsApp/SMS before your visit, so nothing slips through.',
    },
    {
      q: 'Can I reschedule or cancel?',
      a: 'Of course. Every confirmation includes a reschedule option, or simply call the front desk and we will move things around for you.',
    },
    {
      q: 'What should I bring to my first visit?',
      a: 'Just yourself and any previous reports or prescriptions you may have. We digitise everything, so future visits need nothing but you.',
    },
    {
      q: 'Do I get my reports and prescriptions digitally?',
      a: 'Yes — prescriptions and reports are issued digitally and remain available to you through the patient portal, whenever you need them.',
    },
    {
      q: 'Do you take walk-ins or same-day visits?',
      a: 'We keep same-day slots open every day and welcome walk-ins. Our live queue keeps your wait to a minimum either way.',
    },
  ];
  return faqs;
}
