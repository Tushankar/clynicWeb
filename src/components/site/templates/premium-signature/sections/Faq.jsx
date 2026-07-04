/**
 * FAQ — editorial two-column layout: sticky intro + contact card on the left, a smooth
 * height-animated accordion on the right. First item open by default.
 */
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Phone, Plus } from 'lucide-react';
import { buildFaqs, cx, telHref } from '../lib';
import { EASE, Item, Reveal, Stagger } from '../motion';
import { Eyebrow } from '../ui';

function FaqItem({ faq, open, onToggle, id }) {
  const reduced = useReducedMotion();
  return (
    <div
      className={cx(
        'overflow-hidden rounded-3xl border bg-white transition-all duration-300',
        open
          ? 'border-emerald-500/25 shadow-[0_2px_6px_rgba(10,27,58,0.04),0_20px_44px_-18px_rgba(10,27,58,0.16)]'
          : 'border-slate-200/70 shadow-[0_1px_2px_rgba(10,27,58,0.03)] hover:border-slate-300'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        className="flex w-full items-center justify-between gap-5 px-7 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-3xl"
      >
        <span className="pmx-display text-[16.5px] font-semibold tracking-[-0.01em] text-[#0B1220]">{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={cx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
            open ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'
          )}
          aria-hidden="true"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-7 pb-7 text-[14.5px] leading-relaxed text-slate-600">{faq.a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Faq({ m }) {
  const faqs = buildFaqs(m);
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-28 border-t border-slate-900/[0.06] bg-white/60" aria-label="Frequently asked questions">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-10">
        {/* intro + contact card */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <Eyebrow>FAQ</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="pmx-display mt-4 text-balance text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-[#0B1220] sm:text-[2.6rem]">
                Questions, answered honestly
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Everything most patients ask before their first visit. Anything else — we are one call away.
              </p>
            </Reveal>

            {m.contact.phone || m.contact.whatsapp ? (
              <Reveal delay={0.24}>
                <div
                  className="mt-9 rounded-3xl border border-slate-200/70 bg-white p-7"
                  style={{ boxShadow: '0 2px 6px rgba(10,27,58,0.04), 0 20px 44px -20px rgba(10,27,58,0.14)' }}
                >
                  <p className="pmx-display text-[16.5px] font-semibold text-[#0B1220]">Still curious?</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">
                    The front desk picks up fast — really.
                  </p>
                  <div className="mt-5 flex flex-col gap-2.5">
                    {m.contact.phone ? (
                      <a
                        href={telHref(m.contact.phone)}
                        className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-semibold text-[#0B1220] transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md"
                      >
                        <Phone className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        {m.contact.phone}
                      </a>
                    ) : null}
                    {m.contact.whatsapp ? (
                      <a
                        href={m.contact.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-600/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-100/70 hover:shadow-md"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        Chat on WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>

        {/* accordion */}
        <Stagger className="space-y-4 lg:col-span-8" gap={0.06}>
          {faqs.map((f, i) => (
            <Item key={i}>
              <FaqItem faq={f} id={`pmx-faq-${i}`} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
