/**
 * Footer — luxury enterprise: deep-navy canvas, brand + newsletter row, four link
 * columns (with the clinic's real services and pages), embedded mini-map, legal bar.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { telHref } from '../lib';
import { Reveal } from '../motion';
import { BrandMark } from '../ui';

function Col({ title, children }) {
  return (
    <div>
      <h3 className="pmx-display text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      <ul className="mt-5 space-y-3.5">{children}</ul>
    </div>
  );
}

function FootLink({ href, to, children, external }) {
  const cls =
    'group inline-flex items-center gap-1.5 text-[14px] text-slate-400 transition-colors duration-300 hover:text-white';
  const arrow = (
    <ArrowRight
      className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      aria-hidden="true"
    />
  );
  if (to)
    return (
      <li>
        <Link to={to} className={cls}>
          {children}
          {arrow}
        </Link>
      </li>
    );
  return (
    <li>
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
        {arrow}
      </a>
    </li>
  );
}

/** `basePath` (e.g. /c/:slug) routes section anchors back to the site page — see Navbar. */
export default function Footer({ m, basePath = '' }) {
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();
  // Section anchor → prop set for FootLink: same-page <a> on the site, router Link elsewhere.
  const anchor = (hash) => (basePath ? { to: `${basePath}${hash}` } : { href: hash });

  return (
    <footer className="relative overflow-hidden" style={{ background: '#060E22' }} aria-label="Footer">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-px w-[90%] -translate-x-1/2"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-48 left-1/2 h-[380px] w-[720px] -translate-x-1/2 rounded-full opacity-[0.13] blur-3xl"
        style={{ background: 'radial-gradient(closest-side,#10B981 0%,transparent 70%)' }}
      />

      <div
        className="relative mx-auto max-w-7xl px-5 pt-20 sm:px-8"
        style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* brand + newsletter */}
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-10 border-b border-white/[0.07] pb-14 lg:flex-row lg:items-center">
            <div className="max-w-sm">
              <BrandMark logoUrl={m.theme.logoUrl} name={m.name} tone="dark" />
              <p className="mt-5 text-[14px] leading-relaxed text-slate-400">
                {m.hero.tagline}
              </p>
            </div>
            <div className="w-full max-w-md">
              <p className="pmx-display text-[15px] font-semibold text-white">Health tips &amp; clinic updates</p>
              <p className="mt-1.5 text-[13px] text-slate-400">Occasional, useful and easy to unsubscribe from.</p>
              {subscribed ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-3.5 text-sm font-medium text-emerald-300">
                  <Send className="h-4 w-4" aria-hidden="true" /> Thank you — you&rsquo;re on the list.
                </p>
              ) : (
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                  }}
                >
                  <label htmlFor="pmx-newsletter" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="pmx-newsletter"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur transition-colors focus:border-emerald-400/50 focus:bg-white/[0.08]"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(16,185,129,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>

        {/* columns */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Col title="Explore">
            <FootLink {...anchor('#about')}>About us</FootLink>
            {m.services.length ? <FootLink {...anchor('#services')}>Services</FootLink> : null}
            {m.doctors.length ? <FootLink {...anchor('#doctors')}>Doctors</FootLink> : null}
            {m.reviews.length ? <FootLink {...anchor('#stories')}>Patient stories</FootLink> : null}
            {m.gallery.length ? <FootLink {...anchor('#gallery')}>Gallery</FootLink> : null}
            <FootLink {...anchor('#faq')}>FAQ</FootLink>
          </Col>

          <Col title="Services">
            {(m.services.length ? m.services : [{ name: 'General consultation' }]).slice(0, 6).map((s) => (
              <FootLink key={s.name} {...anchor('#services')}>
                {s.name}
              </FootLink>
            ))}
          </Col>

          <Col title="For patients">
            <FootLink to={m.bookHref}>Book an appointment</FootLink>
            <FootLink to={m.portalHref}>Patient portal</FootLink>
            {(m.pages || []).map((p) => (
              <FootLink key={p.slug} to={`/c/${m.clinic.slug}/p/${p.slug}`}>
                {p.title}
              </FootLink>
            ))}
            <FootLink {...anchor('#technology')}>Our technology</FootLink>
          </Col>

          <div>
            <h3 className="pmx-display text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">Visit us</h3>
            <ul className="mt-5 space-y-4">
              {m.contact.address ? (
                <li className="flex items-start gap-3 text-[14px] leading-relaxed text-slate-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  {m.contact.address}
                </li>
              ) : null}
              {m.contact.phone ? (
                <li>
                  <a href={telHref(m.contact.phone)} className="flex items-center gap-3 text-[14px] text-slate-400 transition-colors hover:text-white">
                    <Phone className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    {m.contact.phone}
                  </a>
                </li>
              ) : null}
              {m.contact.email ? (
                <li>
                  <a href={`mailto:${m.contact.email}`} className="flex items-center gap-3 break-all text-[14px] text-slate-400 transition-colors hover:text-white">
                    <Mail className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    {m.contact.email}
                  </a>
                </li>
              ) : null}
              {m.contact.whatsapp ? (
                <li>
                  <a href={m.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[14px] text-slate-400 transition-colors hover:text-white">
                    <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    WhatsApp us
                  </a>
                </li>
              ) : null}
            </ul>
            {m.mapEmbed ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 opacity-90 transition-opacity hover:opacity-100">
                <iframe
                  title={`Map to ${m.name}`}
                  src={m.mapEmbed}
                  className="h-36 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* legal bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-[12.5px] text-slate-500">
            © {year} {m.name}. All rights reserved.
          </p>
          <p className="text-[12.5px] text-slate-600">
            Crafted with care · Powered by{' '}
            <span className="font-semibold text-slate-400">Clynic</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
