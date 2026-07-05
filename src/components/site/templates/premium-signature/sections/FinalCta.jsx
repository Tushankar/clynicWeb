/**
 * Final CTA — Rebuilt to replicate Maven Clinic's glow banner.
 * Warm cream background with a central soft green radial glow overlay,
 * elegant serif italics, and forest-green buttons.
 */
import { telHref } from '../lib';
import { Button } from '../ui';

export default function FinalCta({ m }) {
  return (
    <section id="contact" className="scroll-mt-28 bg-white py-16" aria-label="Book your visit">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-[2.5rem] bg-[#FAF8F5] px-6 py-20 text-center sm:px-16 sm:py-24 border border-slate-200/50 shadow-md"
        >
          {/* Centered Green Glow Ball */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #34D399 0%, transparent 70%)',
            }}
          />
          <div aria-hidden="true" className="pmx-grid absolute inset-0 opacity-[0.15]" />

          <div className="relative max-w-3xl mx-auto">
            <h2 className="pmx-display text-4xl sm:text-5xl lg:text-[4.5rem] font-light leading-none tracking-[-0.03em] text-[#0A1C14]">
              Bring your smile <br className="hidden sm:inline" />
              into <span className="font-serif italic text-[#005A36]">the future</span>
            </h2>
            
            <p className="mt-8 text-[#0A1C14]/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Connect with our clinical team and discover how modern dentistry can be comfortable, precise, and completely stress-free.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button to={m.bookHref} size="lg" className="px-8 bg-[#005A36] text-white hover:bg-[#004225] shadow-md border-transparent">
                Book online now
              </Button>
              {m.contact.phone ? (
                <Button href={telHref(m.contact.phone)} variant="outline" size="lg" className="px-8 border-[#0A1C14] text-[#0A1C14] hover:bg-[#0A1C14] hover:text-white">
                  Call our clinic
                </Button>
              ) : null}
            </div>
            
            <p className="mt-6 text-[12.5px] text-[#0A1C14]/50 font-medium">
              No account required · instant SMS slot confirmation · free rescheduling
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
