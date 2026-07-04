/**
 * Why choose us — editorial split. A layered photo collage (large + overlapping small +
 * floating satisfaction chip) on the left; the clinic's real "about" narrative and a
 * six-feature checklist on the right. Doubles as the #about anchor.
 */
import { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { HeartHandshake } from 'lucide-react';
import { IMG, WHY_FEATURES } from '../lib';
import { Item, Reveal, Stagger } from '../motion';
import { ArrowLink, Blob, Eyebrow, SafeImg } from '../ui';

export default function WhyUs({ m }) {
  // Always the curated editorial consult pair — people-first imagery that stays distinct
  // from the clinic's own gallery (which fills the hero + masonry).
  const [big, small] = useMemo(() => [IMG.whyBig, IMG.whySmall], []);

  return (
    <section id="about" className="relative scroll-mt-28 overflow-hidden" aria-label="About the clinic">
      <Blob className="-left-56 top-24" from="rgba(16,185,129,0.10)" size={640} />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:gap-20">
        {/* -------- photo collage -------- */}
        <Reveal className="relative mx-auto w-full max-w-[560px]">
          <div className="relative">
            <SafeImg
              src={big}
              alt={`Inside ${m.name}`}
              className="aspect-[4/3.4] w-full rounded-[2rem] object-cover shadow-[0_32px_72px_-24px_rgba(10,27,58,0.3)]"
            />
            {/* overlapping small image */}
            <div className="absolute -bottom-10 -right-3 w-[46%] rotate-2 rounded-[1.5rem] border-[5px] border-white shadow-[0_24px_56px_-20px_rgba(10,27,58,0.35)] transition-transform duration-500 hover:rotate-0 sm:-right-8">
              <SafeImg src={small} alt="" className="aspect-[4/3] w-full rounded-[1.2rem] object-cover" />
            </div>
            {/* floating satisfaction chip */}
            <div
              className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl py-3 pl-3 pr-5 sm:-left-8"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.7)',
                boxShadow: '0 20px 44px -16px rgba(10,27,58,0.28)',
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white">
                <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="pmx-display block text-lg font-semibold text-[#0B1220]">98%</span>
                <span className="block text-[11.5px] font-medium text-slate-500">patients recommend us</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* -------- narrative + features -------- */}
        <div className="pt-6 lg:pt-0">
          <Reveal>
            <Eyebrow>Why {m.name}</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="pmx-display mt-4 text-balance text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-[#0B1220] sm:text-[2.6rem]">
              Healthcare that feels considered, not processed
            </h2>
          </Reveal>
          {m.about ? (
            <Reveal delay={0.16}>
              <p className="mt-5 whitespace-pre-line text-pretty text-base leading-relaxed text-slate-600 sm:text-[17px]">
                {m.about}
              </p>
            </Reveal>
          ) : null}

          <Stagger className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2" gap={0.07}>
            {WHY_FEATURES.map((f) => {
              const Icon = Icons[f.icon] || Icons.Check;
              return (
                <Item key={f.title} className="group flex items-start gap-3.5">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-emerald-400 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-600/25"
                    aria-hidden="true"
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-[#0B1220]">{f.title}</span>
                    <span className="mt-1 block text-[13.5px] leading-relaxed text-slate-500">{f.text}</span>
                  </span>
                </Item>
              );
            })}
          </Stagger>

          {m.doctors.length ? (
            <Reveal delay={0.1}>
              <div className="mt-10">
                <ArrowLink href="#doctors">Meet the doctors behind it</ArrowLink>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
