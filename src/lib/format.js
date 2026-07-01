import { format, parseISO } from 'date-fns';

const toDate = (d) => (typeof d === 'string' ? parseISO(d) : d);

export const fmtTime = (d) => (d ? format(toDate(d), 'h:mm a') : '');
export const fmtDate = (d) => (d ? format(toDate(d), 'd MMM yyyy') : '');
export const fmtDateTime = (d) => (d ? format(toDate(d), 'd MMM, h:mm a') : '');
export const todayISODate = () => format(new Date(), 'yyyy-MM-dd');

export function ageFromDob(dob) {
  if (!dob) return null;
  const d = toDate(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 200 ? age : null;
}
