import { cn } from '@/lib/utils';

/**
 * StatusBadge — color-mapped to appointment status (section 8.5).
 * Colors come from semantic theme tokens only (no stray hex).
 */
const STATUS = {
  booked: { label: 'Booked', cls: 'bg-secondary text-secondary-foreground' },
  confirmed: { label: 'Confirmed', cls: 'bg-primary/10 text-primary' },
  checked_in: { label: 'Checked in', cls: 'bg-info/10 text-info' },
  in_consultation: { label: 'In consultation', cls: 'bg-warning/15 text-warning' },
  completed: { label: 'Completed', cls: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', cls: 'bg-destructive/10 text-destructive' },
  no_show: { label: 'No-show', cls: 'bg-muted text-muted-foreground line-through decoration-muted-foreground/40' },
};

export const APPOINTMENT_STATUSES = Object.keys(STATUS);
export const statusLabel = (status) => STATUS[status]?.label || status;

export function StatusBadge({ status, className }) {
  const cfg = STATUS[status] || { label: status, cls: 'bg-muted text-muted-foreground' };
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.cls, className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
