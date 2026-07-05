/**
 * Storefront email-OTP sign-in panel. Reused by checkout (auth step) and the orders page
 * (login prompt). Request → enter 6-digit code → verify → store token (handled in useVerifyOtp).
 * Shows the dev code inline when the backend returns one.
 */
import { useRef, useState } from 'react';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';
import { Button as PmxButton } from '@/components/site/templates/premium-signature/ui';
import { cx } from '@/components/site/templates/premium-signature/lib';
import { useRequestOtp, useVerifyOtp } from '@/hooks/useStore';
import { INPUT_STORE } from './shared';

export default function StoreAuthPanel({ slug, onAuthed, heading = 'Sign in to continue', sub }) {
  const requestOtp = useRequestOtp(slug);
  const verifyOtp = useVerifyOtp(slug);
  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(null);
  const [err, setErr] = useState(null);

  const sendCode = async () => {
    setErr(null);
    try {
      const res = await requestOtp.mutateAsync(email.trim());
      setDevCode(res?.devCode || null);
      setCode('');
      setStage('code');
    } catch (e) {
      setErr(e?.body?.message || e?.message || 'Could not send the code. Try again.');
    }
  };

  const verify = async () => {
    setErr(null);
    try {
      const res = await verifyOtp.mutateAsync({ email: email.trim(), code, name: name.trim() });
      onAuthed?.(res?.patient);
    } catch (e) {
      setErr(e?.body?.message || e?.message || 'That code didn’t match. Try again.');
    }
  };

  const emailValid = /.+@.+\..+/.test(email.trim());

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1B3A] to-[#12306B] text-white">
          {stage === 'email' ? <Mail className="h-5 w-5" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div>
          <h2 className="pmx-display text-[18px] font-semibold tracking-[-0.01em] text-[#0B1220]">{heading}</h2>
          <p className="text-[13px] text-slate-500">
            {sub || (stage === 'email' ? 'We’ll email you a 6-digit code — no password needed.' : `Enter the code we sent to ${email}.`)}
          </p>
        </div>
      </div>

      {err ? (
        <p role="alert" className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {err}
        </p>
      ) : null}

      {stage === 'email' ? (
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[13px] font-semibold text-slate-700">Your name</span>
            <input className={INPUT_STORE} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] font-semibold text-slate-700">Email</span>
            <input
              className={INPUT_STORE}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              onKeyDown={(e) => e.key === 'Enter' && emailValid && name.trim() && sendCode()}
            />
          </label>
          <PmxButton
            icon={requestOtp.isPending ? Loader2 : Mail}
            magnetic={false}
            className={cx('w-full', (!emailValid || !name.trim() || requestOtp.isPending) && 'pointer-events-none opacity-40', requestOtp.isPending && '[&_svg]:animate-spin')}
            aria-disabled={!emailValid || !name.trim() || requestOtp.isPending}
            onClick={sendCode}
          >
            {requestOtp.isPending ? 'Sending code…' : 'Send verification code'}
          </PmxButton>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {devCode ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[12.5px] font-medium text-amber-800">
              Dev mode — your code is <span className="font-mono text-[13px] font-bold tracking-widest">{devCode}</span>
            </p>
          ) : null}
          <OtpInput value={code} onChange={setCode} disabled={verifyOtp.isPending} />
          <PmxButton
            icon={verifyOtp.isPending ? Loader2 : ShieldCheck}
            magnetic={false}
            className={cx('w-full', (code.length < 6 || verifyOtp.isPending) && 'pointer-events-none opacity-40', verifyOtp.isPending && '[&_svg]:animate-spin')}
            aria-disabled={code.length < 6 || verifyOtp.isPending}
            onClick={() => code.length === 6 && verify()}
          >
            {verifyOtp.isPending ? 'Verifying…' : 'Verify & continue'}
          </PmxButton>
          <p className="text-center text-[12.5px] text-slate-400">
            Didn’t get it?{' '}
            <button type="button" onClick={sendCode} disabled={requestOtp.isPending} className="font-semibold text-emerald-700 transition-colors hover:text-emerald-600">
              Resend code
            </button>{' '}
            · check spam ·{' '}
            <button type="button" onClick={() => { setStage('email'); setErr(null); }} className="font-semibold text-slate-500 hover:text-slate-700">
              change email
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

/** Segmented 6-digit OTP input — paste-friendly, keyboard-navigable (mirrors booking). */
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
          className={cx(
            'pmx-display h-14 w-11 rounded-2xl border border-slate-200/90 bg-white text-center text-xl font-semibold text-[#0B1220] outline-none transition-all duration-200 sm:w-12',
            'focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50',
            value[i] && 'border-emerald-500/40 bg-emerald-50/40'
          )}
        />
      ))}
    </div>
  );
}
