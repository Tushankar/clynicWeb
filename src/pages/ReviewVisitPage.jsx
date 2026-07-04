/**
 * Post-visit review (§5.21) — /review/:token. One question, thirty seconds: rate the
 * visit, add a line if you like. 4–5★ raters get a one-tap "share it on Google" step;
 * everything lands on the clinic's website reviews wall for the owner to moderate.
 */
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ExternalLink, Heart, Loader2, Send, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { LinkShell, LinkSplash, LinkError } from '@/components/public/LinkPageShell';
import { apiFetch } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const RATING_WORDS = ['', 'Poor', 'Could be better', 'Okay', 'Good', 'Excellent'];

export default function ReviewVisitPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null); // { rating, googleReviewUrl }

  const load = useCallback(async () => {
    try {
      setData(await apiFetch(`/api/public/review/${token}`, { auth: false }));
    } catch (e) {
      setLoadError(e.message);
    }
  }, [token]);

  useEffect(() => {
    document.title = 'Rate your visit';
    load();
  }, [load]);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await apiFetch(`/api/public/review/${token}`, { auth: false, method: 'POST', body: { rating, text } });
      setResult(res);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loadError) return <LinkError message={loadError} />;
  if (!data) return <LinkSplash />;

  const { clinic, appointment: a, submitted } = data;
  const done = submitted || result;

  return (
    <LinkShell clinic={clinic} badge="Feedback">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.section
            key="thanks"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-slate-200/80 bg-white px-6 py-12 text-center shadow-[0_24px_60px_-24px_rgba(10,27,58,0.18)]"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Heart className="h-7 w-7 text-emerald-600" aria-hidden="true" />
            </span>
            <h1 className="pmx-display mt-5 text-2xl font-semibold tracking-tight text-[#0A1B3A]">
              Thank you{result?.rating >= 4 ? ' — that made our day!' : ' for your honesty'}
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              {submitted && !result
                ? 'A review for this visit was already submitted.'
                : result?.rating >= 4
                  ? 'Your kind words help other patients find us.'
                  : 'We read every word — your feedback goes straight to the team so we can do better.'}
            </p>
            {result?.googleReviewUrl && (
              <a
                href={result.googleReviewUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mx-auto mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#0A1B3A] px-6 text-[14px] font-semibold text-white shadow-[0_14px_32px_-10px_rgba(10,27,58,0.5)] transition-all duration-200 hover:-translate-y-0.5"
              >
                Share it on Google <ExternalLink className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              </a>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="form"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(10,27,58,0.18)] sm:p-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">30 seconds</p>
            <h1 className="pmx-display mt-2 text-[22px] font-semibold leading-snug tracking-tight text-[#0A1B3A] sm:text-[26px]">
              How was your visit{a.doctorName ? ` with ${a.doctorName}` : ''}?
            </h1>
            <p className="mt-1.5 text-[13.5px] text-slate-500">
              {format(new Date(a.scheduledAt), 'EEEE, d MMMM')} · {clinic.name}
            </p>

            {/* Stars */}
            <div className="mt-7 flex items-center justify-center gap-2 sm:gap-3" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    onMouseEnter={() => setHover(n)}
                    onFocus={() => setHover(n)}
                    onClick={() => setRating(n)}
                    className="rounded-xl p-1.5 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <Star
                      className={cn('h-10 w-10 transition-colors duration-150 sm:h-11 sm:w-11', active ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200')}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            <p className={cn('mt-2 text-center text-[13.5px] font-semibold transition-opacity', rating ? 'text-[#0A1B3A] opacity-100' : 'opacity-0')}>
              {RATING_WORDS[hover || rating] || '·'}
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Anything you'd like to tell us? (optional)"
              className="mt-5 w-full resize-none rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-[14.5px] text-[#0B1220] placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10"
            />

            {err && <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{err}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={!rating || busy}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A1B3A] text-[14.5px] font-semibold text-white shadow-[0_14px_32px_-10px_rgba(10,27,58,0.5)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
              {busy ? 'Sending…' : 'Send feedback'}
            </button>
            <p className="mt-3 text-center text-[11.5px] text-slate-400">Your name appears as first name + initial. The clinic reviews feedback before it's published.</p>
          </motion.section>
        )}
      </AnimatePresence>
    </LinkShell>
  );
}
