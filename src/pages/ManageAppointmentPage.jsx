/**
 * Patient self-service — manage an appointment via a tokenized link (§5.20).
 * /manage/:token → view the booking, pick a new slot (reschedule), or cancel,
 * up to 2 hours before the visit. No login: the HMAC link is the key; the API
 * re-verifies everything server-side.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addDays, format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Stethoscope,
  Ticket,
  XCircle,
} from 'lucide-react';
import { LinkShell, LinkSplash, LinkError, TicketPanel } from '@/components/public/LinkPageShell';
import { SlotGrid } from '@/components/public/SlotPickerPublic';
import { EASE } from '@/components/site/templates/premium-signature/motion';
import { statusLabel } from '@/components/primitives';
import { apiFetch } from '@/lib/api/client';
import { fmtTime, todayISODate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';

const fmtLong = (iso) => format(new Date(iso), "EEEE, d MMMM yyyy 'at' h:mm a");

const STATUS_STYLE = {
  booked: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/30',
  confirmed: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/30',
  checked_in: 'bg-sky-400/15 text-sky-300 border-sky-300/30',
  in_consultation: 'bg-sky-400/15 text-sky-300 border-sky-300/30',
  completed: 'bg-white/10 text-slate-300 border-white/15',
  cancelled: 'bg-red-400/15 text-red-300 border-red-300/30',
  no_show: 'bg-amber-400/15 text-amber-300 border-amber-300/30',
};

function DateStrip({ value, onChange }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)), []);
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {days.map((d) => {
        const iso = format(d, 'yyyy-MM-dd');
        const active = iso === value;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onChange(iso)}
            aria-pressed={active}
            className={cn(
              'flex h-[62px] w-[52px] shrink-0 flex-col items-center justify-center rounded-2xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
              active
                ? 'border-transparent bg-[#0A1B3A] text-white shadow-[0_10px_24px_-8px_rgba(10,27,58,0.45)]'
                : 'border-slate-200/80 bg-white text-slate-600 hover:border-emerald-500/40'
            )}
          >
            <span className={cn('text-[10px] font-semibold uppercase tracking-wide', active ? 'text-emerald-300' : 'text-slate-400')}>
              {format(d, 'EEE')}
            </span>
            <span className="text-[17px] font-semibold leading-tight">{format(d, 'd')}</span>
          </button>
        );
      })}
      <label className="ml-1 flex h-[62px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-3 text-slate-500 transition-colors hover:border-emerald-500/50">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">More</span>
        <input type="date" className="sr-only" min={todayISODate()} value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
      </label>
    </div>
  );
}

export default function ManageAppointmentPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [mode, setMode] = useState('view'); // view | reschedule | cancel
  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState({ loading: false, items: [] });
  const [slot, setSlot] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [flash, setFlash] = useState(null); // success banner after an action

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/public/manage/${token}`, { auth: false });
      setData(res);
      setDate(format(new Date(res.appointment.scheduledAt), 'yyyy-MM-dd'));
    } catch (e) {
      setLoadError(e.message);
    }
  }, [token]);

  useEffect(() => {
    document.title = 'Manage appointment';
    load();
  }, [load]);

  // Slots for the reschedule pane.
  useEffect(() => {
    if (mode !== 'reschedule') return undefined;
    let active = true;
    setSlots({ loading: true, items: [] });
    setSlot('');
    apiFetch(`/api/public/manage/${token}/slots`, { auth: false, params: { date } })
      .then((d) => active && setSlots({ loading: false, items: (d.slots || []).filter((s) => s.available) }))
      .catch(() => active && setSlots({ loading: false, items: [] }));
    return () => {
      active = false;
    };
  }, [mode, date, token]);

  const act = async (path, body, successMsg) => {
    setErr(null);
    setBusy(true);
    try {
      const res = await apiFetch(`/api/public/manage/${token}/${path}`, { auth: false, method: 'POST', body });
      setData(res);
      setMode('view');
      setFlash(successMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loadError) return <LinkError message={loadError} />;
  if (!data) return <LinkSplash />;

  const { clinic, appointment: a, permissions } = data;
  const isCancelled = a.status === 'cancelled';
  const actionable = permissions.canReschedule || permissions.canCancel;

  return (
    <LinkShell clinic={clinic} badge="Your appointment">
      {flash && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" /> {flash}
        </motion.div>
      )}

      {/* Ticket */}
      <TicketPanel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">Appointment</p>
            <h1 className="pmx-display mt-2 text-[22px] font-semibold leading-snug tracking-tight sm:text-[26px]">
              {fmtLong(a.scheduledAt)}
            </h1>
          </div>
          <span className={cn('shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide', STATUS_STYLE[a.status] || STATUS_STYLE.completed)}>
            {statusLabel(a.status)}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Stethoscope className="h-3.5 w-3.5 text-emerald-300/80" aria-hidden="true" /> Doctor
            </p>
            <p className="mt-1.5 truncate text-[14.5px] font-semibold">{a.doctorName || '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <Ticket className="h-3.5 w-3.5 text-emerald-300/80" aria-hidden="true" /> Token
            </p>
            <p className="mt-1.5 text-[14.5px] font-semibold tabular-nums">{a.tokenNumber != null ? `#${a.tokenNumber}` : '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-emerald-300/80" aria-hidden="true" /> Where
            </p>
            <p className="mt-1.5 truncate text-[14.5px] font-semibold">{clinic.address || clinic.name}</p>
          </div>
        </div>

        <p className="mt-5 text-[12.5px] text-slate-400">
          Booked for <span className="font-medium text-slate-200">{a.patientName}</span>
          {a.prepaid && <span className="ml-2 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-emerald-300">Prepaid</span>}
        </p>
      </TicketPanel>

      {/* Actions */}
      <AnimatePresence mode="wait">
        {mode === 'view' && (
          <motion.div key="view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="mt-6">
            {actionable ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {permissions.canReschedule && (
                  <button
                    type="button"
                    onClick={() => setMode('reschedule')}
                    className="group flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-white px-5 py-4 text-left shadow-[0_12px_32px_-16px_rgba(10,27,58,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A1B3A] text-emerald-300">
                        <CalendarClock className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-semibold text-[#0B1220]">Reschedule</span>
                        <span className="block text-[12.5px] text-slate-500">Pick a new date & time — free</span>
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                )}
                {permissions.canCancel && (
                  <button
                    type="button"
                    onClick={() => setMode('cancel')}
                    className="group flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-white px-5 py-4 text-left shadow-[0_12px_32px_-16px_rgba(10,27,58,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <span className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <CalendarX2 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-semibold text-[#0B1220]">Cancel visit</span>
                        <span className="block text-[12.5px] text-slate-500">Frees the slot for someone else</span>
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-[22px] border border-slate-200/80 bg-white px-5 py-5 text-center shadow-[0_12px_32px_-16px_rgba(10,27,58,0.12)]">
                <p className="text-sm font-medium text-slate-700">
                  {isCancelled
                    ? 'This appointment has been cancelled.'
                    : a.status === 'completed'
                      ? 'This visit is complete — thank you for coming in.'
                      : `Online changes close ${permissions.leadMinutes / 60} hours before the visit.`}
                </p>
                {clinic.phone && !isCancelled && a.status !== 'completed' && (
                  <p className="mt-1.5 text-[13px] text-slate-500">
                    Need to change it? Call us on{' '}
                    <a className="font-semibold text-[#0A1B3A] underline decoration-emerald-400 decoration-2 underline-offset-2" href={`tel:${clinic.phone.replace(/[^+\d]/g, '')}`}>
                      {clinic.phone}
                    </a>
                    .
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {mode === 'reschedule' && (
          <motion.section key="reschedule" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="mt-6 rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_48px_-20px_rgba(10,27,58,0.18)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="pmx-display text-[17px] font-semibold tracking-tight text-[#0A1B3A]">Pick a new time</h2>
              <button type="button" onClick={() => setMode('view')} className="flex items-center gap-1 text-[13px] font-medium text-slate-500 transition-colors hover:text-[#0A1B3A]">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back
              </button>
            </div>
            <DateStrip value={date} onChange={setDate} />
            <div className="mt-5">
              {slots.loading ? (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-11 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : slots.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">No open slots that day</p>
                  <p className="mt-1 text-[12.5px] text-slate-400">Try another date.</p>
                </div>
              ) : (
                <SlotGrid slots={slots.items} value={slot} onChange={setSlot} />
              )}
            </div>
            {err && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{err}</p>}
            <button
              type="button"
              disabled={!slot || busy}
              onClick={() => act('reschedule', { scheduledAt: slot }, `Rescheduled to ${format(parseISO(date), 'EEE, d MMM')} · ${slot ? fmtTime(slot) : ''}. A fresh confirmation is on its way.`)}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A1B3A] text-[14.5px] font-semibold text-white shadow-[0_14px_32px_-10px_rgba(10,27,58,0.5)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CalendarClock className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
              {busy ? 'Moving your visit…' : slot ? `Confirm ${fmtTime(slot)}` : 'Select a time'}
            </button>
          </motion.section>
        )}

        {mode === 'cancel' && (
          <motion.section key="cancel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="mt-6 rounded-[26px] border border-red-100 bg-white p-5 shadow-[0_20px_48px_-20px_rgba(10,27,58,0.18)] sm:p-6">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="pmx-display text-[17px] font-semibold tracking-tight text-[#0A1B3A]">Cancel this appointment?</h2>
                <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">
                  Your slot with {a.doctorName} on {fmtLong(a.scheduledAt)} will be released. This can't be undone — you can always book again.
                </p>
              </div>
            </div>
            {err && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{err}</p>}
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="h-12 rounded-2xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-700 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Keep my appointment
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => act('cancel', {}, 'Your appointment has been cancelled.')}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 text-[14px] font-semibold text-white shadow-[0_14px_32px_-10px_rgba(220,38,38,0.45)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CalendarX2 className="h-4 w-4" aria-hidden="true" />}
                {busy ? 'Cancelling…' : 'Yes, cancel it'}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </LinkShell>
  );
}
