/**
 * Technology — the dark editorial moment. Deep-navy canvas, ambient emerald lighting,
 * glass cards describing the real digital infrastructure behind every visit.
 */
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TECHNOLOGY } from '../lib';
import { Item, Reveal, Stagger } from '../motion';
import { SectionHead } from '../ui';

export default function Technology({ m }) {
  return (
    <section
      id="technology"
      className="relative scroll-mt-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#060E22 0%,#0A1B3A 100%)' }}
      aria-label="Technology"
    >
      {/* ambient lighting + texture */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(closest-side,#10B981 0%,transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(closest-side,#3B82F6 0%,transparent 70%)' }}
      />
      <div aria-hidden="true" className="pmx-grid-dark absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHead
          tone="dark"
          eyebrow="Under the hood"
          title="Quietly powered by serious technology"
          sub="Everything digital about your visit — records, prescriptions, reminders, payments — runs on one secure, modern platform."
        />

        <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
          {TECHNOLOGY.map((t, i) => {
            const Icon = Icons[t.icon] || Icons.Cpu;
            return (
              <Item key={t.title}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/25 hover:bg-white/[0.07]">
                  {/* hover glow */}
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
                    style={{ background: 'radial-gradient(circle,#34D399 0%,transparent 70%)' }}
                  />
                  <span
                    className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 text-emerald-300 transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-300/50 group-hover:text-emerald-200"
                    style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.16),rgba(16,185,129,0.04))' }}
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="pmx-display relative mt-6 text-[17px] font-semibold tracking-[-0.01em] text-white">
                    {t.title}
                  </h3>
                  <p className="relative mt-2.5 text-[13.5px] leading-relaxed text-slate-400">{t.text}</p>
                </div>
              </Item>
            );
          })}
        </Stagger>

        <Reveal delay={0.15}>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-slate-400">Experience it on your very first visit.</p>
            <Link
              to={m.bookHref}
              className="group inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-7 py-3 text-sm font-semibold text-emerald-300 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:bg-emerald-400/15 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Book your first appointment
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
