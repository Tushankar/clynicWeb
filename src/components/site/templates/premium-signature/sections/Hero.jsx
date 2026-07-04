/**
 * Hero — editorial split: persuasion column on the left, a parallax photographic
 * composition with floating glass cards on the right. Ambient gradient lighting and a
 * dot-grid ground the scene without shouting.
 */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BadgeCheck, CalendarCheck2, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { firstName, telHref } from '../lib';
import { EASE, FloatY } from '../motion';
import { Blob, Button, Monogram, SafeImg, Stars } from '../ui';

/** Headline with the last word set in an emerald gradient + hand-drawn underline. */
function Headline({ text }) {
  const words = String(text || '').trim().split(/\s+/);
  const last = words.pop();
  return (
    <h1 className="pmx-display text-balance text-[2.65rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#0B1220] sm:text-6xl lg:text-[4.35rem]">
      {words.join(' ')}{' '}
      <span className="relative inline-block whitespace-nowrap">
        <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
          {last}
        </span>
        <motion.svg
          viewBox="0 0 220 12"
          className="absolute -bottom-2 left-0 w-full"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M3 9C60 3 150 2 217 7"
            stroke="url(#pmx-underline)"
            strokeWidth="4.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
          />
          <defs>
            <linearGradient id="pmx-underline" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="1" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </motion.svg>
      </span>
    </h1>
  );
}

function Enter({ children, delay = 0, className }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Small glass card used for the floating hero elements. */
function GlassCard({ children, className }) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 20px 48px -16px rgba(10,27,58,0.28)',
      }}
    >
      {children}
    </div>
  );
}

export default function Hero({ m }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 64]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 110]);

  const doc = m.doctors[0];
  const review = m.reviews[0];
  const reviewCount = m.reviews.length;

  return (
    <section ref={ref} className="relative isolate overflow-hidden" aria-label="Welcome">
      {/* ambient lighting */}
      <Blob className="-right-40 -top-40" from="rgba(16,185,129,0.16)" size={680} />
      <Blob className="-left-48 top-72" from="rgba(37,99,235,0.10)" size={620} />
      <div aria-hidden="true" className="pmx-grid absolute inset-0 -z-10 opacity-[0.5]" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-white/80 to-transparent"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:grid-cols-12 lg:gap-10 lg:pb-24">
        {/* ------------------------------- copy column ------------------------------- */}
        <div className="lg:col-span-6 xl:col-span-6 xl:pr-6">
          <Enter delay={0.05}>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-emerald-600/15 bg-emerald-50/80 py-1.5 pl-2.5 pr-4 text-[13px] font-medium text-emerald-800"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Accepting new patients{m.city ? ` in ${m.city}` : ''} · same-day slots
            </span>
          </Enter>

          <Enter delay={0.15} className="mt-6">
            <Headline text={m.hero.headline} />
          </Enter>

          <Enter delay={0.28}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-[19px]">
              {m.hero.tagline}
            </p>
          </Enter>

          <Enter delay={0.4}>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Button to={m.bookHref} icon={CalendarCheck2} size="lg">
                Book appointment
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
              {m.contact.phone ? (
                <Button href={telHref(m.contact.phone)} icon={Phone} variant="ghost" size="lg">
                  {m.contact.phone}
                </Button>
              ) : null}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[13px] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              Under a minute to book · no account needed · free rescheduling
            </p>
          </Enter>

          {/* trust row */}
          <Enter delay={0.52}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-slate-900/[0.07] pt-7">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {(m.doctors.length ? m.doctors : [{ name: 'A' }, { name: 'S' }, { name: 'K' }])
                    .slice(0, 3)
                    .map((d, i) => (
                      <Monogram key={i} name={d.name} i={i} className="h-9 w-9 ring-[2.5px] ring-[#F8FAFC]" textClass="text-[11px]" />
                    ))}
                  <span className="pmx-display flex h-9 w-9 items-center justify-center rounded-full bg-[#0A1B3A] text-[10px] font-semibold text-white ring-[2.5px] ring-[#F8FAFC]">
                    You
                  </span>
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <Stars rating={m.rating} size="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold text-[#0B1220]">{m.rating.toFixed(1)}</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">
                    {reviewCount ? `from ${reviewCount} verified patient ${reviewCount === 1 ? 'story' : 'stories'}` : 'loved by our patients'}
                  </p>
                </div>
              </div>
              <div className="hidden h-9 w-px bg-slate-900/[0.07] sm:block" aria-hidden="true" />
              <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600">
                <ShieldCheck className="h-[18px] w-[18px] text-emerald-600" aria-hidden="true" />
                Private &amp; secure records
              </div>
            </div>
          </Enter>
        </div>

        {/* ---------------------------- visual composition ---------------------------- */}
        <div className="relative lg:col-span-6" aria-hidden={false}>
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: EASE }}
            className="relative mx-auto max-w-[560px]"
          >
            {/* glow behind the image */}
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[3rem] opacity-60 blur-2xl"
              style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.28),rgba(59,130,246,0.16) 60%,transparent)' }}
            />
            {/* gradient frame */}
            <motion.div style={{ y: imgY }} className="rounded-[2.15rem] p-[1.5px]" >
              <div
                className="rounded-[2.1rem] p-[1.5px]"
                style={{ background: 'linear-gradient(140deg,rgba(16,185,129,0.55),rgba(255,255,255,0.9) 35%,rgba(10,27,58,0.25))' }}
              >
                <SafeImg
                  src={m.hero.imageUrl}
                  alt={`Inside ${m.name}`}
                  eager
                  className="aspect-[4/4.6] w-full rounded-[2rem] object-cover sm:aspect-[4/4.2]"
                  imgClassName=""
                  sizes="(min-width:1024px) 44vw, 92vw"
                />
              </div>
            </motion.div>

            {/* floating cards */}
            <motion.div style={{ y: cardsY }} className="pointer-events-none absolute inset-0">
              {/* appointment confirmed */}
              <FloatY distance={9} duration={5.5} className="absolute -left-3 top-8 sm:-left-10">
                <GlassCard className="flex items-center gap-3 rounded-2xl py-3 pl-3 pr-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-600/30">
                    <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[13px] font-semibold text-[#0B1220]">Appointment confirmed</span>
                    <span className="mt-0.5 block text-[11.5px] font-medium text-slate-500">Today · 4:30 PM</span>
                  </span>
                </GlassCard>
              </FloatY>

              {/* doctor availability */}
              {doc ? (
                <FloatY distance={11} duration={6.5} delay={0.6} className="absolute -right-2 top-[38%] sm:-right-8">
                  <GlassCard className="flex items-center gap-3 rounded-2xl py-3 pl-3 pr-5">
                    <span className="relative">
                      <Monogram name={doc.name} i={1} className="h-10 w-10" textClass="text-[12px]" />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[13px] font-semibold text-[#0B1220]">{doc.name}</span>
                      <span className="mt-0.5 block text-[11.5px] font-medium text-emerald-700">
                        Available today · {doc.specialization}
                      </span>
                    </span>
                  </GlassCard>
                </FloatY>
              ) : null}

              {/* review notification */}
              <FloatY distance={8} duration={7} delay={1.1} className="absolute -bottom-6 left-4 hidden sm:block">
                <GlassCard className="w-[270px] rounded-2xl p-4">
                  <span className="flex items-center justify-between">
                    <Stars rating={5} size="h-3.5 w-3.5" />
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified visit
                    </span>
                  </span>
                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600">
                    “{review ? review.text : 'Wonderful experience — seen right on time, everything explained clearly.'}”
                  </p>
                  <p className="mt-2 text-[11.5px] font-semibold text-[#0B1220]">
                    {review ? review.name : 'A happy patient'}
                  </p>
                </GlassCard>
              </FloatY>

              {/* security chip */}
              <FloatY distance={7} duration={6} delay={1.6} className="absolute -top-4 right-6 sm:right-10">
                <GlassCard className="flex items-center gap-2 rounded-full py-2 pl-2.5 pr-4">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span className="text-[11.5px] font-semibold text-[#0B1220]">Encrypted records</span>
                </GlassCard>
              </FloatY>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
