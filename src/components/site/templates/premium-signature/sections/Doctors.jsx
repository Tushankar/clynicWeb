/**
 * Doctors — Clean editorial profile cards matching the Maven Clinic design language.
 * Solid white background cards, clean green accent lines, and forest green buttons.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarPlus } from 'lucide-react';
import { cx, firstName, fmtFee } from '../lib';
import { Item, Stagger } from '../motion';
import { SectionHead, Stars } from '../ui';

export default function Doctors({ m }) {
  if (!m.doctors.length) return null;
  const few = m.doctors.length < 3;

  return (
    <section id="doctors" className="scroll-mt-28 bg-[#FAF8F5] py-24 sm:py-32" aria-label="Our doctors">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="The team"
          title="Doctors who take the time"
          sub="Specialists chosen as much for how they listen as for what they know."
        />

        <Stagger
          className={cx(
            'mt-16 grid gap-8',
            few ? 'mx-auto max-w-3xl sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
          )}
          gap={0.1}
        >
          {m.doctors.map((d, i) => (
            <Item key={d.id || i}>
              <article
                className="group relative flex h-full flex-col overflow-hidden rounded-[2.25rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg hover:border-emerald-500/25"
              >
                {/* Doctor Avatar Header (Profile photo aligned left with text on right) */}
                <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
                  <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-[3px] border-[#012F24]/10 shadow-xs">
                    {d.photoUrl ? (
                      <img
                        src={d.photoUrl}
                        alt={d.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xl uppercase">
                        {d.name.slice(0, 2)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-xs">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="pmx-display text-xl font-semibold leading-tight text-[#012F24] group-hover:text-[#012F24] transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-[12.5px] font-semibold text-emerald-700 mt-1 uppercase tracking-wider">
                      {d.specialization}
                    </p>
                    {d.qualifications ? (
                      <p className="text-[11.5px] text-slate-400 mt-0.5 font-medium">
                        {d.qualifications}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="flex flex-1 flex-col pt-6 justify-between">
                  <div>
                    {d.bio ? (
                      <p className="text-[13.5px] leading-relaxed text-slate-500 line-clamp-3">
                        {d.bio}
                      </p>
                    ) : null}

                    {d.services?.length ? (
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {d.services.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-slate-100 border border-slate-200/40 px-3 py-1 text-[11px] font-semibold text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    {/* Rating & Fee Row */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5 text-[13px]">
                      <span className="flex items-center gap-1.5">
                        <Stars rating={m.rating} size="h-3.5 w-3.5" />
                        <span className="font-bold text-[#012F24]">{m.rating.toFixed(1)}</span>
                      </span>
                      
                      {fmtFee(d.consultationFee) ? (
                        <span className="text-slate-500 font-medium">
                          <span className="font-bold text-[#012F24]">{fmtFee(d.consultationFee)}</span> consultation
                        </span>
                      ) : null}
                    </div>

                    {/* Book Button */}
                    <Link
                      to={m.bookHref}
                      className="group/cta mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#012F24] hover:bg-[#001f18] px-6 py-3.5 text-[13.5px] font-semibold text-white transition-all duration-300 shadow-sm"
                    >
                      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                      Book with {firstName(d.name)}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
