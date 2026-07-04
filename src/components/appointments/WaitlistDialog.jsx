import { CalendarPlus, Check, Mail, Phone, Trash2, UsersRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingSkeleton, Avatar } from '@/components/primitives';
import { useWaitlist, useSetWaitlistStatus } from '@/hooks/useSchedule';
import { fmtDate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';

/**
 * Cancellation waitlist (§5.21) — the front desk's view. Entries for the selected
 * day (or all upcoming); freed slots auto-notify the first few, and staff can mark
 * someone booked (after booking them normally) or remove them.
 */

const STATUS_CLS = {
  waiting: 'bg-warning/15 text-warning',
  notified: 'bg-info/10 text-info',
  booked: 'bg-success/10 text-success',
};

export function WaitlistDialog({ open, onOpenChange, date }) {
  const { data, isLoading } = useWaitlist(date ? { date } : {}, { enabled: open });
  const setStatus = useSetWaitlistStatus();
  const items = data?.items || [];

  const act = async (entry, status, msg) => {
    try {
      await setStatus.mutateAsync({ id: entry._id, status });
      toast.success(msg);
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Waitlist{date ? ` · ${fmtDate(date)}` : ''}</DialogTitle>
          <DialogDescription>
            When a slot frees up, the first {3} waiting patients are messaged automatically — first come, first served.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingSkeleton lines={4} />
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed">
            <EmptyState
              icon={UsersRound}
              title="Nobody's waiting"
              description={date ? 'No waitlist entries for this day.' : 'When a day is fully booked, patients can join the waitlist from the booking page.'}
            />
          </div>
        ) : (
          <ul className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
            {items.map((e) => (
              <li key={e._id} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3.5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={e.name} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{e.name}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', STATUS_CLS[e.status] || 'bg-muted')}>{e.status}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{e.doctorName}</span>
                      <span>{fmtDate(e.date)}</span>
                      {e.phone && (
                        <a className="inline-flex items-center gap-1 hover:text-foreground" href={`tel:${e.phone.replace(/[^+\d]/g, '')}`}>
                          <Phone className="h-3 w-3" /> {e.phone}
                        </a>
                      )}
                      {e.email && (
                        <a className="inline-flex items-center gap-1 hover:text-foreground" href={`mailto:${e.email}`}>
                          <Mail className="h-3 w-3" /> {e.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Mark booked"
                    title="Mark booked (after booking them an appointment)"
                    className="text-muted-foreground hover:text-success"
                    onClick={() => act(e, 'booked', `${e.name} marked as booked`)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => act(e, 'removed', 'Removed from the waitlist')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <CalendarPlus className="h-3.5 w-3.5" /> To seat someone from here, book them a normal appointment — their entry auto-converts to booked.
        </p>
      </DialogContent>
    </Dialog>
  );
}
