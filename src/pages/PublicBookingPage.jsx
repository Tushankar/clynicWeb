import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Stethoscope, CheckCircle2, ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/primitives';
import { SlotPickerPublic } from '@/components/public/SlotPickerPublic';
import { apiFetch } from '@/lib/api/client';
import { collectPayment } from '@/lib/payments/razorpayCheckout';
import { fmtDateTime, todayISODate } from '@/lib/format';
import { cn } from '@/lib/utils';

const STEPS = ['Doctor', 'Time', 'Details', 'Verify'];

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

  const doctor = doctors.find((d) => d.id === doctorId);
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const sendCode = async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await apiFetch(`/api/public/c/${slug}/otp/request`, { auth: false, method: 'POST', body: { email: form.email } });
      setDevCode(res.devCode || null);
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

  // ---- shells ----
  if (loading) return <Centered>Loading…</Centered>;
  if (loadError) return <Centered><span className="text-destructive">{loadError}</span></Centered>;

  const needsPrepay = result?.prepayment?.required && !paid;

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

  if (result) {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    return (
      <Shell clinic={clinic}>
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            {err && <p className="mb-3 w-full rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

            {needsPrepay ? (
              <>
                <ShieldCheck className="h-12 w-12 text-primary" />
                <h2 className="mt-3 text-xl font-semibold">Almost done — pay to confirm</h2>
                <p className="mt-1 text-sm text-muted-foreground">{doctor?.name} · {fmtDateTime(result.scheduledAt)}</p>
                <div className="my-5 rounded-xl bg-primary/10 px-8 py-4">
                  <div className="text-caption uppercase tracking-wide text-primary">Consultation fee</div>
                  <div className="text-3xl font-bold tabular text-primary">₹{result.prepayment.amount}</div>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">Your booking is reserved but <span className="font-medium">not yet confirmed</span>. Pay online to confirm.</p>
                <Button className="w-full" onClick={payNow} disabled={busy}>{busy ? 'Processing…' : `Pay ₹${result.prepayment.amount} & confirm`}</Button>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h2 className="mt-3 text-xl font-semibold">{result.prepayment?.required ? 'Paid & confirmed!' : 'You’re booked!'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{doctor?.name} · {fmtDateTime(result.scheduledAt)}</p>
                <div className="my-5 rounded-xl bg-primary/10 px-8 py-4 text-center">
                  <div className="text-caption uppercase tracking-wide text-primary">Your token</div>
                  <div className="text-5xl font-bold tabular text-primary">{result.token}</div>
                </div>
                <p className="text-sm text-muted-foreground">Show this token at reception. A confirmation has been emailed to you.</p>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="rounded-lg border bg-card p-3"><QRCodeSVG value={shareUrl} size={120} /></div>
                  <p className="text-caption text-muted-foreground">Scan to book again or share this page</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell clinic={clinic}>
      <Stepper step={step} />
      <Card>
        <CardContent className="space-y-4 py-6">
          {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

          {step === 0 && (
            <div className="space-y-2">
              <h2 className="text-base font-medium">Choose a doctor</h2>
              {doctors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No doctors are available for booking right now.</p>
              ) : (
                doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setDoctorId(d.id); setSlot(''); setStep(1); }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary hover:bg-accent',
                      doctorId === d.id && 'border-primary bg-accent'
                    )}
                  >
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-caption text-muted-foreground">{d.specialization || 'General'}</div>
                    </div>
                    {d.consultationFee ? <span className="text-sm text-muted-foreground">₹{d.consultationFee}</span> : null}
                  </button>
                ))
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <BackBtn onClick={() => setStep(0)} label={doctor?.name} />
              <FormField label="Date">
                <Input type="date" value={date} min={todayISODate()} onChange={(e) => { setDate(e.target.value); setSlot(''); }} />
              </FormField>
              <FormField label="Available times">
                <SlotPickerPublic slug={slug} doctorId={doctorId} date={date} value={slot} onChange={setSlot} />
              </FormField>
              <Button className="w-full" disabled={!slot} onClick={() => setStep(2)}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <BackBtn onClick={() => setStep(1)} label={`${doctor?.name} · ${fmtDateTime(slot)}`} />
              <FormField label="Full name" required>
                <Input value={form.name} onChange={setField('name')} placeholder="Your name" />
              </FormField>
              <FormField label="Phone" required>
                <Input value={form.phone} onChange={setField('phone')} placeholder="+91 98300 00000" />
              </FormField>
              <FormField label="Email" required description="We’ll send a verification code and your confirmation here.">
                <Input type="email" value={form.email} onChange={setField('email')} placeholder="you@email.com" />
              </FormField>
              <FormField label="Reason (optional)">
                <Input value={form.reason} onChange={setField('reason')} placeholder="e.g. Toothache" />
              </FormField>
              <Button className="w-full" disabled={!form.name || !form.email || busy} onClick={sendCode}>
                {busy ? 'Sending…' : 'Send verification code'}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <BackBtn onClick={() => setStep(2)} label="Edit details" />
              <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
                <ShieldCheck className="h-4 w-4" /> Code sent to {form.email}
              </div>
              {devCode && (
                <p className="text-caption text-muted-foreground">Dev mode — your code is <span className="font-mono font-medium">{devCode}</span></p>
              )}
              <FormField label="Verification code" required>
                <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="6-digit code" />
              </FormField>
              <Button className="w-full" disabled={!code || busy} onClick={confirm}>
                {busy ? 'Confirming…' : 'Confirm booking'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}

function Shell({ clinic, children }) {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="h-6 w-6 text-primary" />
          {clinic?.name || 'Book an appointment'}
        </header>
        {clinic?.address && <p className="-mt-3 flex items-center gap-1 text-caption text-muted-foreground"><Calendar className="h-3 w-3" />{clinic.address}</p>}
        {children}
        <p className="text-center text-caption text-muted-foreground">Powered by Clinic OS</p>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{children}</div>;
}

function Stepper({ step }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col gap-1">
          <div className={cn('h-1 rounded-full', i <= step ? 'bg-primary' : 'bg-border')} />
          <span className={cn('text-caption', i === step ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function BackBtn({ onClick, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
