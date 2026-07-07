/**
 * Hero — Clean healthcare hero matching the reference screenshot exactly.
 * Everything fits in ONE viewport: heading, buttons, trust badges, doctor illustration,
 * floating glassmorphic cards (calendar + consultation), and stats bar at bottom.
 */
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarPlus, ArrowRight, Users, Stethoscope, Clock, Star, Video, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EASE, FloatY } from '../motion';

const TEAL = '#0A6A56';
const TEAL_DARK = '#074C3D';
const TEAL_LIGHT = '#EBF6F3';

function Enter({ children, delay = 0, className }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero({ m }) {
  const STATS = [
    { icon: Users, value: '50,000+', label: 'Patients' },
    { icon: Stethoscope, value: '500+', label: 'Doctors' },
    { icon: Clock, value: '24/7', label: 'Support' },
    { icon: Star, value: '98%', label: 'Satisfaction' },
  ];

  return (
    <section className="relative bg-white w-full select-none overflow-x-clip min-h-screen flex flex-col" aria-label="Welcome">

      {/* Background: soft teal glow coming from the center of the whole hero section */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Large center spotlight glow, shifted up to illuminate the top half */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px]" />
        
        {/* Bottom edge glow to seamlessly bleed down into the Services section */}
        <div className="absolute -bottom-[200px] left-1/2 -translate-x-1/2 w-[800px] lg:w-[1200px] h-[400px] rounded-[100%] bg-[#0BB89F]/10 blur-[100px]" />
        
        {/* Specific top edge glow to bleed into the navbar area */}
        <div className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-[100%] bg-[#0A6A56]/20 blur-[80px]" />
        
        {/* Subtle dot grid over the background */}
        <div className="absolute inset-0 opacity-[0.2]" style={{
          backgroundImage: `radial-gradient(circle, ${TEAL}12 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(circle 50% at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle 50% at 50% 50%, black 20%, transparent 80%)',
        }} />

        {/* Curvy background vector wave lines (Maven style) - Fixed height on mobile to prevent stretching */}
        <svg className="absolute bottom-0 top-auto left-0 w-full h-[350px] sm:h-[550px] lg:h-full opacity-60 pointer-events-none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0BB89F" stopOpacity="0" />
              <stop offset="25%" stopColor="#0BB89F" stopOpacity="0.75" />
              <stop offset="75%" stopColor="#0E8C72" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0E8C72" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="yellowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
              <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#D97706" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0" />
              <stop offset="40%" stopColor="#4F46E5" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Overlapping paths */}
          <path d="M -50 520 C 220 570, 320 340, 580 480 S 980 620, 1500 420" stroke="url(#tealGrad)" strokeWidth="2" />
          <path d="M -50 440 C 240 390, 420 540, 720 370 S 1080 220, 1500 340" stroke="url(#yellowGrad)" strokeWidth="1.5" />
          <path d="M -50 480 C 180 450, 280 500, 480 430 S 820 550, 1500 470" stroke="url(#purpleGrad)" strokeWidth="1.5" />
          
          {/* Glowing circular nodes (matching screenshot dots) - Hidden on mobile for clean UI */}
          {/* Teal dot under Explore Services / Get care button */}
          <circle cx="340" cy="445" r="4.5" fill="#0BB89F" className="hidden sm:block" />
          <circle cx="340" cy="445" r="8.5" stroke="#0BB89F" strokeOpacity="0.4" strokeWidth="1.5" className="hidden sm:block" />
          
          {/* Purple dot slightly to the right */}
          <circle cx="480" cy="470" r="3.5" fill="#6366F1" className="hidden sm:block" />
          
          {/* Yellow anchor dot on the right side */}
          <circle cx="1120" cy="326" r="4.5" fill="#F59E0B" className="hidden sm:block" />
          <circle cx="1120" cy="326" r="8.5" stroke="#F59E0B" strokeOpacity="0.4" strokeWidth="1.5" className="hidden sm:block" />
        </svg>

        {/* Floating text badge connected to the yellow dot */}
        <div className="absolute left-[78.5%] top-[40.8%] transform -translate-y-1/2 hidden xl:flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200/80 px-3 py-1 rounded-full shadow-sm z-20">
          <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">Supporting Working Parents</span>
        </div>
      </div>

      {/* Main content — compact to fit viewport */}
      <div className="relative flex-1 flex flex-col mx-auto max-w-7xl w-full px-5 sm:px-8 pt-[68px] z-10">

        {/* Two-column hero */}
        <div className="flex-1 flex flex-col lg:flex-row items-center gap-3 lg:gap-2 py-2 lg:py-0">

          {/* ── LEFT: Text + CTAs ── */}
          <div className="flex-1 lg:flex-[0_0_50%] text-center lg:text-left flex flex-col justify-center">

            <Enter delay={0.05}>
              <h1 className="text-[2.2rem] sm:text-[2.6rem] lg:text-[2.9rem] xl:text-[3.2rem] font-extrabold leading-[1.12] tracking-tight text-[#1A1A2E]">
                Your Trusted Digital{' '}
                <br className="hidden sm:block" />
                <span style={{ color: TEAL }}>Healthcare</span> Partner
              </h1>
            </Enter>

            <Enter delay={0.12}>
              <p className="mt-2.5 sm:mt-3 text-[14px] sm:text-[15px] leading-relaxed text-[#5A6B7D] max-w-md mx-auto lg:mx-0">
                {m.hero.tagline || 'Book appointments, consult expert doctors, order medicines, and manage your healthcare in one place.'}
              </p>
            </Enter>

            {/* CTA Buttons — liquid glass style */}
            <Enter delay={0.2} className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                to={m.bookHref}
                className="group relative inline-flex h-[46px] items-center justify-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`,
                  boxShadow: `0 8px 22px -7px rgba(14, 140, 114, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.45)`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL_DARK}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`; }}
              >
                {/* Glassmorphic sheen on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <CalendarPlus className="h-4 w-4" />
                Book Appointment
              </Link>
              <a
                href="#services"
                className="group inline-flex h-[46px] items-center justify-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] relative overflow-hidden"
                style={{
                  border: `1px solid rgba(14, 140, 114, 0.3)`,
                  color: TEAL,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%), rgba(14, 140, 114, 0.05)',
                  boxShadow: `0 4px 14px -6px rgba(14, 140, 114, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%), rgba(14, 140, 114, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%), rgba(14, 140, 114, 0.05)'; }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#0E8C72]/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                Explore Services
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Enter>

            {/* Trust badges */}
            <Enter delay={0.28} className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-5">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                      style={{ background: [`linear-gradient(135deg, ${TEAL}, #0BB89F)`, 'linear-gradient(135deg, #4F46E5, #7C3AED)', 'linear-gradient(135deg, #2563EB, #3B82F6)', 'linear-gradient(135deg, #D97706, #F59E0B)'][i] }}
                    >{['JR', 'AS', 'KM', 'NP'][i]}</div>
                  ))}
                </div>
                <div className="text-left">
                  <span className="text-[12px] font-bold text-[#1A1A2E] block leading-tight">Trust Users</span>
                  <span className="text-[10px] text-[#5A6B7D]">Trust Badge</span>
                </div>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: TEAL_LIGHT }}>
                  <CheckCircle2 className="h-4 w-4" style={{ color: TEAL }} />
                </div>
                <div className="text-left">
                  <span className="text-[12px] font-bold text-[#1A1A2E] block leading-tight">Ensure Badges</span>
                  <span className="text-[10px] text-[#5A6B7D]">Organization</span>
                </div>
              </div>
            </Enter>

            {/* ── Stats — Moved here ── */}
            <Enter delay={0.35} className="mt-10 sm:mt-12 py-6 sm:py-8 border-y border-[#0E8C72] w-full max-w-lg lg:max-w-none">
              <div className="flex items-stretch justify-between gap-1 sm:gap-2">
                {STATS.map((stat, idx) => (
                  <div key={stat.label} className="flex-1 flex items-stretch">
                    <div className="text-left group cursor-default flex-1 min-w-0 pr-1 sm:pr-3">
                      <span className="text-[15px] sm:text-2xl lg:text-3xl font-extrabold block tracking-tight text-slate-800" style={{ color: TEAL }}>
                        {stat.value}
                      </span>
                      <span className="text-[8px] sm:text-[10px] lg:text-[11px] font-bold text-[#718096] uppercase tracking-widest block mt-0.5 sm:mt-1">
                        {stat.label}
                      </span>
                    </div>
                    {idx < STATS.length - 1 && (
                      <div className="w-[1.5px] bg-[#0E8C72] self-stretch shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </Enter>
          </div>

          {/* ── RIGHT: Doctor + Floating Cards ── */}
          <div className="flex-1 lg:flex-[0_0_50%] relative flex items-center justify-center min-h-[280px] sm:min-h-[340px] lg:min-h-0 py-8 lg:py-12">

            {/* Circular background behind the doctor */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[380px] lg:h-[380px] xl:w-[420px] xl:h-[420px] rounded-full" style={{ background: `linear-gradient(135deg, ${TEAL_LIGHT}, rgba(14,140,114,0.05))` }} />
            </div>

            {/* Doctor image */}
            <Enter delay={0.2} className="relative z-10 flex items-center justify-center w-full h-full">
              <img
                src="/hero-doctor.png"
                alt="Healthcare consultation"
                className="w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[400px] xl:max-w-[440px] h-auto object-contain drop-shadow-xl"
                loading="eager"
                fetchpriority="high"
              />
            </Enter>

            {/* Floating Card: Today's Appointments — Calendar UI */}
            <FloatY distance={5} duration={5} delay={0} className="absolute top-0 right-0 sm:top-2 sm:-right-1 lg:top-4 lg:right-0 xl:right-2 z-20">
              <Enter delay={0.45}>
                <div className="rounded-2xl bg-white/35 p-3 shadow-[0_12px_40px_-6px_rgba(14,140,114,0.15),inset_0_1px_0_0_rgba(255,255,255,0.6)] border border-white/40 w-[200px]"
                  style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: TEAL_LIGHT }}>
                        <Calendar className="h-3 w-3" style={{ color: TEAL }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#1A1A2E]">Todays Appointments</span>
                    </div>
                  </div>
                  {/* Mini calendar grid */}
                  <div className="grid grid-cols-7 gap-px mb-2">
                    {['M','T','W','T','F','S','S'].map((d, i) => (
                      <span key={i} className="text-[7px] font-semibold text-[#9CA3AF] text-center">{d}</span>
                    ))}
                    {[28,29,30,1,2,3,4,5,6,7,8,9,10,11].map((d, i) => (
                      <span key={i} className={`text-[8px] text-center rounded-sm py-0.5 ${d === 8 ? 'bg-[#0E8C72] text-white font-bold' : d < 1 ? 'text-slate-300' : 'text-slate-500'}`}>
                        {d > 0 ? d : ''}
                      </span>
                    ))}
                  </div>
                  {/* Appointment entries */}
                  <div className="space-y-1">
                    {[
                      { time: '09:30', name: 'Dr. Sarah M.', tag: 'Checkup' },
                      { time: '11:00', name: 'Dr. Rajesh K.', tag: 'Follow-up' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-white/35 backdrop-blur-sm rounded-md px-2 py-1 border border-white/20">
                        <span className="text-[8px] font-semibold text-[#9CA3AF] w-[30px] shrink-0">{a.time}</span>
                        <span className="text-[9px] font-semibold text-[#1A1A2E] truncate flex-1">{a.name}</span>
                        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: TEAL_LIGHT, color: TEAL }}>{a.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Enter>
            </FloatY>

            {/* Floating Card: Small green notification card */}
            <FloatY distance={4} duration={6} delay={0.8} className="absolute top-[15%] left-0 sm:left-2 lg:top-[18%] lg:left-4 z-20">
              <Enter delay={0.55}>
                <div className="rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg text-white text-[10px] font-bold"
                  style={{ background: TEAL, boxShadow: `0 4px 16px -4px ${TEAL}60` }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </div>
              </Enter>
            </FloatY>

            {/* Floating Card: Appointment detail / second card */}
            <FloatY distance={5} duration={5.5} delay={0.4} className="absolute top-[40%] right-0 sm:-right-2 lg:right-[-8px] xl:right-0 z-20 hidden sm:block">
              <Enter delay={0.5}>
                <div className="rounded-xl bg-white/35 p-2.5 shadow-[0_12px_32px_-6px_rgba(14,140,114,0.12),inset_0_1px_0_0_rgba(255,255,255,0.6)] border border-white/40 w-[160px]"
                  style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                      <Calendar className="h-3 w-3 text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-bold text-[#1A1A2E]">Today Appointments</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/35 backdrop-blur-sm rounded-md px-2 py-1 border border-white/20">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-[7px] text-white font-bold">AK</div>
                    <div>
                      <span className="text-[9px] font-semibold text-[#1A1A2E] block leading-tight">Arjun K.</span>
                      <span className="text-[7px] text-[#9CA3AF]">2:30 PM</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-300 ml-auto" />
                  </div>
                </div>
              </Enter>
            </FloatY>

            {/* Floating Card: Online Consultation */}
            <FloatY distance={6} duration={6} delay={0.6} className="absolute bottom-2 left-0 sm:bottom-4 sm:-left-2 lg:bottom-8 lg:left-0 z-20">
              <Enter delay={0.6}>
                <div className="rounded-2xl bg-white/35 p-3 shadow-[0_16px_48px_-8px_rgba(14,140,114,0.18),inset_0_1px_0_0_rgba(255,255,255,0.6)] border border-white/40"
                  style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${TEAL}, #0BB89F)` }}
                    >
                      <Video className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#1A1A2E] block">Online Consultation</span>
                      <span className="text-[9px] text-[#5A6B7D]">Connect with doctors virtually</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {[TEAL, '#4F46E5', '#2563EB'].map((c, i) => (
                        <div key={i} className="h-5 w-5 rounded-full border-[1.5px] border-white" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-[9px] font-medium text-[#5A6B7D]">12+ doctors online</span>
                  </div>
                </div>
              </Enter>
            </FloatY>
          </div>
        </div>

      </div>
    </section>
  );
}
