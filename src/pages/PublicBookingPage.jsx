/**
 * Public booking (§ /c/:slug/book) — Premium Signature edition.
 *
 * Same 4-step flow + OTP + optional prepayment as before (every API call unchanged);
 * redesigned to match the flagship template: porcelain canvas, deep-navy summary panel,
 * glass details, emerald accents, animated step panes, segmented OTP, ticket-style
 * confirmation. Reuses the premium-signature primitives so the whole public journey
 * feels like one product.
 */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { addDays, format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Loader2,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { PmxStyles } from '@/components/site/templates/premium-signature/styles';
import { Blob, BrandMark, Button as PmxButton, Monogram } from '@/components/site/templates/premium-signature/ui';
import { EASE } from '@/components/site/templates/premium-signature/motion';
import { deriveModel, fmtFee, telHref } from '@/components/site/templates/premium-signature/lib';
import Navbar from '@/components/site/templates/premium-signature/sections/Navbar';
import Footer from '@/components/site/templates/premium-signature/sections/Footer';
import { SlotPickerPublic } from '@/components/public/SlotPickerPublic';
import { useSite } from '@/hooks/useSite';
import { apiFetch } from '@/lib/api/client';
import { collectPayment } from '@/lib/payments/razorpayCheckout';
import { fmtDateTime, fmtTime, todayISODate } from '@/lib/format';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Doctor', icon: UserRound },
  { label: 'Time', icon: CalendarDays },
  { label: 'Details', icon: ClipboardList },
  { label: 'Verify', icon: ShieldCheck },
];

const INPUT =
  'h-12 w-full rounded-2xl border border-slate-200/90 bg-white px-4 text-[15px] text-[#0B1220] placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10';

export default function PublicBookingPage() {
  const { slug } = useParams();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayISODate());
  const [slot, setSlot] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', reason: '' });
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);
  const [paid, setPaid] = useState(false);

  // Full site config (cached) powers the shared navbar/footer chrome; booking works
  // even when the site is unpublished (falls back to a slim header).
  const { data: siteData } = useSite(slug);
  const siteModel = useMemo(
    () => (siteData?.available ? deriveModel(siteData.site, slug) : null),
    [siteData, slug]
  );
  const logoUrl = siteModel?.theme?.logoUrl || '';

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/api/public/c/${slug}`, { auth: false });
        setClinic(data.clinic);
        setDoctors(data.doctors);
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (clinic?.name) document.title = `Book an appointment — ${clinic.name}`;
    return () => {
      document.title = 'Clynic';
    };
  }, [clinic]);

  const doctor = doctors.find((d) => d.id === doctorId);
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const sendCode = async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await apiFetch(`/api/public/c/${slug}/otp/request`, { auth: false, method: 'POST', body: { email: form.email } });
      setDevCode(res.devCode || null);
      setCode('');
      setStep(3);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setErr(null);
    setBusy(true);
    try {
      await apiFetch(`/api/public/c/${slug}/otp/verify`, { auth: false, method: 'POST', body: { email: form.email, code } });
      const booking = await apiFetch(`/api/public/c/${slug}/book`, {
        auth: false,
        method: 'POST',
        body: { ...form, doctorId, scheduledAt: slot },
      });
      setResult(booking);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const payNow = async () => {
    setErr(null);
    setBusy(true);
    try {
      const order = await apiFetch(`/api/public/c/${slug}/appointments/${result.appointmentId}/pay-order`, { auth: false, method: 'POST' });
      // DEV/mock: the gateway signs server-side. PRODUCTION: open Razorpay checkout.
      const proof = await collectPayment(order, {
        name: clinic?.name || 'Consultation',
        description: 'Consultation fee',
        mockSign: (orderId) => apiFetch(`/api/public/c/${slug}/payments/mock-sign`, { auth: false, method: 'POST', body: { orderId } }),
      });
      await apiFetch(`/api/public/c/${slug}/payments/verify`, { auth: false, method: 'POST', body: proof });
      setPaid(true);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  // ---- shells ----
  if (loading) return <Splash label="Preparing your booking…" />;
  if (loadError) {
    return (
      <Splash>
        <p className="max-w-sm text-center text-[15px] text-slate-500">{loadError}</p>
        <Link to={`/c/${slug}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" /> Back to the clinic website
        </Link>
      </Splash>
    );
  }

  const needsPrepay = result?.prepayment?.required && !paid;

  return (
    <div className="pmx relative isolate min-h-screen overflow-x-clip bg-[#F8FAFC] text-[#0B1220] antialiased">
      <PmxStyles />
      {/* ambient lighting */}
      <Blob className="-right-48 -top-48" from="rgba(16,185,129,0.13)" size={640} />
      <Blob className="-left-56 top-[420px]" from="rgba(37,99,235,0.09)" size={560} />
      <div aria-hidden="true" className="pmx-grid absolute inset-x-0 top-0 -z-10 h-[480px] opacity-60" />

      {/* chrome — the site's floating glass navbar when the site is published, else a slim bar */}
      {siteModel ? (
        <Navbar m={siteModel} basePath={`/c/${slug}`} />
      ) : (
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <Link to={`/c/${slug}`} aria-label={`${clinic?.name || 'Clinic'} — back to website`}>
            <BrandMark logoUrl={logoUrl} name={clinic?.name || 'Clinic'} />
          </Link>
          <div className="flex items-center gap-2">
            {clinic?.phone ? (
              <a
                href={telHref(clinic.phone)}
                className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-[13px] font-semibold text-slate-600 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:text-[#0B1220] sm:inline-flex"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                {clinic.phone}
              </a>
            ) : null}
            <Link
              to={`/c/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-[#0B1220]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to website</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </header>
      )}

      <main
        className={cn(
          'mx-auto grid max-w-6xl items-start gap-8 px-5 pb-24 sm:px-8 lg:grid-cols-[400px_1fr]',
          siteModel ? 'pt-28 sm:pt-32' : 'pt-2'
        )}
      >
        {/* ------------------------------ summary panel ------------------------------ */}
        <SummaryPanel clinic={clinic} doctor={doctor} slot={slot} form={form} result={result} />

        {/* -------------------------------- flow column ------------------------------- */}
        <div className="min-w-0">
          {/* compact selection context on phones (the full summary panel is desktop-only) */}
          {doctor && !result ? (
            <div className="mb-5 flex items-center gap-2 overflow-x-auto lg:hidden" aria-label="Your selection">
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white py-1.5 pl-1.5 pr-3.5 text-[12.5px] font-semibold text-slate-700 shadow-sm">
                <Monogram name={doctor.name} i={0} className="h-6 w-6" textClass="text-[9px]" />
                {doctor.name}
              </span>
              {slot ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-emerald-800">
                  <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {fmtDateTime(slot)}
                </span>
              ) : null}
            </div>
          ) : null}

          {!result ? (
            <div className="mb-7">
              <Stepper step={step} onStepClick={(i) => { setErr(null); setStep(i); }} />
            </div>
          ) : null}

          <div
            className="relative rounded-[2rem] border border-slate-200/70 bg-white p-6 sm:p-9"
            style={{ boxShadow: '0 2px 6px rgba(10,27,58,0.04), 0 28px 64px -28px rgba(10,27,58,0.16)' }}
          >
            {err ? (
              <p role="alert" className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {err}
              </p>
            ) : null}

            {result ? (
              needsPrepay ? (
                <PrepayScreen result={result} doctor={doctor} busy={busy} onPay={payNow} />
              ) : (
                <SuccessScreen result={result} doctor={doctor} clinic={clinic} />
              )
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {step === 0 && (
                  <Pane key="doctor">
                    <StepTitle
                      title="Choose your doctor"
                      sub="Every consultation is unhurried — pick whoever fits your need."
                    />
                    <div className="mt-6 space-y-3">
                      {doctors.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
                          <p className="text-sm font-medium text-slate-600">No doctors are available for booking right now.</p>
                          <p className="mt-1 text-[12.5px] text-slate-400">Please call the clinic instead — we’ll find you a time.</p>
                        </div>
                      ) : (
                        doctors.map((d, i) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => { setDoctorId(d.id); setSlot(''); setErr(null); setStep(1); }}
                            className={cn(
                              'group flex w-full items-center gap-4 rounded-[1.5rem] border bg-white p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:p-5',
                              doctorId === d.id
                                ? 'border-emerald-500/50 shadow-[0_16px_36px_-16px_rgba(5,150,105,0.35)] ring-1 ring-emerald-500/30'
                                : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_16px_36px_-18px_rgba(10,27,58,0.22)]'
                            )}
                          >
                            <Monogram name={d.name} i={i} className="h-12 w-12 shrink-0" textClass="text-[15px]" />
                            <span className="min-w-0 flex-1">
                              <span className="pmx-display block truncate text-[16px] font-semibold tracking-[-0.01em]">{d.name}</span>
                              <span className="mt-0.5 block text-[13px] font-medium text-emerald-700">{d.specialization || 'General Physician'}</span>
                            </span>
                            {fmtFee(d.consultationFee) ? (
                              <span className="hidden rounded-full bg-slate-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-600 ring-1 ring-slate-200/80 sm:block">
                                {fmtFee(d.consultationFee)}
                              </span>
                            ) : null}
                            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-600" aria-hidden="true" />
                          </button>
                        ))
                      )}
                    </div>
                  </Pane>
                )}

                {step === 1 && (
                  <Pane key="time">
                    <BackChip onClick={() => setStep(0)} label={doctor?.name} />
                    <StepTitle title="Pick a time" sub="Same-day slots open every morning — grab one while it’s there." className="mt-4" />
                    <div className="mt-6 space-y-7">
                      <DateStrip value={date} onChange={(v) => { setDate(v); setSlot(''); }} />
                      <div>
                        <p className="mb-3 text-[13px] font-semibold text-slate-700">Available times</p>
                        <SlotPickerPublic slug={slug} doctorId={doctorId} date={date} value={slot} onChange={setSlot} />
                      </div>
                      <PmxButton
                        icon={ArrowRight}
                        magnetic={false}
                        className={cn('w-full', !slot && 'pointer-events-none opacity-40')}
                        aria-disabled={!slot}
                        onClick={() => slot && setStep(2)}
                      >
                        {slot ? `Continue · ${fmtTime(slot)}` : 'Pick a time to continue'}
                      </PmxButton>
                    </div>
                  </Pane>
                )}

                {step === 2 && (
                  <Pane key="details">
                    <BackChip onClick={() => setStep(1)} label={`${doctor?.name} · ${fmtDateTime(slot)}`} />
                    <StepTitle title="Your details" sub="Only what the clinic needs to confirm your visit — nothing more." className="mt-4" />
                    <div className="mt-6 space-y-5">
                      <Field label="Full name" required>
                        <input className={INPUT} value={form.name} onChange={setField('name')} placeholder="Your name" autoComplete="name" />
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Phone" required>
                          <input className={INPUT} value={form.phone} onChange={setField('phone')} placeholder="+91 98300 00000" inputMode="tel" autoComplete="tel" />
                        </Field>
                        <Field label="Email" required>
                          <input className={INPUT} type="email" value={form.email} onChange={setField('email')} placeholder="you@email.com" autoComplete="email" />
                        </Field>
                      </div>
                      <Field label="Reason for visit" hint="Optional — helps the doctor prepare.">
                        <input className={INPUT} value={form.reason} onChange={setField('reason')} placeholder="e.g. Toothache, routine check-up" />
                      </Field>
                      <PmxButton
                        icon={busy ? Loader2 : ShieldCheck}
                        magnetic={false}
                        className={cn('w-full', (!form.name || !form.email || busy) && 'pointer-events-none opacity-40', busy && '[&_svg]:animate-spin')}
                        aria-disabled={!form.name || !form.email || busy}
                        onClick={() => form.name && form.email && !busy && sendCode()}
                      >
                        {busy ? 'Sending code…' : 'Send verification code'}
                      </PmxButton>
                      <p className="text-center text-[12.5px] text-slate-400">
                        We’ll email you a 6-digit code — it just proves you’re you.
                      </p>
                    </div>
                  </Pane>
                )}

                {step === 3 && (
                  <Pane key="verify">
                    <BackChip onClick={() => setStep(2)} label="Edit details" />
                    <StepTitle title="Check your inbox" sub={`We sent a 6-digit code to ${form.email}.`} className="mt-4" />
                    <div className="mt-7 space-y-6">
                      {devCode ? (
                        <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[12.5px] font-medium text-amber-800">
                          Dev mode — your code is <span className="font-mono text-[13px] font-bold tracking-widest">{devCode}</span>
                        </p>
                      ) : null}
                      <OtpInput value={code} onChange={setCode} disabled={busy} />
                      <PmxButton
                        icon={busy ? Loader2 : CalendarCheck2}
                        magnetic={false}
                        className={cn('w-full', (code.length < 6 || busy) && 'pointer-events-none opacity-40', busy && '[&_svg]:animate-spin')}
                        aria-disabled={code.length < 6 || busy}
                        onClick={() => code.length === 6 && !busy && confirm()}
                      >
                        {busy ? 'Confirming…' : 'Confirm booking'}
                      </PmxButton>
                      <p className="text-center text-[12.5px] text-slate-400">
                        Nothing arrived?{' '}
                        <button type="button" onClick={sendCode} disabled={busy} className="font-semibold text-emerald-700 transition-colors hover:text-emerald-600">
                          Resend code
                        </button>{' '}
                        · check spam too
                      </p>
                    </div>
                  </Pane>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* patient-facing AI (rule 2: logistics FAQ / symptom intake only) */}
          {!result && clinic?.ai ? <PublicFaq slug={slug} /> : null}
          {result && !needsPrepay && clinic?.ai && result.appointmentId ? (
            <PublicSymptomIntake slug={slug} appointmentId={result.appointmentId} />
          ) : null}

          <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70" aria-hidden="true" />
            Encrypted &amp; private · Powered by <span className="font-semibold text-slate-500">Clynic</span>
          </p>
        </div>
      </main>

      {/* full site footer — the booking page is part of the same product */}
      {siteModel ? (
        <div className="mt-4">
          <Footer m={siteModel} basePath={`/c/${slug}`} />
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------ screens ------------------------------------ */

function PrepayScreen({ result, doctor, busy, onPay }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0A1B3A] to-[#12306B] text-white shadow-[0_16px_40px_-12px_rgba(10,27,58,0.5)]">
        <ShieldCheck className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="pmx-display mt-5 text-2xl font-semibold tracking-[-0.02em]">Almost done — pay to confirm</h2>
      <p className="mt-1.5 text-sm text-slate-500">
        {doctor?.name} · {fmtDateTime(result.scheduledAt)}
      </p>

      <div className="mt-7 w-full max-w-xs rounded-[1.5rem] border border-emerald-600/15 bg-emerald-50/70 px-8 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Consultation fee</p>
        <p className="pmx-display mt-1 text-4xl font-semibold text-emerald-800">₹{result.prepayment.amount}</p>
      </div>

      <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-slate-500">
        Your slot is reserved but <span className="font-semibold text-slate-700">not yet confirmed</span>. Complete the
        payment to lock it in.
      </p>
      <PmxButton
        icon={busy ? Loader2 : ShieldCheck}
        magnetic={false}
        className={cn('mt-6 w-full max-w-xs', busy && 'pointer-events-none opacity-60 [&_svg]:animate-spin')}
        onClick={() => !busy && onPay()}
      >
        {busy ? 'Processing…' : `Pay ₹${result.prepayment.amount} & confirm`}
      </PmxButton>
    </div>
  );
}

function SuccessScreen({ result, doctor, clinic }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <motion.span
        initial={reduced ? { opacity: 0 } : { scale: 0, rotate: -14 }}
        animate={reduced ? { opacity: 1 } : { scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.05 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-[0_16px_40px_-10px_rgba(5,150,105,0.5)]"
      >
        <Check className="h-8 w-8" strokeWidth={3} aria-hidden="true" />
      </motion.span>
      <h2 className="pmx-display mt-5 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
        {result.prepayment?.required ? 'Paid & confirmed!' : 'You’re booked!'}
      </h2>
      <p className="mt-1.5 text-sm text-slate-500">
        {doctor?.name} · {fmtDateTime(result.scheduledAt)}
      </p>

      {/* ticket */}
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="relative mt-8 w-full max-w-sm overflow-hidden rounded-[1.75rem] text-white"
        style={{ background: 'linear-gradient(140deg,#060E22 0%,#0A1B3A 55%,#0C2B47 100%)', boxShadow: '0 32px 72px -24px rgba(6,14,34,0.5)' }}
      >
        <div aria-hidden="true" className="pmx-plus absolute inset-0 opacity-[0.12]" />
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-2xl"
          style={{ background: 'radial-gradient(circle,#10B981 0%,transparent 65%)' }}
        />
        <div className="relative px-8 pb-6 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Your token</p>
          <p className="pmx-display mt-1 text-[58px] font-semibold leading-none tracking-[-0.02em]">{result.token}</p>
          <p className="mt-3 text-[12.5px] text-slate-300">Show this at reception when you arrive</p>
        </div>
        {/* perforation */}
        <div className="relative flex items-center" aria-hidden="true">
          <span className="absolute -left-3 h-6 w-6 rounded-full bg-white" />
          <span className="mx-6 h-px flex-1 border-t-2 border-dashed border-white/15" />
          <span className="absolute -right-3 h-6 w-6 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-col items-center gap-3 px-8 pb-8 pt-6">
          <span className="rounded-2xl bg-white p-3">
            <QRCodeSVG value={shareUrl} size={112} />
          </span>
          <p className="text-[11.5px] text-slate-400">Scan to book again or share this page</p>
          {clinic?.address ? (
            <p className="flex items-center gap-1.5 text-[12px] text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
              {clinic.address}
            </p>
          ) : null}
        </div>
      </motion.div>

      <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-slate-500">
        A confirmation has been emailed to you — reminders will follow before your visit.
      </p>
    </div>
  );
}

/* -------------------------------- patient-facing AI -------------------------------- */

function PublicFaq({ slug }) {
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const ask = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const resp = await apiFetch(`/api/public/c/${slug}/ai/faq`, { auth: false, method: 'POST', body: { question: q.trim() } });
      setAnswer({ ok: true, ...resp });
    } catch (e) {
      setAnswer({ ok: false, message: e.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-6 backdrop-blur" style={{ boxShadow: '0 2px 6px rgba(10,27,58,0.03)' }}>
      <p className="flex items-center gap-2 text-[14px] font-semibold text-[#0B1220]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        Questions about the clinic?
      </p>
      <div className="mt-4 flex gap-2">
        <input
          className={INPUT}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Fees, timings, location, services…"
          onKeyDown={(e) => e.key === 'Enter' && ask()}
        />
        <button
          type="button"
          onClick={ask}
          disabled={loading}
          className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-[#0A1B3A] px-5 text-sm font-semibold text-white transition-all hover:shadow-[0_12px_28px_-10px_rgba(10,27,58,0.5)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Ask'}
        </button>
      </div>
      {answer && !answer.ok ? (
        <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{answer.message}</p>
      ) : null}
      {answer && answer.ok ? (
        <div className="mt-3 space-y-2">
          <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-[13.5px] leading-relaxed text-slate-700">{answer.answer}</p>
          {/* Rule 2: every AI reply carries a not-medical-advice disclaimer. */}
          {answer.disclaimer ? <p className="text-[11.5px] text-slate-400">{answer.disclaimer}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function PublicSymptomIntake({ slug, appointmentId }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const resp = await apiFetch(`/api/public/c/${slug}/ai/symptom-intake`, { auth: false, method: 'POST', body: { appointmentId, symptomsText: text.trim() } });
      setSent({ ok: true, msg: resp.patientMessage || 'Shared with your doctor.' });
    } catch (e) {
      setSent({ ok: false, msg: e.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-6 backdrop-blur" style={{ boxShadow: '0 2px 6px rgba(10,27,58,0.03)' }}>
      <p className="flex items-center gap-2 text-[14px] font-semibold text-[#0B1220]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        Tell the doctor your symptoms
        <span className="text-[12px] font-normal text-slate-400">(optional)</span>
      </p>
      {sent ? (
        <p
          className={cn(
            'mt-4 whitespace-pre-wrap rounded-2xl p-4 text-[13.5px] leading-relaxed',
            sent.ok ? 'bg-emerald-50 text-emerald-900' : 'border border-red-100 bg-red-50 text-red-600'
          )}
        >
          {sent.msg}
        </p>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you're experiencing and for how long. This is shared with your doctor — it is not medical advice."
            rows={3}
            className="mt-4 w-full resize-none rounded-2xl border border-slate-200/90 bg-white p-4 text-[14px] text-[#0B1220] placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={busy || !text.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1B3A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_12px_28px_-10px_rgba(10,27,58,0.5)] disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {busy ? 'Sharing…' : 'Share with doctor'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------- pieces ------------------------------------- */

function SummaryPanel({ clinic, doctor, slot, form, result }) {
  const rows = [
    {
      key: 'doctor',
      done: !!doctor,
      placeholder: 'Choose your doctor',
      content: doctor ? (
        <div className="flex items-center gap-3">
          <Monogram name={doctor.name} i={0} className="h-10 w-10 shrink-0" textClass="text-[12px]" />
          <div className="min-w-0 flex-1">
            <p className="pmx-display truncate text-[14.5px] font-semibold text-white">{doctor.name}</p>
            <p className="truncate text-[12px] text-slate-400">{doctor.specialization || 'General Physician'}</p>
          </div>
          {fmtFee(doctor.consultationFee) ? (
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-emerald-300">{fmtFee(doctor.consultationFee)}</span>
          ) : null}
        </div>
      ) : null,
    },
    {
      key: 'time',
      done: !!slot,
      placeholder: 'Pick a date & time',
      content: slot ? (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="pmx-display text-[14.5px] font-semibold text-white">{format(new Date(slot), 'EEEE, d MMM')}</p>
            <p className="text-[12px] text-slate-400">{fmtTime(slot)}</p>
          </div>
        </div>
      ) : null,
    },
    {
      key: 'details',
      done: !!(form.name && form.email),
      placeholder: 'Add your details',
      content:
        form.name && form.email ? (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-200">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="pmx-display truncate text-[14.5px] font-semibold text-white">{form.name}</p>
              <p className="truncate text-[12px] text-slate-400">{form.email}</p>
            </div>
          </div>
        ) : null,
    },
  ];

  return (
    <aside
      className="relative hidden overflow-hidden rounded-[2rem] p-8 text-white lg:sticky lg:top-8 lg:block"
      style={{ background: 'linear-gradient(150deg,#060E22 0%,#0A1B3A 60%,#0C2B47 110%)', boxShadow: '0 32px 72px -28px rgba(6,14,34,0.55)' }}
      aria-label="Booking summary"
    >
      <div aria-hidden="true" className="pmx-grid-dark absolute inset-0 opacity-50" />
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle,#10B981 0%,transparent 65%)' }}
      />

      <div className="relative">
        <p className="pmx-display inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
          <span aria-hidden="true" className="h-px w-8 bg-emerald-400/60" />
          Book a visit
        </p>
        <h1 className="pmx-display mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{clinic?.name}</h1>
        {clinic?.address ? (
          <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-slate-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
            {clinic.address}
          </p>
        ) : null}

        <div className="mt-8 space-y-3">
          {rows.map((r, i) => (
            <motion.div
              key={r.key}
              layout
              className={cn(
                'rounded-2xl border p-4 transition-colors duration-500',
                r.done ? 'border-white/10 bg-white/[0.06]' : 'border-dashed border-white/15 bg-transparent'
              )}
            >
              {r.done ? (
                r.content
              ) : (
                <div className="flex items-center gap-3">
                  <span className="pmx-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 text-[13px] font-semibold text-slate-400">
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-slate-500">{r.placeholder}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
          {[
            { icon: ShieldCheck, text: 'Private & encrypted end to end' },
            { icon: Zap, text: result ? 'Booked in under a minute' : 'Instant confirmation' },
            { icon: RefreshCcw, text: 'Free rescheduling, anytime' },
          ].map((t) => (
            <p key={t.text} className="flex items-center gap-2.5 text-[13px] text-slate-300">
              <t.icon className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              {t.text}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Stepper({ step, onStepClick }) {
  return (
    <nav aria-label="Booking steps" className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <Fragment key={s.label}>
            {i > 0 ? (
              <span className="relative mx-2 h-[2px] min-w-4 flex-1 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  initial={false}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </span>
            ) : null}
            <button
              type="button"
              onClick={done ? () => onStepClick(i) : undefined}
              disabled={!done}
              aria-current={active ? 'step' : undefined}
              className={cn('group flex shrink-0 items-center gap-2', done && 'cursor-pointer')}
              title={done ? `Back to ${s.label}` : s.label}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300',
                  done && 'border-transparent bg-[#0A1B3A] text-white group-hover:shadow-[0_8px_20px_-8px_rgba(10,27,58,0.5)]',
                  active && 'border-emerald-500/60 bg-white text-emerald-700 ring-4 ring-emerald-500/15',
                  !done && !active && 'border-slate-200 bg-white text-slate-300'
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" /> : <s.icon className="h-4 w-4" aria-hidden="true" />}
              </span>
              <span
                className={cn(
                  'hidden text-[12.5px] font-semibold sm:block',
                  active ? 'text-[#0B1220]' : done ? 'text-slate-600' : 'text-slate-400'
                )}
              >
                {s.label}
              </span>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}

function Pane({ children }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28, filter: 'blur(6px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: -28, filter: 'blur(6px)' }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ title, sub, className }) {
  return (
    <div className={className}>
      <h2 className="pmx-display text-[22px] font-semibold tracking-[-0.02em] sm:text-2xl">{title}</h2>
      {sub ? <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{sub}</p> : null}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline gap-1 text-[13px] font-semibold text-slate-700">
        {label}
        {required ? <span className="text-emerald-600">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-[12px] text-slate-400">{hint}</span> : null}
    </label>
  );
}

function BackChip({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 py-1.5 pl-2.5 pr-4 text-[12.5px] font-semibold text-slate-600 transition-all hover:-translate-x-0.5 hover:border-slate-300 hover:text-[#0B1220]"
    >
      <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}

/** Next-7-days chip strip + native date input for anything later. */
function DateStrip({ value, onChange }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)), []);
  const inStrip = days.some((d) => format(d, 'yyyy-MM-dd') === value);
  return (
    <div>
      <p className="mb-3 text-[13px] font-semibold text-slate-700">Date</p>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => {
          const iso = format(d, 'yyyy-MM-dd');
          const selected = iso === value;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onChange(iso)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-2xl border py-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                selected
                  ? 'border-transparent bg-[#0A1B3A] text-white shadow-[0_10px_24px_-8px_rgba(10,27,58,0.45)] ring-2 ring-emerald-400/70 ring-offset-1'
                  : 'border-slate-200/80 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-emerald-500/40'
              )}
            >
              <span className={cn('text-[10px] font-semibold uppercase tracking-wide', selected ? 'text-emerald-300' : 'text-slate-400')}>
                {i === 0 ? 'Today' : format(d, 'EEE')}
              </span>
              <span className="pmx-display text-[16px] font-semibold leading-none">{format(d, 'd')}</span>
            </button>
          );
        })}
      </div>
      <label className="mt-3 inline-flex items-center gap-2 text-[12.5px] text-slate-500">
        Need a later date?
        <input
          type="date"
          min={todayISODate()}
          value={inStrip ? '' : value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 outline-none transition-colors focus:border-emerald-500/60"
          aria-label="Pick another date"
        />
      </label>
    </div>
  );
}

/** Segmented 6-digit OTP input — paste-friendly, keyboard-navigable. */
function OtpInput({ value, onChange, length = 6, disabled }) {
  const refs = useRef([]);
  const clean = (s) => s.replace(/\D/g, '').slice(0, length);

  const handleChange = (i) => (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) {
      onChange(value.slice(0, i) + value.slice(i + 1));
      return;
    }
    const next = clean(value.slice(0, i) + digits + value.slice(i + digits.length));
    onChange(next);
    const focusIdx = Math.min(i + digits.length, length - 1);
    requestAnimationFrame(() => refs.current[focusIdx]?.focus());
  };
  const handleKey = (i) => (e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      e.preventDefault();
      onChange(value.slice(0, i - 1) + value.slice(i));
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const digits = clean(e.clipboardData.getData('text'));
    if (!digits) return;
    onChange(digits);
    requestAnimationFrame(() => refs.current[Math.min(digits.length, length) - 1]?.focus());
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste} role="group" aria-label="Verification code">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] || ''}
          onChange={handleChange(i)}
          onKeyDown={handleKey(i)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={2}
          aria-label={`Digit ${i + 1} of ${length}`}
          className={cn(
            'pmx-display h-14 w-11 rounded-2xl border border-slate-200/90 bg-white text-center text-xl font-semibold text-[#0B1220] outline-none transition-all duration-200 sm:w-12',
            'focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50',
            value[i] && 'border-emerald-500/40 bg-emerald-50/40'
          )}
        />
      ))}
    </div>
  );
}

/* ------------------------------------- shells ------------------------------------- */

function Splash({ label, children }) {
  return (
    <div className="pmx flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8FAFC] px-6">
      <PmxStyles />
      <Logo className={cn('h-10', label && 'animate-pulse')} />
      {label ? <span className="text-sm font-medium tracking-wide text-slate-400">{label}</span> : null}
      {children}
    </div>
  );
}
