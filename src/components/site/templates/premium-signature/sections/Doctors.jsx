/**
 * Doctors — premium profile cards. A navy-mesh banner with a dignified glass monogram
 * (no fake stock faces on real names), availability badge, specialty, rating + fee row,
 * and a full-width book action that lifts with the card.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarPlus } from 'lucide-react';
import { GRADIENTS, cx, firstName, fmtFee, initials } from '../lib';
import { Item, Stagger } from '../motion';
import { SectionHead, Stars } from '../ui';

export default function Doctors({ m }) {
  if (!m.doctors.length) return null;
  const few = m.doctors.length < 3;

  return (
    <section id="doctors" className="scroll-mt-28" aria-label="Our doctors">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHead
          eyebrow="The team"
          title="Doctors who take the time"
          sub="Specialists chosen as much for how they listen as for what they know."
        />

        <Stagger
          className={cx(
            'mt-16 grid gap-6',
            few ? 'mx-auto max-w-3xl sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
          )}
          gap={0.1}
        >
          {m.doctors.map((d, i) => (
            <Item key={d.id || i}>
              <article
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(10,27,58,0.04),0_8px_24px_-12px_rgba(10,27,58,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-500/25 hover:shadow-[0_2px_6px_rgba(10,27,58,0.05),0_28px_56px_-16px_rgba(10,27,58,0.18)]"
              >
                {/* banner */}
                <div
                  className="relative h-44 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#0A1B3A 0%,#102B5C 55%,#0E3A4A 100%)' }}
                >
                  {/* ambient orbs + plus pattern */}
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-14 h-44 w-44 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
                    style={{ background: 'radial-gradient(circle,#10B981 0%,transparent 65%)' }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                    style={{ background: 'radial-gradient(circle,#3B82F6 0%,transparent 65%)' }}
                  />
                  <div aria-hidden="true" className="pmx-plus absolute inset-0 opacity-[0.16]" />

                  {/* experience / availability badge (experience is real; falls back gracefully) */}
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                    {d.experienceYears > 0 ? (
                      <>
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                        {d.experienceYears}+ yrs experience
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                        Available today
                      </>
                    )}
                  </span>

                  {/* portrait — real photo when provided, dignified monogram otherwise */}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center">
                    <span className="relative -mb-10 block h-24 w-24 transition-transform duration-500 group-hover:scale-[1.04]">
                      {d.photoUrl ? (
                        <img
                          src={d.photoUrl}
                          alt={d.name}
                          className="h-24 w-24 rounded-full border-[5px] border-white object-cover shadow-[0_16px_36px_-10px_rgba(10,27,58,0.45)]"
                        />
                      ) : (
                        <span
                          className="pmx-display flex h-24 w-24 items-center justify-center rounded-full border-[5px] border-white text-[26px] font-semibold text-white shadow-[0_16px_36px_-10px_rgba(10,27,58,0.45)]"
                          style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                          aria-hidden="true"
                        >
                          {initials(d.name)}
                        </span>
                      )}
                      <span className="absolute -bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
                        <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      </span>
                    </span>
                  </div>
                </div>

                {/* body */}
                <div className="flex flex-1 flex-col px-7 pb-7 pt-14 text-center">
                  <h3 className="pmx-display text-[19px] font-semibold tracking-[-0.01em] text-[#0B1220]">{d.name}</h3>
                  {d.qualifications ? <p className="mt-0.5 text-[12.5px] font-medium text-slate-400">{d.qualifications}</p> : null}
                  <p className="mt-1 text-sm font-medium text-emerald-700">{d.specialization}</p>

                  {d.bio ? <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{d.bio}</p> : null}

                  {d.services?.length ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {d.services.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11.5px] font-medium text-slate-600">{s}</span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex items-center justify-center gap-5 border-y border-slate-100 py-3.5">
                    <span className="flex items-center gap-1.5">
                      <Stars rating={m.rating} size="h-3.5 w-3.5" />
                      <span className="text-[13px] font-semibold text-[#0B1220]">{m.rating.toFixed(1)}</span>
                    </span>
                    {fmtFee(d.consultationFee) ? (
                      <>
                        <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
                        <span className="text-[13px] text-slate-500">
                          <span className="font-semibold text-[#0B1220]">{fmtFee(d.consultationFee)}</span> consultation
                        </span>
                      </>
                    ) : null}
                  </div>

                  {d.languages?.length ? (
                    <p className="mt-3 text-[12px] text-slate-400">Speaks {d.languages.slice(0, 4).join(', ')}</p>
                  ) : null}

                  <Link
                    to={m.bookHref}
                    className="group/cta mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A1B3A] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_16px_36px_-12px_rgba(5,150,105,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                    Book with {firstName(d.name)}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
