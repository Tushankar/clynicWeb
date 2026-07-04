/**
 * Trust strip — animated counters over a hairline, then an infinite monochrome marquee of
 * real platform capabilities (never fake partner logos).
 */
import * as Icons from 'lucide-react';
import { Star } from 'lucide-react';
import { buildStats, CAPABILITIES } from '../lib';
import { CountUp, Reveal, Stagger, Item } from '../motion';

export default function TrustBar({ m }) {
  const stats = buildStats(m);

  return (
    <section className="relative border-y border-slate-900/[0.06] bg-white/70" aria-label="Why patients trust us">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4" gap={0.08}>
          {stats.map((s) => (
            <Item key={s.label} className="relative pl-5">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1 h-[calc(100%-6px)] w-px bg-gradient-to-b from-emerald-500/60 via-slate-200 to-transparent"
              />
              <div className="pmx-display flex items-baseline text-4xl font-semibold tracking-[-0.02em] text-[#0B1220] sm:text-[2.75rem]">
                <CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix} />
                {s.star ? (
                  <Star className="ml-1.5 h-5 w-5 self-center text-amber-400" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                ) : null}
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-800">{s.label}</p>
              <p className="mt-0.5 text-[12.5px] text-slate-500">{s.sub}</p>
            </Item>
          ))}
        </Stagger>

        {/* capability marquee */}
        <Reveal delay={0.2}>
          <div className="relative mt-14 overflow-hidden" aria-label="Everything this clinic offers digitally">
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
            <div className="pmx-marquee flex w-max items-center gap-3">
              {[...CAPABILITIES, ...CAPABILITIES].map((c, i) => {
                const Icon = Icons[c.icon] || Icons.Check;
                return (
                  <span
                    key={i}
                    aria-hidden={i >= CAPABILITIES.length}
                    className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-5 py-2.5 text-[13px] font-medium text-slate-500"
                  >
                    <Icon className="h-4 w-4 text-emerald-600/80" strokeWidth={1.9} aria-hidden="true" />
                    {c.label}
                  </span>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
