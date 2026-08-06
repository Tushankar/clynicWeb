/**
 * Member stories — the clinic's own approved patient reviews (CMS → Reviews tab).
 * Only reviews the owner has ticked "Approved" reach the public site; the API filters them,
 * so anything arriving here is publishable. Renders nothing when there are none, rather than
 * inventing testimonials.
 */
import { Testimonial } from '@/components/ui/testimonial-card';
import { Item, Stagger } from '../motion';

export default function Testimonials({ m }) {
  const reviews = (m.reviews || []).slice(0, 6);
  if (!reviews.length) return null;

  return (
    <section id="stories" className="relative scroll-mt-28 bg-transparent pb-24 pt-0 mt-0 overflow-x-clip select-none" aria-label="Patient stories">

      {/* Ambient signature teal glow positioned at the top boundary to blend seamlessly with the section above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] lg:w-[1100px] lg:h-[1100px] rounded-full bg-[#0BB89F]/15 blur-[80px] sm:blur-[120px] lg:blur-[160px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 z-10">

        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0BB89F]/10 border border-[#0BB89F]/20 text-[#0E8C72] text-xs font-bold uppercase tracking-wider mb-3">
            Patient Stories
          </span>
          <h2 className="pmx-display text-3xl sm:text-[38px] font-extrabold leading-tight tracking-tight text-[#1A1A2E] text-balance">
            Real stories from {m.name} patients
          </h2>
          <p className="mt-3 text-slate-500 text-sm font-semibold">
            {m.rating} out of 5 · {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Testimonials Grid */}
        <Stagger className="grid gap-6 grid-cols-1 md:grid-cols-3" gap={0.08}>
          {reviews.map((r, i) => (
            <Item key={`${r.name}-${i}`} className="h-full">
              <Testimonial
                name={r.name || 'Patient'}
                role="Verified patient"
                rating={Math.round(Number(r.rating) || 5)}
                testimonial={r.text}
                className="h-full"
              />
            </Item>
          ))}
        </Stagger>

      </div>
    </section>
  );
}
