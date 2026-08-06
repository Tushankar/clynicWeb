/**
 * Popular Doctors — the clinic's real, active doctor roster (site.doctors from the API).
 * Photo, specialisation, qualifications, experience and consultation fee all come from each
 * doctor's own profile; the card degrades gracefully when a profile is only partly filled in.
 * Renders nothing when the clinic has no active doctors, so the page never shows a stub.
 */
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Stethoscope, ChevronRight } from 'lucide-react';
import { fmtFee } from '../lib';
import { Item, Stagger } from '../motion';

const CARD_TINTS = [
  'rgba(11, 184, 159, 0.08)', // teal
  'rgba(1, 47, 36, 0.06)', // forest
  'rgba(10, 106, 86, 0.07)', // deep green
  'rgba(52, 211, 153, 0.10)', // mint
];

// Local illustration pool — a dignified stand-in only when a doctor has no uploaded photo.
const AVATAR_ART = ['/doctor_avatar_1.png', '/doctor_avatar_2.png', '/doctor_avatar_3.png', '/doctor_avatar_4.png'];

export default function WhyUs({ m }) {
  const TEAL = '#0E8C72';
  const TEAL_DARK = '#074C3D';

  const doctors = m.doctors.slice(0, 8);
  if (!doctors.length) return null;

  return (
    <section id="doctors" className="relative scroll-mt-28 bg-transparent pb-24 pt-0 mt-0 overflow-x-clip select-none" aria-label="Our doctors">

      {/* Ambient signature teal glow positioned at the top boundary to blend seamlessly with the Services section above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 z-10">

        {/* Header with Title and See All button */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="pmx-display text-3xl sm:text-[38px] font-extrabold leading-tight tracking-tight text-[#1A1A2E]">
              Our Doctors
            </h2>
            <p className="mt-1.5 text-slate-500 text-sm font-semibold">
              Meet the team at {m.name}.
            </p>
          </div>
          <Link
            to={m.bookHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 bg-white/40 backdrop-blur-md hover:bg-white transition-all hover:border-slate-300 shrink-0"
          >
            See All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Doctors Grid */}
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" gap={0.1}>
          {doctors.map((doc, i) => {
            const fee = fmtFee(doc.consultationFee);
            return (
              <Item key={doc.id}>
                {/* Liquid Glass Doctor Card */}
                <div className="bg-white/40 backdrop-blur-md rounded-[24px] p-4 border border-white/50 shadow-[0_12px_40px_-8px_rgba(14,140,114,0.1),inset_0_1px_0_0_rgba(255,255,255,0.6)] hover:shadow-[0_20px_48px_-10px_rgba(14,140,114,0.2),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">

                  {/* Portrait — the doctor's own photo when uploaded, else a monogram tile */}
                  <div
                    className="relative rounded-xl h-[220px] overflow-hidden flex items-center justify-center mb-3.5 transition-transform group-hover:scale-[1.01]"
                    style={{ backgroundColor: CARD_TINTS[i % CARD_TINTS.length] }}
                  >
                    {doc.photoUrl ? (
                      <img
                        src={doc.photoUrl}
                        alt={doc.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <img
                        src={AVATAR_ART[i % AVATAR_ART.length]}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top scale-[1.35] origin-top select-none pointer-events-none transition-transform duration-500 group-hover:scale-[1.42]"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}

                    {/* Consultation fee — real, transparent pricing straight from the doctor record */}
                    {fee ? (
                      <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-extrabold text-[#0E8C72] border border-white/50 shadow-sm">
                        {fee}
                      </span>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col px-0.5">
                    <h3 className="text-lg font-bold text-[#1A1A2E] leading-tight line-clamp-1" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-[12.5px] text-slate-500 font-semibold mt-1 line-clamp-1">
                      {doc.specialization}
                    </p>
                    {doc.qualifications ? (
                      <p className="text-[11.5px] text-slate-400 font-semibold mt-0.5 line-clamp-1">{doc.qualifications}</p>
                    ) : null}

                    {/* Rating + Experience row */}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mt-3.5 mb-5">
                      {m.reviews.length ? (
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0 mr-1" />
                          <span>{m.rating} ({m.reviews.length})</span>
                        </div>
                      ) : null}
                      {doc.experienceYears > 0 ? (
                        <div className="flex items-center">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#0E8C72] shrink-0 mr-1" />
                          <span>{doc.experienceYears} Yrs Exp</span>
                        </div>
                      ) : null}
                      {!m.reviews.length && !doc.experienceYears ? (
                        <div className="flex items-center">
                          <Stethoscope className="h-3.5 w-3.5 text-[#0E8C72] shrink-0 mr-1" />
                          <span>Accepting patients</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Premium Liquid Glass Book Button — deep-links to this doctor in the booking flow */}
                    <Link
                      to={`${m.bookHref}?doctorId=${encodeURIComponent(doc.id)}`}
                      className="group/btn relative block w-full text-center py-3 rounded-full text-[13.5px] font-bold text-white transition-all duration-200 active:scale-[0.98] overflow-hidden mt-auto shadow-[0_6px_16px_-4px_rgba(14,140,114,0.45)] hover:shadow-[0_10px_20px_-6px_rgba(14,140,114,0.55)]"
                      style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL_DARK}`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`; }}
                      aria-label={`Book an appointment with ${doc.name}`}
                    >
                      {/* Glassmorphic sheen on hover */}
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />
                      <span className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] rounded-full pointer-events-none" />
                      <span className="relative z-10">Book</span>
                    </Link>
                  </div>
                </div>
              </Item>
            );
          })}
        </Stagger>

      </div>
    </section>
  );
}
