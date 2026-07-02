import { cn } from '@/lib/utils';

// Soft tint pairs (bg + text) — a calm, professional palette. Chosen deterministically
// per name so the same person always gets the same color.
const TINTS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-teal-100 text-teal-700',
  'bg-slate-200 text-slate-700',
];

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  // Skip honorifics so "Dr. Anjan Sen" → "AS", not "DA".
  const words = parts.filter((w) => !/^(dr|mr|mrs|ms|prof|miss)\.?$/i.test(w));
  const use = words.length ? words : parts;
  const first = use[0][0] || '';
  const second = use.length > 1 ? use[use.length - 1][0] : use[0][1] || '';
  return (first + second).toUpperCase();
}

function tintFor(name) {
  const s = String(name || '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

/**
 * Initials avatar — a colored circle with a person's initials. Deterministic color per name.
 * Used in person tables (doctors, patients) for a professional, scannable row.
 */
export function Avatar({ name, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold', tintFor(name), className)}
    >
      {initials(name)}
    </span>
  );
}
