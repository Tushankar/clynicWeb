/**
 * Hero — Cinematic full-bleed background photo layout matching Maven Clinic.
 * Features a high-res clinical portrait background, left-aligned typography,
 * dark gradient readability overlay, and matching green action buttons.
 */
import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { telHref, IMG } from '../lib';
import { EASE, Item, Stagger } from '../motion';
import { Button } from '../ui';

function Enter({ children, delay = 0, className }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero({ m }) {
  const ref = useRef(null);
  
  // Use custom configured hero image or default modern clinic photo
  const heroImage = m.hero.imageUrl || IMG.whyBig;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-[90vh] flex items-center bg-[#0A1C14] text-white pt-36 pb-48 select-none"
      aria-label="Welcome"
    >
      {/* ── Background Photo (Full Bleed) ── */}
      <img
        src={heroImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* ── Readability Overlay: Horizontal Dark Gradient ── */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-gradient-to-r from-[#0A1C14] via-[#0A1C14]/90 to-transparent lg:to-[#0A1C14]/20 pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-gradient-to-t from-[#0A1C14] via-transparent to-transparent pointer-events-none" 
      />

      {/* Decorative curves overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
        <svg className="absolute w-full h-full" fill="none" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-200 400C150 150 600 700 900 350C1200 0 1400 300 1600 150"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative mx-auto w-full max-w-7xl px-6 z-10">
        <div className="max-w-3xl">
          <Enter delay={0.05}>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-[#0A1C14]/60 py-1.5 px-4 text-[12px] font-semibold text-emerald-300 uppercase tracking-widest"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Accepting new patients
            </span>
          </Enter>

          <Enter delay={0.15} className="mt-8">
            <h1 className="pmx-display text-balance text-4xl sm:text-5xl lg:text-[4.5rem] font-light leading-[1.1] tracking-[-0.03em] text-white">
              Dental care designed <br className="hidden sm:inline" />
              for your peace of mind <br className="hidden sm:inline" />
              that's personal <span className="italic font-serif text-emerald-300">and proven</span>
            </h1>
          </Enter>

          <Enter delay={0.28}>
            <p className="mt-8 max-w-xl text-pretty text-base sm:text-lg leading-relaxed text-emerald-100/70">
              Trusted by 5,000+ patients in Kolkata to deliver state-of-the-art diagnostic and clinical treatments.
            </p>
          </Enter>

          <Enter delay={0.35} className="mt-10 flex flex-wrap items-center gap-4">
            <Button 
              to={m.bookHref} 
              size="lg" 
              className="px-8 bg-[#005A36] text-white hover:bg-[#004225] shadow-md border-transparent"
            >
              Book appointment
            </Button>
            {m.contact.phone ? (
              <Button 
                href={telHref(m.contact.phone)} 
                variant="outline" 
                size="lg" 
                className="px-8 border-white text-white hover:bg-white hover:text-[#0A1C14] transition-colors"
              >
                Call {m.contact.phone}
              </Button>
            ) : null}
          </Enter>
          
          <Enter delay={0.42} className="mt-6 text-[12px] text-white/40 font-medium">
            Under a minute to book · no account needed · free rescheduling
          </Enter>
        </div>
      </div>
    </section>
  );
}
