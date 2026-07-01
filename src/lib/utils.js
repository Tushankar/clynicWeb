import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui className helper
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Normalize a Clerk org role (e.g. "org:doctor" / "admin") into a clinic staff role.
export function normalizeRole(rawRole) {
  if (!rawRole || typeof rawRole !== 'string') return null;
  let role = rawRole.startsWith('org:') ? rawRole.slice(4) : rawRole;
  role = role.toLowerCase().trim();
  if (role === 'admin') return 'owner';
  return ['owner', 'doctor', 'receptionist'].includes(role) ? role : role;
}
