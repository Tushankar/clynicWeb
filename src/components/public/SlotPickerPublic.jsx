import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api/client';

/** Public (no-auth) slot grid for the booking page. Handles all four states. */
export function SlotPickerPublic({ slug, doctorId, date, value, onChange }) {
  const [state, setState] = useState({ loading: false, error: null, slots: [] });

  useEffect(() => {
    if (!doctorId || !date) return undefined;
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch(`/api/public/c/${slug}/slots`, { auth: false, params: { doctorId, date } })
      .then((d) => active && setState({ loading: false, error: null, slots: d.slots || [] }))
      .catch((e) => active && setState({ loading: false, error: e.message, slots: [] }));
    return () => {
      active = false;
    };
  }, [slug, doctorId, date]);

  const available = state.slots.filter((s) => s.available);

  if (state.loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    );
  }
  if (state.error) return <p className="text-sm text-destructive">{state.error}</p>;
  if (available.length === 0) return <p className="text-sm text-muted-foreground">No open slots that day. Try another date.</p>;

  return (
    <div className="grid grid-cols-3 gap-2">
      {available.map((s) => (
        <button
          key={s.start}
          type="button"
          onClick={() => onChange(s.start)}
          className={cn(
            'rounded-md border px-2 py-2 text-sm transition-colors',
            value === s.start ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:border-primary hover:bg-accent'
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
