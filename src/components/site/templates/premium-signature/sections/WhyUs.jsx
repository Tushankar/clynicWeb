import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Bookmark, ChevronRight } from 'lucide-react';
import { Item, Stagger } from '../motion';

export default function WhyUs({ m }) {
  const TEAL = '#0E8C72';
  const TEAL_DARK = '#074C3D';

  const doctorsList = [
    {
      name: 'Dr. James Carter',
      specialty: 'Orthodontist',
      img: '/doctor_avatar_1.png',
      bgColor: 'rgba(11, 184, 159, 0.08)', // Tinted teal light
      rating: '4.9 (120+)',
      experience: '8 Yrs Exp'
    },
    {
      name: 'Dr. Alan Vance',
      specialty: 'Endodontist',
      img: '/doctor_avatar_2.png',
      bgColor: 'rgba(37, 99, 235, 0.06)', // Tinted blue light
      rating: '4.8 (95+)',
      experience: '10 Yrs Exp'
    },
    {
      name: 'Dr. Sarah Miller',
      specialty: 'Periodontist',
      img: '/doctor_avatar_3.png',
      bgColor: 'rgba(99, 102, 241, 0.06)', // Tinted indigo light
      rating: '4.9 (140+)',
      experience: '7 Yrs Exp'
    },
    {
      name: 'Dr. Emily Watson',
      specialty: 'Pediatrician',
      img: '/doctor_avatar_4.png',
      bgColor: 'rgba(236, 72, 153, 0.06)', // Tinted pink light
      rating: '4.9 (110+)',
      experience: '9 Yrs Exp'
    }
  ];

  return (
    <section id="doctors" className="relative scroll-mt-28 bg-transparent pb-24 pt-0 mt-0 overflow-x-clip select-none" aria-label="Popular Doctors">
      
      {/* Ambient signature teal glow positioned at the top boundary to blend seamlessly with the Services section above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 z-10">
        
        {/* Header with Title and See All button */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="pmx-display text-3xl sm:text-[38px] font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
              Popular Doctors
            </h2>
          </div>
          <Link 
            to={m.bookHref} 
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 bg-white/40 backdrop-blur-md hover:bg-white transition-all hover:border-slate-300"
          >
            See All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Doctors Grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" gap={0.1}>
          {doctorsList.map((doc, i) => (
            <Item key={i}>
              {/* Liquid Glass Doctor Card */}
              <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-4 border border-white/50 shadow-[0_12px_40px_-8px_rgba(14,140,114,0.1),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_20px_48px_-10px_rgba(14,140,114,0.2),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                
                {/* 3D Doctor Illustration Container - Bleeds to edges */}
                <div className="relative rounded-xl h-[220px] overflow-hidden flex items-center justify-center mb-3.5 transition-transform group-hover:scale-[1.01]">
                  <img 
                    src={doc.img} 
                    alt={doc.name} 
                    className="w-full h-full object-cover object-top scale-[1.35] origin-top select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.42]" 
                  />
                  
                  {/* Bookmark Button */}
                  <button className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-white/50 text-[#0E8C72] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-sm">
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col px-0.5">
                  <h3 className="text-lg font-bold text-[#1A1A2E] leading-tight">
                    {doc.name}
                  </h3>
                  <p className="text-[12.5px] text-slate-500 font-semibold mt-1">
                    {doc.specialty}
                  </p>

                  {/* Rating + Experience row */}
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mt-3.5 mb-5">
                    <div className="flex items-center gap-1.2">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0 mr-1" />
                      <span>{doc.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.2">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0E8C72] shrink-0 mr-1" />
                      <span>{doc.experience}</span>
                    </div>
                  </div>

                  {/* Premium Liquid Glass Book Button - Rounded Full */}
                  <Link 
                    to={m.bookHref} 
                    className="group/btn relative block w-full text-center py-3 rounded-full text-[13.5px] font-bold text-white transition-all duration-200 active:scale-[0.98] overflow-hidden mt-auto shadow-[0_6px_16px_-4px_rgba(14,140,114,0.45)] hover:shadow-[0_10px_20px_-6px_rgba(14,140,114,0.55)]"
                    style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL_DARK}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`; }}
                  >
                    {/* Glassmorphic sheen on hover */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />
                    <span className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] rounded-full pointer-events-none" />
                    <span className="relative z-10">Book</span>
                  </Link>
                </div>
              </div>
            </Item>
          ))}
        </Stagger>

      </div>
    </section>
  );
}
