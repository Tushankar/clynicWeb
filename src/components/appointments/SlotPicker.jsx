import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useSlots } from '@/hooks/useAppointments';

/** A grid of bookable time slots for a doctor on a date. Handles all four states. */
export function SlotPicker({ doctorId, date, value, onChange }) {
  const { data, isLoading, isError, error } = useSlots(doctorId, date);
  const slots = data?.slots || [];
  const available = slots.filter((s) => s.available);

  if (!doctorId || !date) {
    return <p className="text-sm text-muted-foreground">Pick a doctor and date to see times.</p>;
  }
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    );
  }
  if (isError) return <p className="text-sm text-destructive">{error?.message || 'Could not load slots.'}</p>;
  if (available.length === 0) {
    return <p className="text-sm text-muted-foreground">No open slots that day. Try another date.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {available.map((s) => (
        <button
          key={s.start}
          type="button"
          onClick={() => onChange(s.start)}
          className={cn(
            'rounded-md border px-2 py-2 text-sm transition-colors',
            value === s.start
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input hover:border-primary hover:bg-accent'
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
