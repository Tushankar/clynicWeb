/**
 * QR self check-in (§5.24, Premium) — /c/:slug/checkin. The patient scans the QR at
 * the door, types the mobile number they booked with, and lands in the live queue:
 * giant token, live position, wait estimate. Kiosk-scale type; position updates by
 * polling the public queue snapshot (same source as the waiting-room TV).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, Loader2, LogIn, PartyPopper, Phone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { LinkShell, LinkSplash, LinkError } from '@/components/public/LinkPageShell';
import { apiFetch } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const POLL_MS = 10000;

export default function SelfCheckinPage() {
  const { slug } = useParams();
  const [ctx, setCtx] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);
  const [chooseFrom, setChooseFrom] = useState(null); // [{ appointmentId, name, token, doctorName }]
  const [live, setLive] = useState(null); // { position, waitMinutes, serving }
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = 'Self check-in';
    apiFetch(`/api/public/c/${slug}/checkin`, { auth: false })
      .then(setCtx)
      .catch((e) => setLoadError(e.message));
  }, [slug]);

  useEffect(() => {
    if (ctx && !result) inputRef.current?.focus();
  }, [ctx, result]);

  const checkin = async (appointmentId) => {
    setErr(null);
    setBusy(true);
    try {
      const res = await apiFetch(`/api/public/c/${slug}/checkin`, { auth: false, method: 'POST', body: { phone, ...(appointmentId ? { appointmentId } : {}) } });
      if (res.chooseFrom) {
        // Shared number with more than one person booked today — ask who is checking in.
        setChooseFrom(res.chooseFrom);
        return;
      }
      setChooseFrom(null);
      setResult(res);
      setLive(res.queue ? { position: res.queue.position, waitMinutes: res.queue.waitMinutes, serving: res.queue.nowServing || [] } : null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  // Live position: poll the same public snapshot the waiting-room TV uses.
  const poll = useCallback(async () => {
    if (!result?.token) return;
    try {
      const d = await apiFetch(`/api/public/c/${slug}/queue`, { auth: false, params: result.queue?.branchId ? { branchId: result.queue.branchId } : {} });
      const snap = d.snapshot || {};
      const idx = (snap.waiting || []).findIndex((w) => w.token === result.token);
      setLive({
        position: idx >= 0 ? idx + 1 : 0,
        waitMinutes: idx >= 0 ? snap.waiting[idx].waitMinutes : 0,
        serving: (snap.nowServing || []).map((e) => e.token),
      });
    } catch {
      /* transient poll failure — keep the last known position */
    }
  }, [slug, result]);

  useEffect(() => {
    if (!result?.token) return undefined;
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [poll, result]);

  if (loadError) return <LinkError title="Self check-in unavailable" message={loadError} />;
  if (!ctx) return <LinkSplash />;

  const beingSeen = live && live.position === 0;

  return (
    <LinkShell clinic={ctx.clinic} badge="Self check-in">
      <AnimatePresence mode="wait">
        {!result ? (
          chooseFrom ? (
            <motion.section
              key="choose"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(10,27,58,0.18)] sm:p-8"
            >
              <h1 className="pmx-display text-center text-[22px] font-semibold tracking-tight text-[#0A1B3A]">Who’s checking in?</h1>
              <p className="mx-auto mt-2 max-w-sm text-center text-[14px] text-slate-500">More than one person is booked today on this number. Tap your name.</p>
              <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2.5">
                {chooseFrom.map((p) => (
                  <button
                    key={p.appointmentId}
                    type="button"
                    disabled={busy}
                    onClick={() => checkin(p.appointmentId)}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-emerald-500/60 hover:bg-emerald-50/40 disabled:opacity-50"
                  >
                    <span>
                      <span className="block text-[15px] font-semibold text-[#0A1B3A]">{p.name}</span>
                      <span className="block text-[12.5px] text-slate-500">{p.doctorName || 'Consultation'} · token #{p.token}</span>
                    </span>
                    <LogIn className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  </button>
                ))}
              </div>
              {err && <p className="mx-auto mt-4 max-w-sm rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-center text-[13px] text-red-600">{err}</p>}
              <button type="button" onClick={() => { setChooseFrom(null); setErr(null); }} className="mx-auto mt-5 block text-[13px] font-medium text-slate-400 hover:text-slate-600">← Use a different number</button>
            </motion.section>
          ) : (
          <motion.section
            key="form"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[28px] border border-slate-200/80 bg-white p-6 text-center shadow-[0_24px_60px_-24px_rgba(10,27,58,0.18)] sm:p-10"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A1B3A]">
              <LogIn className="h-6 w-6 text-emerald-300" aria-hidden="true" />
            </span>
            <h1 className="pmx-display mt-5 text-[24px] font-semibold tracking-tight text-[#0A1B3A] sm:text-[28px]">
              Welcome — check yourself in
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-slate-500">
              Enter the mobile number you booked with and we'll add you to today's queue.
            </p>

            <div className="relative mx-auto mt-7 max-w-sm">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" aria-hidden="true" />
              <input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && phone.replace(/\D/g, '').length >= 10 && checkin()}
                className="h-14 w-full rounded-2xl border border-slate-200/90 bg-white pl-12 pr-4 text-center text-[19px] font-semibold tracking-[0.06em] text-[#0B1220] tabular-nums placeholder:text-[14px] placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {err && <p className="mx-auto mt-4 max-w-sm rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{err}</p>}

            <button
              type="button"
              onClick={checkin}
              disabled={busy || phone.replace(/\D/g, '').length < 10}
              className="mx-auto mt-6 flex h-13 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#0A1B3A] py-4 text-[15px] font-semibold text-white shadow-[0_16px_36px_-10px_rgba(10,27,58,0.5)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <LogIn className="h-5 w-5 text-emerald-300" aria-hidden="true" />}
              {busy ? 'Finding your booking…' : 'Check in'}
            </button>
            <p className="mt-4 text-[12px] text-slate-400">No booking today? The front desk will be happy to help.</p>
          </motion.section>
          )
        ) : (
          <motion.section key="done" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="rounded-[28px] bg-[#0A1B3A] p-8 text-center text-white shadow-[0_32px_80px_-28px_rgba(10,27,58,0.55)] sm:p-10">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                {result.already ? `Welcome back, ${result.name}` : `You're checked in, ${result.name}`}
              </p>
              <p className="pmx-display mt-4 text-[88px] font-semibold leading-none tracking-tight sm:text-[110px]">
                #{result.token}
              </p>
              <p className="mt-3 text-[14px] text-slate-300">
                {result.doctorName ? `${result.doctorName} · ` : ''}your token number
              </p>

              <div className="mx-auto mt-7 grid max-w-sm grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">Position</p>
                  <p className="mt-1 text-[26px] font-semibold tabular-nums">
                    {beingSeen ? <BellRing className="mx-auto h-7 w-7 text-emerald-300" aria-hidden="true" /> : live?.position ?? '—'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">Est. wait</p>
                  <p className="mt-1 text-[26px] font-semibold tabular-nums">{beingSeen ? 'Now' : `${live?.waitMinutes ?? '—'}m`}</p>
                </div>
              </div>

              <p className={cn('mt-6 text-[13px]', beingSeen ? 'font-semibold text-emerald-300' : 'text-slate-400')}>
                {beingSeen ? "It's your turn — please head to the consultation room." : 'Keep this page open — your position updates automatically.'}
              </p>
            </div>

            {!result.already && (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] font-medium text-emerald-800">
                <PartyPopper className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                Take a seat — we'll call your token on the screen.
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </LinkShell>
  );
}
