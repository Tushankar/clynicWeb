import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Moon, Sun, Sunrise, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/client';

/**
 * Public (no-auth) slot grid for the booking page — Premium Signature styling.
 * Slots are grouped by time of day; selection is an emerald-ringed navy pill.
 * Handles all four states (loading / error / empty / ready); when a day is fully
 * booked and the clinic's plan includes the waitlist, the empty state becomes a
 * "join the waitlist" card (§5.21).
 */

const INPUT =
  'h-11 w-full rounded-xl border border-slate-200/90 bg-white px-3.5 text-[14px] text-[#0B1220] placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10';

/** Presentational grouped slot grid — reused by booking + the public manage page. */
export function SlotGrid({ slots, value, onChange }) {
  const hourOf = (iso) => new Date(iso).getHours();
  const groups = [
    { label: 'Morning', icon: Sunrise, slots: slots.filter((s) => hourOf(s.start) < 12) },
    { label: 'Afternoon', icon: Sun, slots: slots.filter((s) => hourOf(s.start) >= 12 && hourOf(s.start) < 17) },
    { label: 'Evening', icon: Moon, slots: slots.filter((s) => hourOf(s.start) >= 17) },
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

/** Inline "join the waitlist" card shown when a day is fully booked (§5.21). */
function WaitlistCard({ slug, doctorId, date }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  const join = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await apiFetch(`/api/public/c/${slug}/waitlist`, {
        auth: false,
        method: 'POST',
        body: { doctorId, date, name: form.name, phone: form.phone, email: form.email },
      });
      setDone(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-5 py-6 text-center">
        <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-emerald-900">
          {done.already ? "You're already on the waitlist for this day" : "You're on the waitlist"}
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-emerald-700/90">
          If a slot frees up we'll message you right away — first come, first served.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600">No open slots that day</p>
        <p className="mt-1 text-[12.5px] text-slate-400">Try another date — or leave your number and we'll message you if a slot frees up.</p>
      </div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto mt-4 flex h-11 items-center gap-2 rounded-2xl bg-[#0A1B3A] px-5 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(10,27,58,0.45)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <UsersRound className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Join the waitlist
        </button>
      ) : (
        <div className="mx-auto mt-4 max-w-sm space-y-2.5">
          <input className={INPUT} placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className={INPUT} type="tel" inputMode="numeric" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <input className={INPUT} type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          {error && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12.5px] text-red-600">{error}</p>}
          <button
            type="button"
            onClick={join}
            disabled={busy || !form.name.trim() || (!form.phone.trim() && !form.email.trim())}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A1B3A] text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(10,27,58,0.45)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UsersRound className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
            {busy ? 'Adding you…' : 'Notify me if a slot opens'}
          </button>
        </div>
      )}
    </div>
  );
}

export function SlotPickerPublic({ slug, doctorId, date, value, onChange }) {
  const [state, setState] = useState({ loading: false, error: null, slots: [], waitlistAvailable: false });

  useEffect(() => {
    if (!doctorId || !date) return undefined;
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    apiFetch(`/api/public/c/${slug}/slots`, { auth: false, params: { doctorId, date } })
      .then((d) => active && setState({ loading: false, error: null, slots: d.slots || [], waitlistAvailable: !!d.waitlistAvailable }))
      .catch((e) => active && setState({ loading: false, error: e.message, slots: [], waitlistAvailable: false }));
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
    if (state.waitlistAvailable) {
      return <WaitlistCard key={`${doctorId}-${date}`} slug={slug} doctorId={doctorId} date={date} />;
    }
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">
        <p className="text-sm font-medium text-slate-600">No open slots that day</p>
        <p className="mt-1 text-[12.5px] text-slate-400">Try another date — same-day slots open every morning.</p>
      </div>
    );
  }

  return <SlotGrid slots={available} value={value} onChange={onChange} />;
}
