/**
 * Testimonials — Rebuilt to match Maven Clinic's emerald-green tabbed stories section.
 * Features a solid green background, custom text tabs, a large side-by-side card
 * displaying the patient's photo and quote, AND a full-width "Trusted By" corporate
 * partner logo strip at the top.
 */
import { useState } from 'react';
import { Quote } from 'lucide-react';
import { IMG, cx } from '../lib';
import { SafeImg } from '../ui';

export default function Testimonials({ m }) {
  const [activeTab, setActiveTab] = useState(0);

  // Custom stories mapped to the reviews or default fallback stories
  const stories = [
    {
      tabLabel: 'Anita — Implants',
      name: m.reviews[0]?.name || 'Anita Sen',
      treatment: 'Implant Patient',
      quote: m.reviews[0]?.text || 'I was terrified of getting a dental implant, but Clynic made the entire procedure completely pain-free. The computer-guided planning was fascinating and the results feel completely natural.',
      image: IMG.servicePool[1]
    },
    {
      tabLabel: 'Rajesh — Root Canal',
      name: m.reviews[1]?.name || 'Rajesh Kapoor',
      treatment: 'Root Canal Patient',
      quote: m.reviews[1]?.text || 'Clynic completely changed my perception of root canal treatments. The automated rotary technology was so quiet and efficient. I was in and out in under 45 minutes with absolutely no post-op discomfort.',
      image: IMG.servicePool[0]
    },
    {
      tabLabel: 'Priyanka — Aligners',
      name: m.reviews[2]?.name || 'Priyanka Das',
      treatment: 'Clear Aligners Patient',
      quote: m.reviews[2]?.text || 'Getting clear aligners at Clynic was seamless. The digital scans were quick and accurate. I love my new smile and the WhatsApp check-ins saved me so many clinic visits.',
      image: IMG.servicePool[2]
    }
  ];

  const current = stories[activeTab];

  return (
    <>
      {/* ── Trusted By TPA/Corporate Insurance Logo Strip (Maven Style) ── */}
      <div className="bg-[#012F24] py-12 border-b border-white/5 select-none">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-[11px] font-bold text-white/35 uppercase tracking-widest block mb-7">
            ● Trusted By
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 text-xl sm:text-2xl font-bold tracking-wider text-white/40">
            <span className="hover:text-white transition-colors duration-200">STAR HEALTH</span>
            <span className="hover:text-white transition-colors duration-200">ICICI LOMBARD</span>
            <span className="hover:text-white transition-colors duration-200">NIVA BUPA</span>
            <span className="hover:text-white transition-colors duration-200">HDFC ERGO</span>
            <span className="hover:text-white transition-colors duration-200">BAJAJ ALLIANZ</span>
          </div>
        </div>
      </div>

      <section id="stories" className="scroll-mt-28 bg-[#012F24] text-white py-24 sm:py-32" aria-label="Patient stories">
        <div className="mx-auto max-w-7xl px-6">
          
          {/* Section Head */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="pmx-display text-4xl sm:text-5xl font-light leading-tight tracking-[-0.02em] text-white">
              Real stories from Clynic patients
            </h2>
            <p className="mt-4 text-emerald-100/70 text-base sm:text-lg">
              Discover how our gentle, technology-first approach has transformed smiles and checkups.
            </p>
          </div>

          {/* Stories Tab Selectors */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12 border-b border-white/10 pb-8 max-w-xl mx-auto">
            {stories.map((story, idx) => (
              <button
                key={story.tabLabel}
                onClick={() => setActiveTab(idx)}
                className={cx(
                  'text-sm font-semibold transition-all duration-300 pb-2 border-b-2 outline-none focus:outline-none',
                  activeTab === idx
                    ? 'border-white text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                )}
              >
                {story.tabLabel}
              </button>
            ))}
          </div>

          {/* Testimonial Active Card (Side-by-Side Split) */}
          <div className="max-w-4xl mx-auto rounded-[2.25rem] bg-[#FAF8F5] overflow-hidden shadow-2xl border border-white/5 text-[#012F24] grid md:grid-cols-12">
            {/* Left Column: Image (span 5) */}
            <div className="md:col-span-5 h-[320px] md:h-auto relative">
              <SafeImg
                src={current.image}
                alt={current.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Right Column: Blockquote (span 7) */}
            <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between relative min-h-[300px]">
              <Quote
                aria-hidden="true"
                className="absolute right-8 top-8 h-20 w-20 -scale-x-100 text-emerald-800/[0.04] pointer-events-none"
                fill="currentColor"
                strokeWidth={0}
              />
              
              <div className="grow flex items-center">
                <blockquote className="pmx-display text-xl sm:text-[23px] font-medium leading-relaxed tracking-[-0.015em] text-[#012F24]">
                  “{current.quote}”
                </blockquote>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-6 flex items-center justify-between">
                <div>
                  <cite className="not-italic block text-base font-semibold text-[#012F24]">
                    {current.name}
                  </cite>
                  <span className="text-[12.5px] font-medium text-slate-500 mt-0.5 block">
                    {current.treatment}
                  </span>
                </div>
                
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  ✓ Verified Visit
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
