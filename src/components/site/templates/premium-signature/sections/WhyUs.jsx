/**
 * WhyUs — Rebuilt to Maven Clinic style vertical segment tab selector on dark green background.
 * Left: Vertical tab options with smooth highlights and custom CTAs.
 * Right: Large portrait clinical picture matching the active selection.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { IMG } from '../lib';
import { Button, SafeImg } from '../ui';

export default function WhyUs({ m }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'For Patients',
      title: 'Attentive, customized care plans suited to your history',
      desc: 'We take time to understand your clinical preferences and comfort requirements to deliver dental care that truly considers your long-term health.',
      image: IMG.whyBig
    },
    {
      label: 'For Families',
      title: 'Safe, anxiety-free experiences for patients of all ages',
      desc: 'Our modern clinic design, children-friendly treatment spaces, and empathetic specialists keep your entire family relaxed and looking forward to checkups.',
      image: IMG.whySmall
    },
    {
      label: 'For Businesses',
      title: 'Corporate wellness benefits to protect your team\'s health',
      desc: 'Offer comprehensive, cashless dental plans, prompt diagnostic checkups, and exclusive booking slots for your employees.',
      image: IMG.servicePool[1]
    },
    {
      label: 'For Specialists',
      title: 'State-of-the-art clinical infrastructure and radiology referrals',
      desc: 'Partner with our facility to gain instant access to high-resolution 3D CBCT imaging scans and professional endodontic support.',
      image: IMG.servicePool[3]
    }
  ];

  const current = tabs[activeTab];

  return (
    <section id="about" className="relative scroll-mt-28 bg-[#012F24] text-white py-24 sm:py-32" aria-label="About our care">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left Column (span 7): Vertical tab list and CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full py-2">
            <div>
              {/* Green indicator bar above the list */}
              <div className="w-20 h-1.5 bg-emerald-500 rounded-full mb-10"></div>
              
              <ul className="space-y-6">
                {tabs.map((tab, idx) => {
                  const isActive = activeTab === idx;
                  return (
                    <li key={tab.label} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                      <button
                        onClick={() => setActiveTab(idx)}
                        className="w-full text-left flex items-center justify-between group outline-none focus:outline-none"
                      >
                        <span className={`pmx-display text-2xl sm:text-3xl font-light tracking-[-0.015em] transition-all duration-300 ${
                          isActive ? 'text-emerald-400 translate-x-2' : 'text-white/60 hover:text-white'
                        }`}>
                          {tab.label}
                        </span>
                        <ArrowRight className={`h-6 w-6 transition-all duration-300 ${
                          isActive ? 'text-emerald-400 translate-x-1 opacity-100' : 'text-white/30 opacity-0 group-hover:opacity-100 group-hover:text-white'
                        }`} />
                      </button>
                      
                      {/* Active description revealed inline on mobile, or displayed as dynamic text below */}
                      {isActive && (
                        <div className="mt-4 pl-2 pr-4 space-y-3">
                          <h4 className="text-emerald-100 font-semibold text-base sm:text-lg">
                            {tab.title}
                          </h4>
                          <p className="text-emerald-100/60 text-sm leading-relaxed max-w-xl">
                            {tab.desc}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* See if Clynic offers your plan CTA */}
            <div className="mt-12">
              <Link
                to={m.bookHref}
                className="inline-flex items-center justify-center bg-emerald-400 text-[#012F24] hover:bg-emerald-300 font-semibold rounded-full px-8 py-4 text-sm transition-all duration-300 shadow-md"
              >
                See if Clynic offers your corporate plan
              </Link>
            </div>
          </div>

          {/* Right Column (span 5): Large Portrait Visual Image */}
          <div className="lg:col-span-5 relative">
            <div className="overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-emerald-950/40">
              <SafeImg
                src={current.image}
                alt={current.label}
                className="aspect-[4/5] w-full object-cover transition-all duration-700 hover:scale-105"
              />
            </div>
            {/* Stamp Overlay */}
            <div className="absolute -bottom-6 -left-6 flex items-center gap-2 rounded-2xl bg-[#012F24] px-4.5 py-3 border border-emerald-400/20 shadow-lg text-white">
              <Sparkles className="h-4 w-4 text-emerald-300 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Top Tier Clinical Grade</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
