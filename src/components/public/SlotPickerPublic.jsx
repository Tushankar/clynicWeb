import { useEffect, useState } from 'react';
import { Moon, Sun, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/client';

/**
 * Public (no-auth) slot grid for the booking page — Premium Signature styling.
 * Slots are grouped by time of day; selection is an emerald-ringed navy pill.
 * Handles all four states (loading / error / empty / ready).
 */
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
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }
  if (state.error) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
    );
  }
  if (available.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">
        <p className="text-sm font-medium text-slate-600">No open slots that day</p>
        <p className="mt-1 text-[12.5px] text-slate-400">Try another date — same-day slots open every morning.</p>
      </div>
    );
  }

  // Group by time of day for scannability.
  const hourOf = (iso) => new Date(iso).getHours();
  const groups = [
    { label: 'Morning', icon: Sunrise, slots: available.filter((s) => hourOf(s.start) < 12) },
    { label: 'Afternoon', icon: Sun, slots: available.filter((s) => hourOf(s.start) >= 12 && hourOf(s.start) < 17) },
    { label: 'Evening', icon: Moon, slots: available.filter((s) => hourOf(s.start) >= 17) },
  ].filter((g) => g.slots.length);

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <g.icon className="h-3.5 w-3.5 text-emerald-600/70" aria-hidden="true" />
            {g.label}
          </p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {g.slots.map((s) => {
              const selected = value === s.start;
              return (
                <button
                  key={s.start}
                  type="button"
                  onClick={() => onChange(s.start)}
                  aria-pressed={selected}
                  className={cn(
                    'h-11 rounded-2xl border text-[13.5px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
                    selected
                      ? 'border-transparent bg-[#0A1B3A] text-white shadow-[0_10px_24px_-8px_rgba(10,27,58,0.45)] ring-2 ring-emerald-400/70 ring-offset-1'
                      : 'border-slate-200/80 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:text-[#0B1220] hover:shadow-[0_8px_20px_-10px_rgba(10,27,58,0.25)]'
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
