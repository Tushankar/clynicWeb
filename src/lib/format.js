import { format, parseISO } from 'date-fns';

const toDate = (d) => (typeof d === 'string' ? parseISO(d) : d);

export const fmtTime = (d) => (d ? format(toDate(d), 'h:mm a') : '');
export const fmtDate = (d) => (d ? format(toDate(d), 'd MMM yyyy') : '');
export const fmtDateTime = (d) => (d ? format(toDate(d), 'd MMM, h:mm a') : '');
export const todayISODate = () => format(new Date(), 'yyyy-MM-dd');

/** Rupees, grouped (en-IN) and rounded to paise — ONE formatter so every surface renders money
 * identically (previously each page had its own `inr`, and the portal showed raw unformatted rupees). */
export const inr = (v) => `₹${(Math.round((Number(v) || 0) * 100) / 100).toLocaleString('en-IN')}`;

export function ageFromDob(dob) {
  if (!dob) return null;
  const d = toDate(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 200 ? age : null;
}

/** Round to 2dp — the same rule the backend applies to money. */
export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Outstanding balance on an invoice — mirrors the backend's single definition
 * (clynicApi/src/lib/revenue.js). A cancelled or refunded invoice owes nothing, and an
 * overpayment clamps to zero rather than showing a negative due.
 */
export function balanceDue(invoice) {
  if (!invoice) return 0;
  if (!['unpaid', 'partially_paid'].includes(invoice.status)) return 0;
  return Math.max(0, round2((invoice.total || 0) - (invoice.amountPaid || 0)));
}

/**
 * Indian-format amount in words ("Rupees One Thousand Two Hundred and Fifty Only"), using the
 * lakh/crore scale. Expected on an Indian invoice — a payer checks it against the figures.
 */
export function rupeesInWords(amount) {
  const n = Math.floor(Math.abs(Number(amount) || 0));
  const paise = Math.round((Math.abs(Number(amount) || 0) - n) * 100);
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x) => (x < 20 ? ones[x] : `${tens[Math.floor(x / 10)]}${x % 10 ? ' ' + ones[x % 10] : ''}`);
  const three = (x) => (x >= 100 ? `${ones[Math.floor(x / 100)]} Hundred${x % 100 ? ' and ' + two(x % 100) : ''}` : two(x));

  if (n === 0 && paise === 0) return 'Rupees Zero Only';
  // Indian grouping: crore, lakh, thousand, then the last three digits.
  const parts = [];
  const push = (value, label) => { if (value) parts.push(`${three(value)} ${label}`); };
  push(Math.floor(n / 10000000), 'Crore');
  push(Math.floor((n % 10000000) / 100000), 'Lakh');
  push(Math.floor((n % 100000) / 1000), 'Thousand');
  const last = n % 1000;
  if (last) parts.push(three(last));

  const rupees = parts.length ? `Rupees ${parts.join(' ')}` : 'Rupees Zero';
  return paise ? `${rupees} and ${two(paise)} Paise Only` : `${rupees} Only`;
}
