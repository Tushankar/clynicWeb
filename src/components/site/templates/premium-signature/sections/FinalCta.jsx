/**
 * Final CTA — a floating gradient banner: deep navy mesh with emerald lighting, huge
 * display heading and the three ways to reach the clinic.
 */
import { CalendarCheck2, MessageCircle, Phone } from 'lucide-react';
import { telHref } from '../lib';
import { FloatY, Reveal } from '../motion';
import { Button } from '../ui';

export default function FinalCta({ m }) {
  return (
    <section id="contact" className="scroll-mt-28" aria-label="Book your visit">
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-8 sm:px-8 sm:pb-36">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center sm:px-16 sm:py-24"
            style={{
              background: 'linear-gradient(130deg,#060E22 0%,#0A1B3A 45%,#0C2B47 80%,#065F46 130%)',
              boxShadow: '0 48px 96px -32px rgba(6,14,34,0.55)',
            }}
          >
            {/* lighting + texture */}
            <div
              aria-hidden="true"
              className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-35 blur-3xl"
              style={{ background: 'radial-gradient(closest-side,#10B981 0%,transparent 70%)' }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-44 -left-24 h-[380px] w-[380px] rounded-full opacity-25 blur-3xl"
              style={{ background: 'radial-gradient(closest-side,#3B82F6 0%,transparent 70%)' }}
            />
            <div aria-hidden="true" className="pmx-grid-dark absolute inset-0 opacity-30" />

            {/* floating accents */}
            <FloatY distance={12} duration={7} className="pointer-events-none absolute left-10 top-12 hidden lg:block" aria-hidden="true">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                <CalendarCheck2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              </span>
            </FloatY>
            <FloatY distance={10} duration={6} delay={0.8} className="pointer-events-none absolute bottom-14 right-12 hidden lg:block" aria-hidden="true">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur">
                <MessageCircle className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              </span>
            </FloatY>

            <div className="relative">
              <span className="pmx-display inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Same-day slots available
              </span>
              <h2 className="pmx-display mx-auto mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-white sm:text-[3.4rem]">
                Begin your care journey today
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
                Book online in under a minute — or just call. Either way, {m.name} will take it from there.
              </p>

              <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
                <Button to={m.bookHref} icon={CalendarCheck2} variant="light" size="lg">
                  Book appointment
                </Button>
                {m.contact.phone ? (
                  <Button href={telHref(m.contact.phone)} icon={Phone} variant="ghostDark" size="lg">
                    Call now
                  </Button>
                ) : null}
                {m.contact.whatsapp ? (
                  <Button
                    href={m.contact.whatsapp}
                    icon={MessageCircle}
                    variant="ghostDark"
                    size="lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </Button>
                ) : null}
              </div>
              <p className="mt-7 text-[12.5px] text-slate-400">No account needed · instant confirmation · free rescheduling</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
