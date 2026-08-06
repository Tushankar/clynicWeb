/**
 * Contact — the closing section the navbar's "Contact" link targets.
 *
 * Everything shown is the clinic's own CMS data: the About copy, phone, WhatsApp, email,
 * address and (optionally) the Google Maps embed. Each channel only appears when the owner
 * has filled it in, so a half-configured site still looks deliberate.
 */
import { Link } from 'react-router-dom';
import { CalendarPlus, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { telHref } from '../lib';
import { Reveal } from '../motion';

function Channel({ icon: Icon, label, value, href, external }) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#012F24]/5 text-[#012F24] transition-colors group-hover:bg-[#012F24] group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-[11px] font-bold uppercase tracking-widest text-[#012F24]/45">{label}</span>
        <span className="block truncate text-[14.5px] font-semibold text-[#012F24]">{value}</span>
      </span>
    </>
  );
  const cls =
    'group flex items-center gap-3.5 rounded-2xl border border-[#012F24]/10 bg-white/70 px-4 py-3.5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#012F24]/25 hover:shadow-md';
  if (!href) return <div className={cls}>{inner}</div>;
  return (
    <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {inner}
    </a>
  );
}

export default function FinalCta({ m }) {
  const { phone, whatsapp, email, address } = m.contact;
  const hasChannels = phone || whatsapp || email || address;

  return (
    <section id="contact" className="scroll-mt-28 bg-white py-16" aria-label="Contact us">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#FAF8F5] px-6 py-16 sm:px-16 sm:py-20 border border-slate-200/50 shadow-md">
          {/* Centered Green Glow Ball */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #58EDA2 0%, transparent 70%)' }}
          />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[0.15]">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 2163 1144" fill="none" className="w-full h-full object-cover">
              <path d="M1 418.74C301.79 465.754 922.869 648.755 1380.8 247.677C1953.22 -253.672 91.988 138.624 876.875 317.179C1661.76 495.733 2287.17 591.924 2139.19 478.51C1991.22 365.096 1845.32 229.162 618 1142" stroke="#86D2BC" strokeWidth="2" opacity="0.25"></path>
            </svg>
          </div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left: the invitation, in the clinic's own words */}
            <div className="text-center lg:text-left">
              <Reveal>
                <h2 className="pmx-display text-4xl sm:text-5xl lg:text-[3.75rem] font-light leading-[1.05] tracking-tight text-[#012F24] text-balance">
                  Your next visit to{' '}
                  <span className="font-serif italic">{m.name}</span>
                </h2>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="mt-7 text-[#012F24]/80 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 line-clamp-6">
                  {m.about ||
                    `Book online in under a minute, or reach out — the ${m.name} front desk is happy to help you find the right time.`}
                </p>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link
                    to={m.bookHref}
                    className="inline-flex items-center gap-2 rounded-full bg-[#012F24] px-8 py-4 text-[15px] font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#001f18]"
                  >
                    <CalendarPlus className="h-[18px] w-[18px]" aria-hidden="true" />
                    Book an appointment
                  </Link>
                  {phone ? (
                    <a
                      href={telHref(phone)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#012F24] px-8 py-4 text-[15px] font-semibold text-[#012F24] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#012F24] hover:text-white"
                    >
                      <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                      Call the clinic
                    </a>
                  ) : null}
                </div>
              </Reveal>
            </div>

            {/* Right: the real contact channels + map */}
            <div className="space-y-4">
              {hasChannels ? (
                <Reveal delay={0.12}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {phone ? <Channel icon={Phone} label="Phone" value={phone} href={telHref(phone)} /> : null}
                    {whatsapp ? <Channel icon={MessageCircle} label="WhatsApp" value="Chat with us" href={whatsapp} external /> : null}
                    {email ? <Channel icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
                    {address ? (
                      <Channel
                        icon={MapPin}
                        label="Visit us"
                        value={address}
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                        external
                      />
                    ) : null}
                  </div>
                </Reveal>
              ) : null}

              {m.mapEmbed ? (
                <Reveal delay={0.2}>
                  <div className="overflow-hidden rounded-3xl border border-[#012F24]/10 shadow-sm">
                    <iframe
                      title={`${m.name} location`}
                      src={m.mapEmbed}
                      className="h-[260px] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </Reveal>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
