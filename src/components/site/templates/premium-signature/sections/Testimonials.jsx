/**
 * Patient stories — a large editorial quote carousel. Auto-advances gently, pauses on
 * hover, supports drag/swipe, arrows and dots. Renders only real, approved CMS reviews.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BadgeCheck, Quote } from 'lucide-react';
import { cx } from '../lib';
import { EASE } from '../motion';
import { Blob, Monogram, SectionHead, Stars } from '../ui';

export default function Testimonials({ m }) {
  const reviews = m.reviews || [];
  const [[index, dir], setIndex] = useState([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef(null);

  const go = useCallback(
    (next) => setIndex(([i]) => [(next + reviews.length) % reviews.length, next > i ? 1 : -1]),
    [reviews.length]
  );

  useEffect(() => {
    if (reviews.length < 2 || paused || reduced) return undefined;
    timer.current = setInterval(() => setIndex(([i]) => [(i + 1) % reviews.length, 1]), 6000);
    return () => clearInterval(timer.current);
  }, [reviews.length, paused, reduced]);

  if (!reviews.length) return null;
  const r = reviews[index];

  const variants = {
    enter: (d) => (reduced ? { opacity: 0 } : { x: d * 72, opacity: 0, filter: 'blur(8px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (d) => (reduced ? { opacity: 0 } : { x: d * -72, opacity: 0, filter: 'blur(8px)' }),
  };

  return (
    <section id="stories" className="relative scroll-mt-28 overflow-hidden" aria-label="Patient stories">
      <Blob className="-right-64 top-10" from="rgba(16,185,129,0.12)" size={720} />
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHead
          eyebrow="Patient stories"
          title="Loved by the people we care for"
          sub="Real words from verified visits — unedited, the way we received them."
        />

        <div
          className="relative mx-auto mt-14 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* stacked backdrop cards */}
          <div aria-hidden="true" className="absolute inset-x-8 -bottom-3 top-3 -z-10 rounded-[2rem] border border-slate-200/60 bg-white/60" />
          <div aria-hidden="true" className="absolute inset-x-16 -bottom-6 top-6 -z-20 rounded-[2rem] border border-slate-200/40 bg-white/40" />

          <div className="relative min-h-[340px] sm:min-h-[300px]">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.figure
                key={index}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: EASE }}
                drag={reduced ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -64) go(index + 1);
                  else if (info.offset.x > 64) go(index - 1);
                }}
                className="absolute inset-0 flex cursor-grab flex-col rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-[0_2px_6px_rgba(10,27,58,0.04),0_32px_64px_-24px_rgba(10,27,58,0.18)] active:cursor-grabbing sm:p-11"
              >
                <Quote
                  aria-hidden="true"
                  className="absolute right-8 top-8 h-16 w-16 -scale-x-100 text-emerald-600/[0.08]"
                  fill="currentColor"
                  strokeWidth={0}
                />
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Verified visit
                  </span>
                </div>
                <blockquote className="pmx-display mt-6 line-clamp-6 flex-1 text-pretty text-xl font-medium leading-[1.5] tracking-[-0.01em] text-[#0B1220] sm:text-[24px]">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3.5">
                  <Monogram name={r.name} i={index} className="h-11 w-11" textClass="text-[13px]" />
                  <span className="leading-tight">
                    <span className="block text-[15px] font-semibold text-[#0B1220]">{r.name}</span>
                    <span className="mt-0.5 block text-[12.5px] text-slate-500">Patient at {m.name}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* controls */}
          {reviews.length > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:text-emerald-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Previous story"
              >
                <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-2" role="tablist" aria-label="Choose story">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Story ${i + 1}`}
                    onClick={() => go(i)}
                    className={cx(
                      'h-2 rounded-full transition-all duration-300',
                      i === index ? 'w-7 bg-gradient-to-r from-emerald-600 to-emerald-400' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:text-emerald-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Next story"
              >
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
