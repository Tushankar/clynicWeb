/**
 * Patient journey — five connected steps. The spine draws itself on scroll; nodes pop in
 * with a stagger. Horizontal rail on desktop, vertical timeline on mobile.
 */
import * as Icons from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { JOURNEY } from '../lib';
import { EASE, Item, Stagger } from '../motion';
import { SectionHead } from '../ui';

export default function Journey() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-y border-slate-900/[0.06] bg-white/60" aria-label="Your journey">
      <div aria-hidden="true" className="pmx-grid absolute inset-0 opacity-[0.35]" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHead
          eyebrow="The experience"
          title="Your journey, from hello to healthy"
          sub="Five unhurried steps — designed so you always know exactly what happens next."
        />

        {/* desktop rail */}
        <div className="relative mt-20 hidden lg:block">
          {/* spine */}
          <div className="absolute left-0 right-0 top-7 h-px bg-slate-200" aria-hidden="true" />
          <motion.div
            aria-hidden="true"
            className="absolute left-0 top-7 h-[2px] origin-left rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400"
            style={{ width: '100%' }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px 0px' }}
            transition={{ duration: reduced ? 0 : 1.6, ease: EASE }}
          />
          <Stagger className="relative grid grid-cols-5 gap-6" gap={0.16}>
            {JOURNEY.map((s, i) => {
              const Icon = Icons[s.icon] || Icons.Circle;
              return (
                <Item key={s.title} className="group">
                  <div className="relative inline-flex">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-emerald-700 shadow-[0_8px_24px_-10px_rgba(10,27,58,0.18)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-500/30 group-hover:shadow-[0_16px_36px_-12px_rgba(5,150,105,0.35)]">
                      <Icon className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="pmx-display absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1B3A] text-[11px] font-semibold text-white ring-[3px] ring-[#F8FAFC]">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="pmx-display mt-5 text-[17px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-[220px] text-[13.5px] leading-relaxed text-slate-500">{s.text}</p>
                </Item>
              );
            })}
          </Stagger>
        </div>

        {/* mobile timeline */}
        <div className="relative mt-14 lg:hidden">
          <div className="absolute bottom-4 left-7 top-4 w-px bg-slate-200" aria-hidden="true" />
          <motion.div
            aria-hidden="true"
            className="absolute left-7 top-4 w-[2px] origin-top rounded-full bg-gradient-to-b from-emerald-600 to-teal-400"
            style={{ height: 'calc(100% - 2rem)' }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-80px 0px' }}
            transition={{ duration: reduced ? 0 : 1.4, ease: EASE }}
          />
          <Stagger className="space-y-9" gap={0.12}>
            {JOURNEY.map((s, i) => {
              const Icon = Icons[s.icon] || Icons.Circle;
              return (
                <Item key={s.title} className="relative flex gap-5 pl-0">
                  <div className="relative z-10 shrink-0">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-emerald-700 shadow-[0_8px_24px_-10px_rgba(10,27,58,0.18)]">
                      <Icon className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="pmx-display absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1B3A] text-[10.5px] font-semibold text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                  </div>
                  <div className="pt-1.5">
                    <h3 className="pmx-display text-[17px] font-semibold text-[#0B1220]">{s.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{s.text}</p>
                  </div>
                </Item>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
