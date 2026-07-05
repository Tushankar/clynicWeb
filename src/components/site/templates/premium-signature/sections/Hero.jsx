/**
 * Hero — Cinematic slideshow background layout matching Maven Clinic.
 * Features an inset rounded card container nested in the website's brand green (#0A1C14) page background.
 * The card takes up the full screen height (calc(100vh - 2rem)) with the background slideshow
 * running edge-to-edge inside the card with slow Ken Burns scale effect.
 * Dynamic wave animations and connecting text badge match the Maven Clinic screenshots.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { telHref } from '../lib';
import { EASE } from '../motion';
import { Button } from '../ui';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1600&auto=format&fit=crop',
    label: 'EXTENDING HEALTH IN MIDLIFE'
  },
  {
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1600&auto=format&fit=crop',
    label: 'ENSURING HEALTHY PREGNANCIES'
  },
  {
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop',
    label: 'SUPPORTING WORKING PARENTS'
  },
  {
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop',
    label: 'PROVIDING PEDIATRIC CARE'
  },
  {
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1600&auto=format&fit=crop',
    label: 'DELIVERING EXPERT CLINICAL CARE'
  }
];

function Enter({ children, delay = 0, className }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 15, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero({ m }) {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative bg-[#012F24] px-4 pt-4 pb-4 w-full select-none"
      aria-label="Welcome"
    >
      {/* CSS Keyframes for smooth group translation (fully compatible with all browsers) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveTranslation1 {
          0% { transform: translate3d(0px, 0px, 0px); }
          50% { transform: translate3d(-12px, 4px, 0px); }
          100% { transform: translate3d(0px, 0px, 0px); }
        }
        @keyframes waveTranslation2 {
          0% { transform: translate3d(0px, 0px, 0px); }
          50% { transform: translate3d(12px, -4px, 0px); }
          100% { transform: translate3d(0px, 0px, 0px); }
        }
        .animate-wave-group-1 { animation: waveTranslation1 10s ease-in-out infinite; }
        .animate-wave-group-2 { animation: waveTranslation2 12s ease-in-out infinite; }
        .animate-wave-group-3 { animation: waveTranslation1 14s ease-in-out infinite; }
        .animate-wave-group-4 { animation: waveTranslation2 16s ease-in-out infinite; }
      `}} />

      {/* Inset card taking up full screen height, matching Maven SS */}
      <div className="relative mx-auto max-w-[1480px] rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[calc(100vh-2rem)] flex items-center bg-[#012F24] text-white select-none shadow-[0_24px_64px_-16px_rgba(1,47,36,0.30)] border border-emerald-950/15 w-full z-10">
        
        {/* ── Background Slideshow with Ken Burns effect ── */}
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentImg}
              src={HERO_SLIDES[currentImg].image}
              alt=""
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5, ease: 'easeInOut' },
                scale: { duration: 7, ease: 'linear' }
              }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>
        </div>

        {/* ── Readability Overlay: Double Gradients ── */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/25 md:to-transparent pointer-events-none z-[1]" 
        />
        <div 
          aria-hidden="true" 
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/35 pointer-events-none z-[1]" 
        />

        {/* ── Glowing Wave Curves Overlay (4 lines coming from the left and fading out at the badge) ── */}
        <div className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
          <svg className="absolute bottom-0 left-0 w-full h-[280px]" fill="none" viewBox="0 0 1440 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            
            {/* Line 1: Rose Gradient (4th line) */}
            <g className="animate-wave-group-1">
              <path
                d="M-50 120C70 80 230 170 390 100C550 30 680 130 880 70C1080 10 1230 90 1500 40"
                stroke="url(#neon-rose)"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="opacity-80"
              />
            </g>

            {/* Line 2: Cyan Gradient */}
            <g className="animate-wave-group-2">
              <path
                d="M-50 150C120 110 300 210 480 130C660 50 800 170 1000 110C1200 50 1350 130 1500 80"
                stroke="url(#neon-cyan)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="opacity-90"
              />
            </g>
            
            {/* Line 3: Emerald Gradient */}
            <g className="animate-wave-group-3">
              <path
                d="M-50 180C150 130 280 230 500 150C720 70 850 190 1050 130C1250 70 1380 150 1500 110"
                stroke="url(#neon-emerald)"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="opacity-85"
              />
            </g>
            
            {/* Line 4: Gold Gradient */}
            <g className="animate-wave-group-4">
              <path
                d="M-50 210C100 170 350 250 520 170C690 90 900 210 1100 140C1300 70 1400 170 1500 130"
                stroke="url(#neon-gold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="opacity-75"
              />
            </g>

            {/* Gradients configured to fade out completely by 65% width, extending the lines further */}
            <defs>
              <linearGradient id="neon-rose" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF2E93" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#FF2E93" stopOpacity="0.5" />
                <stop offset="65%" stopColor="#FF2E93" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="neon-cyan" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#00F2FE" stopOpacity="0.65" />
                <stop offset="65%" stopColor="#00F2FE" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="neon-emerald" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#33F8B1" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#33F8B1" stopOpacity="0.55" />
                <stop offset="65%" stopColor="#33F8B1" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="neon-gold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FAD961" stopOpacity="0.85" />
                <stop offset="30%" stopColor="#FAD961" stopOpacity="0.45" />
                <stop offset="65%" stopColor="#FAD961" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── Content Container with padding-top to prevent navbar overlap ── */}
        <div className="relative mx-auto w-full max-w-7xl px-8 sm:px-12 z-10 pt-28 sm:pt-36 pb-8">
          <div className="max-w-2xl text-left">
            
            <Enter delay={0.05}>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-black/45 py-1.5 px-4 text-[11px] font-semibold text-emerald-300 uppercase tracking-widest"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Accepting new patients
              </span>
            </Enter>

            <Enter delay={0.15} className="mt-6 sm:mt-8">
              <h1 className="text-balance text-4xl sm:text-5xl lg:text-[4.5rem] font-light leading-[1.08] tracking-[-0.03em] text-white font-sans">
                Evidence-based <br />
                women’s and <br />
                family <span className="font-serif italic font-normal text-white">healthcare</span>
              </h1>
            </Enter>

            <Enter delay={0.28}>
              <p className="mt-5 max-w-md text-pretty text-base sm:text-lg leading-relaxed text-slate-200">
                Expert care across every life stage. Modern clinical care with same-day appointments, digital records, and doctors who listen.
              </p>
            </Enter>

            <Enter delay={0.35} className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4">
              <Button
                to={m.bookHref}
                className="px-8 py-3.5 bg-[#012F24] hover:bg-[#001f18] text-white font-semibold text-sm rounded-md transition-all duration-200 shadow-md shadow-[#012F24]/15 border border-transparent hover:-translate-y-0.5"
                magnetic={false}
              >
                Explore platform
              </Button>
              {m.contact.phone ? (
                <a
                  href={telHref(m.contact.phone)}
                  className="h-12 px-8 inline-flex items-center justify-center border border-white/20 hover:border-white/40 text-white hover:bg-white/5 bg-transparent font-semibold text-sm rounded-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get care
                </a>
              ) : null}
            </Enter>

          </div>
        </div>

        {/* ── Floating Badges inside Hero Card ── */}
        
        {/* Bottom-left: Fingerprint Badge */}
        <div className="absolute bottom-8 left-8 z-10 hidden sm:block">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#012F24] text-white shadow-lg transition-transform hover:scale-105 cursor-pointer border border-white/10">
            <Fingerprint className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Dynamic Floating Badge aligned with the moving wave line (matching SS 2) */}
        <div className="absolute bottom-[22%] left-[20%] sm:left-[26%] lg:left-[32%] z-20 flex items-center gap-2.5">
          <div className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#33F8B1] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#33F8B1] shadow-[0_0_8px_#33F8B1]" />
          </div>
          <div 
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-white/95 shadow-lg select-none"
            style={{ letterSpacing: '0.12em' }}
          >
            {HERO_SLIDES[currentImg].label}
          </div>
        </div>

      </div>
    </section>
  );
}
