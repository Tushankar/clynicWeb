import { cn } from '@/lib/utils';

/**
 * Payment state for an appointment row (from the server-enriched `billing`):
 *   prepaid → paid online · paid → invoice settled · partial → part-paid ·
 *   unpaid → invoice raised, nothing paid · none → not billed yet (shows expected fee).
 */
const inr = (v) => `₹${(Math.round((v ?? 0) * 100) / 100).toLocaleString('en-IN')}`;

const META = {
  prepaid: { cls: 'bg-emerald-50 text-emerald-700', label: (b) => `Prepaid ${inr(b.paid)}` },
  paid: { cls: 'bg-success/10 text-success', label: (b) => `Paid ${inr(b.paid)}` },
  partial: { cls: 'bg-warning/15 text-warning', label: (b) => `Due ${inr(b.due)}` },
  unpaid: { cls: 'bg-destructive/10 text-destructive', label: (b) => `Due ${inr(b.due)}` },
  none: { cls: 'bg-muted text-muted-foreground', label: (b) => (b.fee > 0 ? `${inr(b.fee)} fee` : 'No fee') },
};

export function PaymentBadge({ billing, className }) {
  if (!billing) return <span className="text-muted-foreground">—</span>;
  const m = META[billing.status] || META.none;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular', m.cls, className)}>
      {m.label(billing)}
    </span>
  );
}
