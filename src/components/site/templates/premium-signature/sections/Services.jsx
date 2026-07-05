/**
 * Services — Maven Clinic style deep-green section.
 * Row 1: 4 tall treatment cards overlapping/positioned under the hero.
 * Section break: Centered subheadline.
 * Row 2: 3 horizontal cards (NEW badges) for explorative care plans.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IMG, cx } from '../lib';
import { Item, Stagger } from '../motion';

export default function Services({ m }) {
  // We want to guarantee 4 cards in Row 1, and 3 cards in Row 2.
  // We will map over the existing services, and pad/fallback to mock services to preserve the design.
  const row1Services = [
    {
      name: m.services[0]?.name || 'Root Canal Treatment',
      description: m.services[0]?.description || 'Painless, single-sitting RCT with modern rotary tools.',
      img: IMG.servicePool[0]
    },
    {
      name: m.services[1]?.name || 'Dental Implants',
      description: m.services[1]?.description || 'Titanium implants that look, feel, and function like natural teeth.',
      img: IMG.servicePool[1]
    },
    {
      name: m.services[2]?.name || 'Clear Aligners',
      description: m.services[2]?.description || 'Discreet orthodontic alignment for a perfect, metal-free smile.',
      img: IMG.servicePool[2]
    },
    {
      name: m.services[3]?.name || 'Teeth Whitening',
      description: m.services[3]?.description || 'Advanced laser whitening for immediate, multiple-shade brightness.',
      img: IMG.servicePool[3]
    }
  ];

  const row2Services = [
    {
      name: 'Explore Hygiene & Cleanings',
      description: 'Ultrasonic scaling, polishing, and active decay screening plans.',
      img: IMG.servicePool[4 % IMG.servicePool.length],
      badge: 'NEW'
    },
    {
      name: 'Explore Pediatric Care',
      description: 'Gentle, fear-free treatments and fluorides tailored for children.',
      img: IMG.servicePool[5 % IMG.servicePool.length],
      badge: 'NEW'
    },
    {
      name: 'Explore Emergency Dental Care',
      description: 'Immediate relief, trauma care, and same-day walk-in slots.',
      img: IMG.servicePool[6 % IMG.servicePool.length],
      badge: 'NEW'
    }
  ];

  return (
    <section id="services" className="scroll-mt-28 bg-[#0A1C14] pb-32 -mt-24 relative z-10" aria-label="Services">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* ── Row 1 Grid: 4 Tall Overlapping Cards ── */}
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
          {row1Services.map((s, i) => (
            <Item key={s.name + i}>
              <Link
                to={m.bookHref}
                aria-label={`${s.name} — book a consultation`}
                className={cx(
                  'group relative flex w-full h-[480px] flex-col overflow-hidden rounded-[1.75rem] shadow-xl border border-white/5 bg-emerald-950/20',
                  'transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1C14]'
                )}
              >
                {/* Background Image with Zoom Effect */}
                <img
                  src={s.img}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent"></div>

                {/* Content Container */}
                <div className="relative flex h-full flex-col justify-between p-6 text-white">
                  {/* Top Section: Certified Treatment Pill */}
                  <div className="flex h-12 items-start">
                    <span className="inline-flex h-6 items-center rounded-full px-3 text-[11px] font-semibold text-white bg-gradient-to-r from-[#060E22] to-[#0A1C14] border border-white/10 shadow-sm">
                      Certified treatment
                    </span>
                  </div>

                  {/* Middle Section: Title & Description (slides up on hover) */}
                  <div className="space-y-3 transition-transform duration-500 ease-in-out group-hover:-translate-y-16 mt-auto">
                    <h3 className="pmx-display text-2xl font-semibold leading-tight text-white tracking-[-0.01em]">
                      {s.name}
                    </h3>
                    <p className="text-[13.5px] text-emerald-100/70 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Bottom Section: Button (revealed on hover) */}
                  <div className="absolute -bottom-20 left-0 w-full p-6 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100">
                    <div className="flex items-end justify-between">
                      <div></div>
                      <button className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-[#005A36] text-white font-medium hover:bg-[#004225] transition-colors shadow-md">
                        Book appointment <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>

        {/* ── Divider Text: Maven Style Centered Subtitle ── */}
        <div className="mt-28 mb-16 text-center">
          <h2 className="pmx-display text-2xl sm:text-3xl lg:text-[40px] font-light leading-snug tracking-[-0.02em] text-white max-w-4xl mx-auto">
            Direct access to pain-free treatments, digital diagnostics, and 24/7 emergency support
          </h2>
        </div>

        {/* ── Row 2 Grid: 3 Shorter Cards with "NEW" Badge ── */}
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
          {row2Services.map((s, i) => (
            <Item key={s.name + i}>
              <Link
                to={m.bookHref}
                aria-label={`${s.name} — view details`}
                className={cx(
                  'group relative flex w-full h-[320px] flex-col overflow-hidden rounded-[1.75rem] shadow-lg border border-white/5 bg-emerald-950/20',
                  'transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2'
                )}
              >
                {/* Background Image with Zoom */}
                <img
                  src={s.img}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

                {/* Content Container */}
                <div className="relative flex h-full flex-col justify-between p-6 text-white">
                  {/* Top Section: "NEW" Badge */}
                  <div className="flex h-12 items-start">
                    <span className="inline-flex h-6 items-center rounded-full px-3 text-[11px] font-bold text-white bg-emerald-700 tracking-wider">
                      ● {s.badge}
                    </span>
                  </div>

                  {/* Middle Section: Title & Description (slides up on hover) */}
                  <div className="space-y-2 transition-transform duration-500 ease-in-out group-hover:-translate-y-16 mt-auto">
                    <h3 className="pmx-display text-2xl font-semibold leading-tight text-white tracking-[-0.01em]">
                      {s.name}
                    </h3>
                    <p className="text-[13px] text-emerald-100/60 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Bottom Section: Button (revealed on hover) */}
                  <div className="absolute -bottom-20 left-0 w-full p-6 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100">
                    <div className="flex items-end justify-between">
                      <div></div>
                      <button className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-[#005A36] text-white font-medium hover:bg-[#004225] transition-colors shadow-md">
                        Book appointment <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
        
      </div>
    </section>
  );
}
