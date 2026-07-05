import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Shield, Award, Users, BookOpen } from 'lucide-react';
import { SafeImg } from '../ui';

// Interactive Clock component for Card 2
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUnit = (unit) => unit.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#03231B] rounded-2xl border border-emerald-500/10 shadow-inner">
      <div className="flex items-center gap-2 text-3xl font-mono tracking-widest text-emerald-400">
        <span>{formatUnit(time.getHours())}</span>
        <span className="animate-pulse">:</span>
        <span>{formatUnit(time.getMinutes())}</span>
        <span className="animate-pulse">:</span>
        <span className="text-emerald-500/50 text-xl">{formatUnit(time.getSeconds())}</span>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-emerald-300/40 mt-2 font-semibold">TICKING LIVE 24/7/365</span>
    </div>
  );
}

// Glowing World Dot Network for Card 5
function GlobeNetwork() {
  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
      <svg className="w-full h-full opacity-35" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simple dotted map background */}
        <circle cx="20" cy="30" r="1.5" fill="#58EDA2" />
        <circle cx="50" cy="40" r="1.5" fill="#58EDA2" />
        <circle cx="80" cy="25" r="1.5" fill="#58EDA2" />
        <circle cx="110" cy="50" r="1.5" fill="#58EDA2" />
        <circle cx="140" cy="35" r="1.5" fill="#58EDA2" />
        <circle cx="170" cy="45" r="1.5" fill="#58EDA2" />
        {/* Pulsing connections */}
        <path d="M50 40 Q 80 15 110 50" stroke="#58EDA2" strokeWidth="0.75" strokeDasharray="3 3" />
        <path d="M80 25 Q 110 10 140 35" stroke="#58EDA2" strokeWidth="0.75" />
        <path d="M110 50 Q 140 25 170 45" stroke="#58EDA2" strokeWidth="0.75" strokeDasharray="4 2" />
        {/* Glowing node centers */}
        <circle cx="80" cy="25" r="3" fill="#58EDA2" className="animate-ping" />
        <circle cx="80" cy="25" r="2" fill="#58EDA2" />
        <circle cx="140" cy="35" r="3" fill="#58EDA2" className="animate-ping" style={{ animationDelay: '0.5s' }} />
        <circle cx="140" cy="35" r="2" fill="#58EDA2" />
      </svg>
    </div>
  );
}

export default function WhyUs({ m }) {
  const [hoveredSpecialty, setHoveredSpecialty] = useState(null);

  const specialties = [
    { name: 'Nutritionist', desc: 'Custom meal & strength planning' },
    { name: 'Doula Support', desc: 'Continuous labor & birth coaching' },
    { name: 'Lactation Consultant', desc: 'Expert breastfeeding guidance' }
  ];

  return (
    <section id="about" className="relative scroll-mt-28 bg-[#012F24] text-white py-16 sm:py-24" aria-label="Bento Features">
      {/* Background SVG wave pattern to replicate original styling */}
      <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 2219 1808" fill="none" className="w-full h-full object-cover">
          <path d="M1 947.436C301.829 1019.07 886.487 1009.03 1567.48 432.968C1619.75 388.746 1664.26 261.291 1682.57 221.154C1926.5 -313.434 339.819 261.769 1069.99 514.846C1854.97 786.926 2339.47 1027.99 2191.47 855.167C2043.47 682.348 1494.98 416.029 267.498 1807" stroke="#58EDA2" strokeWidth="2" opacity="0.15" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 z-10">
        {/* Header section with split-text styling */}
        <div className="max-w-3xl mb-16">
          <h2 className="pmx-display text-4xl sm:text-5xl font-light tracking-tight leading-tight">
            24/7 virtual care, predictive insights, &amp; employee benefit details—<strong className="font-semibold text-emerald-400">all in one place</strong>
          </h2>
          <p className="mt-6 text-emerald-100/60 text-lg leading-relaxed max-w-2xl">
            Meet the world’s most innovative healthcare platform, combining clinical precision, administrative ease, and AI-native technology.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Card 1: Large Network (Spans 2 rows on desktop) */}
          <div className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-3xl border border-white/10 bg-[#023c2e] p-8 flex flex-col justify-end">
            <SafeImg 
              src="/features-1.webp" 
              alt="Largest virtual care network" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#012F24] via-transparent to-transparent opacity-80" />
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <Users className="w-3.5 h-3.5" /> Scale & reach
              </span>
              <h3 className="pmx-display text-2xl sm:text-3xl font-light tracking-tight leading-tight text-white mb-2">
                The largest virtual care network, supporting 28 million lives worldwide
              </h3>
            </div>
          </div>

          {/* Card 2: 24/7/365 Healthcare (Spans 1 row/col) */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#023c2e] p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                Live Support
              </span>
              <h3 className="text-lg font-medium text-emerald-100 leading-snug">
                Your trusted partner in high-quality, 24/7/365 healthcare
              </h3>
            </div>
            <div className="mt-4">
              <LiveClock />
            </div>
          </div>

          {/* Card 3: 30+ Provider Specialties (Spans 1 row/col) */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#023c2e] p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                Specialties
              </span>
              <h3 className="text-lg font-medium text-emerald-100 leading-snug">
                30+ provider specialties
              </h3>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {specialties.map((spec) => (
                <div 
                  key={spec.name}
                  onMouseEnter={() => setHoveredSpecialty(spec.name)}
                  onMouseLeave={() => setHoveredSpecialty(null)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#03231B] border border-emerald-500/5 hover:border-emerald-500/20 hover:bg-[#042d23] transition-all duration-200 cursor-pointer"
                >
                  <span className="text-xs text-emerald-100 font-medium">{spec.name}</span>
                  <span className={`text-[10px] text-emerald-400 transition-all duration-300 ${
                    hoveredSpecialty === spec.name ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`}>
                    {spec.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Backed by 40+ studies (Spans 1 row/col) */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#023c2e] p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                <BookOpen className="w-3 h-3" /> Clinical Rigor
              </span>
              <h3 className="text-lg font-medium text-emerald-100 leading-snug">
                Backed by 40+ peer-reviewed studies on our care model
              </h3>
            </div>
            <div className="relative h-20 w-full mt-4 flex items-center justify-center">
              <SafeImg src="/features-icon.webp" alt="Studies Icon" className="h-16 w-auto object-contain opacity-80 group-hover:scale-110 transition-all duration-300" />
            </div>
          </div>

          {/* Card 5: Global Care (Spans 1 row/col) */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#023c2e] p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                Global Network
              </span>
              <h3 className="text-lg font-medium text-emerald-100 leading-snug">
                Global care, coverage, and reimbursement across 175+ countries
              </h3>
            </div>
            <div className="mt-4">
              <GlobeNetwork />
            </div>
          </div>

          {/* Card 6: Milliman outcomes (Spans 1 col / 1 row or lg:col-span-1 depending on space) */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#023c2e] p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
            <SafeImg 
              src="/features-2.webp" 
              alt="Milliman outcome results" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-all duration-700 pointer-events-none"
            />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Award className="w-3 h-3" /> Validated
              </span>
              <h3 className="text-lg font-medium text-emerald-100 leading-snug">
                Milliman-validated outcomes, proven by employer and health plan claims-based studies
              </h3>
            </div>
            <div className="relative z-10 flex items-center justify-between text-xs text-emerald-300/60 mt-4 font-semibold">
              <span>Read report</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
