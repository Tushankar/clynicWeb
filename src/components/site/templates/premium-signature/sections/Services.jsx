/**
 * Services — editorial grid of fully-clickable treatment cards: photography, an
 * overlapping gradient icon tile, and a sliding "book" affordance. Subtle 3D tilt.
 */
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Baby,
  Bone,
  Brain,
  Ear,
  Eye,
  Heart,
  HeartPulse,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { IMG, cx } from '../lib';
import { Item, Stagger, Tilt } from '../motion';
import { ArrowLink, IconTile, SectionHead } from '../ui';

/** Resolve an icon from the CMS icon string, else infer from the service name. */
function serviceIcon(s) {
  const byKey = {
    stethoscope: Stethoscope,
    heart: Heart,
    heartpulse: HeartPulse,
    activity: Activity,
    shield: ShieldCheck,
    shieldcheck: ShieldCheck,
    smile: Smile,
    tooth: Smile,
    eye: Eye,
    brain: Brain,
    bone: Bone,
    baby: Baby,
    ear: Ear,
    syringe: Syringe,
    sparkles: Sparkles,
  };
  const key = (s.icon || '').toString().trim().toLowerCase();
  if (byKey[key]) return byKey[key];
  const n = (s.name || '').toLowerCase();
  if (/dent|tooth|smile|align|implant|root/.test(n)) return Smile;
  if (/heart|cardio/.test(n)) return HeartPulse;
  if (/eye|vision|retina/.test(n)) return Eye;
  if (/brain|neuro|mental/.test(n)) return Brain;
  if (/bone|ortho|joint|spine/.test(n)) return Bone;
  if (/child|paed|pedia/.test(n)) return Baby;
  if (/ent|ear|throat|nose/.test(n)) return Ear;
  if (/vaccin|immun/.test(n)) return Syringe;
  if (/skin|derma|cosmet|aesthet/.test(n)) return Sparkles;
  return Stethoscope;
}

export default function Services({ m }) {
  if (!m.services.length) return null;
  const services = m.services.slice(0, 6);

  return (
    <section id="services" className="scroll-mt-28" aria-label="Services">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            align="left"
            eyebrow="What we do"
            title="Care, considered end to end"
            sub="Every treatment is delivered with modern equipment, transparent pricing and time to actually talk."
          />
          <ArrowLink to={m.bookHref} className="mb-1 shrink-0">
            Book a consultation
          </ArrowLink>
        </div>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
          {services.map((s, i) => {
            const Icon = serviceIcon(s);
            return (
              <Item key={s.name + i}>
                <Tilt max={2.5} className="h-full">
                  <Link
                    to={m.bookHref}
                    aria-label={`${s.name} — book a consultation`}
                    className={cx(
                      'group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white',
                      'shadow-[0_1px_2px_rgba(10,27,58,0.04),0_8px_24px_-12px_rgba(10,27,58,0.08)]',
                      'transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-500/25 hover:shadow-[0_2px_6px_rgba(10,27,58,0.05),0_28px_56px_-16px_rgba(10,27,58,0.18),0_0_0_1px_rgba(16,185,129,0.08)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
                    )}
                  >
                    {/* photography */}
                    <div className="relative overflow-hidden">
                      <div className="aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={IMG.servicePool[i % IMG.servicePool.length]}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        />
                      </div>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#0A1B3A]/35 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
                      />
                      <IconTile
                        icon={Icon}
                        i={i}
                        size="lg"
                        className="absolute -bottom-7 left-7 ring-4 ring-white transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                      />
                    </div>

                    {/* body */}
                    <div className="flex flex-1 flex-col px-7 pb-7 pt-11">
                      <h3 className="pmx-display text-[19px] font-semibold tracking-[-0.01em] text-[#0B1220]">
                        {s.name}
                      </h3>
                      {s.description ? (
                        <p className="mt-2.5 line-clamp-3 text-[14.5px] leading-relaxed text-slate-600">
                          {s.description}
                        </p>
                      ) : null}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-emerald-700">
                        <span className="relative">
                          Book this treatment
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-emerald-600 transition-transform duration-300 group-hover:scale-x-100"
                          />
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </Tilt>
              </Item>
            );
          })}
        </Stagger>

        {m.services.length > 6 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            + {m.services.length - 6} more services — <Link to={m.bookHref} className="font-semibold text-emerald-700 hover:text-emerald-600">see everything while booking</Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
