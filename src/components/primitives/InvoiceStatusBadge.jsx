import { cn } from '@/lib/utils';

/**
 * InvoiceStatusBadge — one label+colour map for invoice status, so Billing, the invoice dialog,
 * and the patient-facing pay/portal pages render it identically (the map used to be copy-pasted).
 */
const INVOICE_STATUS = {
  paid: { label: 'Paid', cls: 'bg-success/10 text-success' },
  partially_paid: { label: 'Partially paid', cls: 'bg-warning/15 text-warning' },
  unpaid: { label: 'Unpaid', cls: 'bg-secondary text-secondary-foreground' },
  refunded: { label: 'Refunded', cls: 'bg-info/10 text-info' },
  cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-foreground' },
  draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground' },
};

export const invoiceStatusLabel = (s) => INVOICE_STATUS[s]?.label || s;

export function InvoiceStatusBadge({ status, className }) {
  const cfg = INVOICE_STATUS[status] || { label: status, cls: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.cls, className)}>
      {cfg.label}
    </span>
  );
}

export default InvoiceStatusBadge;
