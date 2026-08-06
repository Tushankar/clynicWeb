/**
 * Premium Signature — design tokens, data massaging and content builders.
 *
 * The template ships its own opinionated luxury palette (deep navy + modern emerald on
 * porcelain #F8FAFC) instead of inheriting --site-primary, so every clinic that picks
 * "Premium Signature" gets the flagship look. All copy defaults below are generic,
 * owner-editable marketing scaffolding — anything the CMS provides always wins.
 */

// ---- palette ------------------------------------------------------------------------
/**
 * The one Clynic green ramp. These match the CSS tokens in index.css (--primary /
 * --brand-*), so the public website, the booking flow, the storefront and the dashboard
 * all read as a single product.
 */
export const BRAND = {
  bright: '#0BB89F', // accents, glows
  primary: '#0E8C72', // buttons, links, focus
  deep: '#0A6A56', // hover / gradient end
  forest: '#012F24', // dark surfaces
  forestDeep: '#001f18',
  tint: '#EBF6F3', // soft green wash
};

export const C = {
  bg: '#FAF8F5',
  ink: '#012F24', // near-black headings (forest dark)
  body: '#3A4D44', // dark forest muted
  muted: '#5A6E64',
  navy: '#012F24', // legacy aliases — kept so existing call sites stay valid
  navy2: '#001f18',
  navyDeep: '#00100c',
  em: '#0E8C72',
  em2: '#0BB89F',
  em3: '#0A6A56',
  line: 'rgba(1,47,36,0.08)',
};

// Gradient recipes reused across icon tiles / avatars — all inside the brand green family.
export const GRADIENTS = [
  'linear-gradient(135deg,#012F24 0%,#0A6A56 100%)', // forest → deep
  'linear-gradient(135deg,#0A6A56 0%,#0E8C72 100%)', // deep → primary
  'linear-gradient(135deg,#0E8C72 0%,#0BB89F 100%)', // primary → bright
  'linear-gradient(135deg,#012F24 0%,#2DD4BF 100%)', // forest → teal
  'linear-gradient(135deg,#001f18 0%,#6EE7B7 100%)', // deep forest → sea green
  'linear-gradient(135deg,#0A6A56 0%,#34D399 100%)', // deep → mint
];

export const SHADOW = {
  sm: '0 1px 2px rgba(0,90,54,0.05), 0 6px 20px -8px rgba(0,90,54,0.08)',
  md: '0 2px 4px rgba(0,90,54,0.04), 0 16px 40px -12px rgba(0,90,54,0.12)',
  lg: '0 2px 6px rgba(0,90,54,0.05), 0 32px 72px -20px rgba(0,90,54,0.22)',
  glow: '0 12px 40px -8px rgba(0,90,54,0.3)',
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

const str = (v) => (typeof v === 'string' ? v.trim() : '');

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
  const pages = (site.pages || []).filter((p) => p && p.slug && p.title);
  // Gallery is the clinic's OWN photos only — we never pad it with stock imagery, so the
  // section (and its nav link) simply disappear until the owner uploads some.
  const gallery = content.gallery || [];

  // The flagship (platform) site falls back to the real Clynic wordmark — the same
  // asset the dashboard sidebar uses. Tenant clinics keep the monogram fallback.
  const MAIN_SLUG = import.meta.env.VITE_MAIN_SITE_SLUG || 'clynic';
  const theme = site.theme || {};
  const logoUrl = theme.logoUrl || (slug === MAIN_SLUG ? '/clynic-logo.svg' : '');

  const rating = avgRating(reviews);
  const phone = contact.phone || clinic.phone || '';
  const whatsapp = waLink(contact.whatsapp);
  const city = (contact.address || clinic.address || '').split(',').pop()?.trim() || '';

  return {
    slug,
    clinic,
    theme: { ...theme, logoUrl },
    name: clinic.name || 'Our Clinic',
    bookHref: `/c/${slug}/book`,
    portalHref: `/portal/${slug}`,
    // Online pharmacy (Ultra Premium only). `site.store` is the plan flag from the API; when it
    // is false the storefront routes 404, so every store affordance must stay hidden.
    store: site.store === true,
    storeHref: `/c/${slug}/store`,
    pageHref: (pageSlug) => `/c/${slug}/p/${pageSlug}`,
    hero: {
      // The CMS headline always wins; the flagship default only fills the gap.
      headline: hero.headline || '',
      tagline:
        hero.tagline ||
        'Modern clinical care with same-day appointments, digital records and doctors who listen.',
      imageUrl: hero.imageUrl || '',
    },
    about: content.about || '',
    services,
    gallery,
    doctors,
    reviews,
    pages,
    contact: { ...contact, phone, whatsapp, address: contact.address || clinic.address || '' },
    mapEmbed: content.mapEmbed || '',
    rating,
    city,
    seo: site.seo || {},
  };
}

// ---- section content builders ----------------------------------------------------------

/**
 * Hero stat strip. Every figure is derived from what the clinic actually publishes; the
 * generic fallbacks only apply to a brand-new site that has no doctors/services/reviews yet.
 */
export function buildHeroStats(m) {
  const stats = [];
  if (m.doctors.length) stats.push({ value: `${m.doctors.length}`, label: 'Specialists' });
  else stats.push({ value: '24/7', label: 'Online booking' });

  const serviceCount = m.services.length || new Set(m.doctors.map((d) => d.specialization).filter(Boolean)).size;
  if (serviceCount) stats.push({ value: `${serviceCount}`, label: 'Services' });
  else stats.push({ value: 'Same-day', label: 'Appointments' });

  const exp = Math.max(0, ...m.doctors.map((d) => Number(d.experienceYears) || 0));
  if (exp > 0) stats.push({ value: `${exp}+`, label: 'Years experience' });
  else stats.push({ value: '24/7', label: 'Support' });

  if (m.reviews.length) stats.push({ value: `${m.rating}`, label: `${m.reviews.length} reviews` });
  else stats.push({ value: 'Digital', label: 'Records & Rx' });

  return stats.slice(0, 4);
}

/**
 * Service cards for the two-row accordion. CMS services are mapped onto the template's
 * curated artwork (round-robin) so an owner only has to type a name + description; when the
 * CMS has none we fall back to the flagship's default set so the page is never empty.
 */
const SERVICE_ART = [
  '/service_book_appointment.png',
  '/service_online_consultation.png',
  '/service_buy_medicines.png',
  '/service_lab_tests.png',
  '/service_health_records.png',
  '/service_emergency_support.png',
  '/service_health_insurance.png',
  '/service_prescription_upload.png',
];

const DEFAULT_SERVICES = [
  { name: 'Book Appointment', description: 'Book appointments, consult expert doctors.', extraDesc: 'Schedule visits with our top-rated medical professionals for personalised medicine and care.' },
  { name: 'Online Consultation', description: 'Talk to a doctor from anywhere.', extraDesc: 'Get medical advice from the comfort of your home through our seamless consultation flow.' },
  { name: 'Buy Medicines', description: 'Order your prescribed medicines.', extraDesc: 'Order your prescribed medicines directly to your door with easy cash or online payment options.' },
  { name: 'Lab Tests', description: 'Diagnostics without the queue.', extraDesc: 'Book comprehensive health checkups and get your reports delivered digitally.' },
  { name: 'Health Records', description: 'Your history, always with you.', extraDesc: 'Keep all your vital health records organised and securely accessible in one digital place.', badge: 'SECURE' },
  { name: 'Emergency Support', description: 'Help when it matters most.', extraDesc: 'Immediate emergency response and open access to comprehensive medical support.', badge: '24/7' },
  { name: 'Follow-up Care', description: 'We check in, so you don’t forget.', extraDesc: 'Smart WhatsApp and SMS reminders keep your treatment plan on track between visits.', badge: 'EASY' },
  { name: 'Prescription Upload', description: 'Upload prescription details.', extraDesc: 'Easily upload your doctor’s prescription to instantly order medicines for home delivery.', badge: 'FAST' },
];

const ROW2_BADGES = ['SECURE', '24/7', 'EASY', 'FAST'];

export function buildServiceCards(m) {
  const source = m.services.length
    ? m.services.map((s, i) => ({
        name: str(s.name),
        description: str(s.description) || `Expert ${str(s.name).toLowerCase()} care at ${m.name}.`,
        extraDesc: str(s.description) || `Talk to our team about ${str(s.name).toLowerCase()} — book online in under a minute.`,
        badge: ROW2_BADGES[i % ROW2_BADGES.length],
      }))
    : DEFAULT_SERVICES;
  return source.filter((s) => s.name).map((s, i) => ({ ...s, img: SERVICE_ART[i % SERVICE_ART.length] }));
}

/**
 * Primary navigation. Only links to sections that will actually render, then appends the
 * clinic's published custom pages (CMS_ADVANCED) so they are reachable from every page.
 */
export function buildNavLinks(m) {
  const links = [{ label: 'Home', href: '#top' }, { label: 'Services', href: '#services' }];
  if (m.doctors.length) links.push({ label: 'Doctors', href: '#doctors' });
  if (m.store) links.push({ label: 'Pharmacy', href: '#pharmacy' });
  links.push({ label: 'How It Works', href: '#how-it-works' });
  if (m.reviews.length) links.push({ label: 'Stories', href: '#stories' });
  if (m.gallery.length) links.push({ label: 'Gallery', href: '#gallery' });
  links.push({ label: 'Contact', href: '#contact' });
  return links;
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
