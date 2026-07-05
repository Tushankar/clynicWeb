/**
 * Technology — Maven Clinic style details grid.
 * Renders an asymmetric grid of 6 rounded, colorful and custom panels.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IMG } from '../lib';
import { Item, Stagger } from '../motion';
import { SectionHead } from '../ui';

export default function Technology({ m }) {
  return (
    <section id="technology" className="scroll-mt-28 bg-[#FAF8F5] py-24 sm:py-32" aria-label="Technology">
      <div className="mx-auto max-w-7xl px-6">
        
        <SectionHead
          align="center"
          eyebrow="Under the hood"
          title="All details in one place"
          sub="Everything digital about your dental visit — records, diagnostics, reminders, and payment benefits — runs on one secure platform."
        />

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {/* Card 1: Wide image + overlay text */}
          <Item>
            <div className="relative overflow-hidden rounded-[2.25rem] bg-slate-200 p-8 h-[400px] flex flex-col justify-end group shadow-sm border border-slate-200/50">
              <img
                src={IMG.servicePool[5 % IMG.servicePool.length]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>
              <h3 className="pmx-display relative text-2xl font-semibold leading-snug text-white tracking-[-0.01em] z-10">
                The most modern clinical facility in Kolkata, serving over 10,000+ smiles.
              </h3>
            </div>
          </Item>

          {/* Card 2: 30+ Provider Specialties stack */}
          <Item>
            <div className="relative rounded-[2.25rem] bg-[#012F24] p-8 h-[400px] flex flex-col justify-between text-white group shadow-sm">
              <h3 className="pmx-display text-3xl font-light leading-snug tracking-[-0.02em]">
                30+ years of collective clinical expertise
              </h3>
              
              <div className="space-y-3.5 pb-2">
                <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/25 p-4 flex items-center justify-between text-sm font-semibold tracking-wide backdrop-blur-md">
                  <span>🦷 Orthodontic Specialist</span>
                </div>
                <div className="rounded-2xl bg-cyan-500/20 border border-cyan-400/25 p-4 flex items-center justify-between text-sm font-semibold tracking-wide backdrop-blur-md">
                  <span>✨ Cosmetic Implantologist</span>
                </div>
              </div>
            </div>
          </Item>

          {/* Card 3: Global care / Cashless claims */}
          <Item>
            <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-cyan-600 to-teal-700 p-8 h-[400px] flex flex-col justify-between text-white shadow-sm">
              <h3 className="pmx-display text-3xl font-light leading-snug tracking-[-0.02em]">
                Flexible financing, cashless claims, and corporate treatment benefits
              </h3>

              {/* Decorative globe lines */}
              <div className="absolute -bottom-16 -right-16 opacity-15 pointer-events-none">
                <svg width="240" height="240" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="100" cy="100" r="80" />
                  <path d="M20 100h160M100 20v160M30 60c20 20 20 60 0 80M170 60c-20 20-20 60 0 80" />
                </svg>
              </div>

              <div className="flex gap-2.5 text-xs font-semibold z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15">Cashless TPA</span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15">0% EMI Options</span>
              </div>
            </div>
          </Item>

          {/* Card 4: Dark green panel */}
          <Item className="lg:col-span-1">
            <div className="relative rounded-[2.25rem] bg-[#012F24] p-8 h-[280px] flex flex-col justify-between text-white shadow-sm border border-emerald-950/20">
              <h3 className="pmx-display text-2xl font-light leading-snug tracking-[-0.02em]">
                Your trusted partner in high-quality, pain-free dental healthcare.
              </h3>
              
              <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </Item>

          {/* Card 5: Teal gradient */}
          <Item>
            <div className="relative rounded-[2.25rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-8 h-[280px] flex flex-col justify-between text-white shadow-sm">
              <h3 className="pmx-display text-2xl font-light leading-snug tracking-[-0.02em]">
                Backed by 100% sterile protocols and state-of-the-art diagnostics.
              </h3>
              
              <span className="text-xs font-semibold text-emerald-200">ISO 9001:2015 CERTIFIED</span>
            </div>
          </Item>

          {/* Card 6: App Mockup */}
          <Item>
            <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#FAF8F5] to-slate-100 border border-slate-200 p-8 h-[280px] flex flex-col justify-between text-[#012F24] shadow-sm">
              <h3 className="pmx-display text-2xl font-light leading-snug tracking-[-0.02em]">
                Digital record tracking & instant post-care support via our app.
              </h3>
              
              <div className="absolute right-6 -bottom-10 w-28 h-40 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-lg rotate-12 transition-transform duration-500 hover:rotate-6">
                <div className="w-full h-full bg-[#012F24]/5 rounded-lg flex flex-col gap-1.5 p-1.5">
                  <div className="w-8 h-2.5 bg-[#012F24] rounded-sm"></div>
                  <div className="grow bg-white rounded-md border border-slate-100 flex items-center justify-center text-[10px] text-emerald-800">
                    ✓ Clean
                  </div>
                </div>
              </div>
            </div>
          </Item>
        </Stagger>

        <div className="mt-16 text-center">
          <Link
            to={m.bookHref}
            className="group inline-flex items-center gap-2 rounded-full bg-[#012F24] hover:bg-[#001f18] px-8 py-4 text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md"
          >
            Explore our clinical platform
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        
      </div>
    </section>
  );
}
