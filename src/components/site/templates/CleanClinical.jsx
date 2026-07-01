import { Link } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Mail,
  MessageCircle,
  Star,
  Menu,
  X,
  Calendar,
  Stethoscope,
  Heart,
  Activity,
  ShieldCheck,
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';

function ServiceIcon({ name, className }) {
  const map = {
    stethoscope: Stethoscope,
    heart: Heart,
    activity: Activity,
    shield: ShieldCheck,
    shieldcheck: ShieldCheck,
    clock: Clock,
    calendar: Calendar,
  };
  const key = (name || '').toString().trim().toLowerCase();
  const Cmp = map[key] || Stethoscope;
  return <Cmp className={className} aria-hidden="true" />;
}

function Stars({ rating }) {
  const r = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-4 w-4"
          aria-hidden="true"
          style={{
            color: i <= r ? 'var(--site-primary)' : 'transparent',
            stroke: i <= r ? 'var(--site-primary)' : '#cbd5e1',
          }}
          fill={i <= r ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

export default function CleanClinical({ site, slug }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const clinic = site.clinic || {};
  const theme = site.theme || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const contact = content.contact || {};
  const services = content.services || [];
  const gallery = content.gallery || [];
  const doctors = site.doctors || [];
  const reviews = site.reviews || [];
  const pages = site.pages || [];

  const clinicName = clinic.name || 'Our Clinic';
  const bookHref = `/c/${slug}/book`;
  const primaryPhone = contact.phone || clinic.phone || '';

  const navLinks = [
    { label: 'About', href: '#about' },
    ...(services.length ? [{ label: 'Services', href: '#services' }] : []),
    ...(doctors.length ? [{ label: 'Doctors', href: '#doctors' }] : []),
    ...(gallery.length ? [{ label: 'Gallery', href: '#gallery' }] : []),
    ...(reviews.length ? [{ label: 'Reviews', href: '#reviews' }] : []),
    { label: 'Contact', href: '#contact' },
  ];

  const eyebrow =
    'inline-block text-xs font-semibold uppercase tracking-[0.18em] mb-3';

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5 min-w-0">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={`${clinicName} logo`}
                className="h-9 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                  aria-hidden="true"
                >
                  <Stethoscope className="h-5 w-5" />
                </span>
                <span className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  {clinicName}
                </span>
              </span>
            )}
          </a>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Primary"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {l.label}
              </a>
            ))}
            {pages.map((p) => (
              <Link
                key={p.slug}
                to={`/c/${slug}/p/${p.slug}`}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {p.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Call</span>
              </a>
            ) : null}
            <Link
              to={bookHref}
              className="hidden items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:inline-flex"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Book Appointment
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-100 bg-white lg:hidden">
            <nav
              className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6"
              aria-label="Mobile"
            >
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {l.label}
                  <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </a>
              ))}
              {pages.map((p) => (
                <Link
                  key={p.slug}
                  to={`/c/${slug}/p/${p.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {p.title}
                  <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="border-b border-slate-100 bg-slate-50/60">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
            <div>
              <span className={eyebrow} style={{ color: 'var(--site-primary)' }}>
                Trusted Care
              </span>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                {hero.headline || clinicName}
              </h1>
              {hero.tagline ? (
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
                  {hero.tagline}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={bookHref}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Book Appointment
                </Link>
                {primaryPhone ? (
                  <a
                    href={`tel:${primaryPhone}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Call {primaryPhone}
                  </a>
                ) : null}
              </div>
            </div>

            <div className="relative">
              {hero.imageUrl ? (
                <img
                  src={hero.imageUrl}
                  alt={`${clinicName} clinic`}
                  className="aspect-[4/3] w-full rounded-2xl border border-slate-100 object-cover shadow-sm"
                />
              ) : (
                <div
                  className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-slate-100 shadow-sm"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, var(--site-primary), var(--site-accent))',
                  }}
                  aria-hidden="true"
                >
                  <Stethoscope className="h-20 w-20 text-white/85" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-20">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <span className={eyebrow} style={{ color: 'var(--site-primary)' }}>
              About Us
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome to {clinicName}
            </h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-slate-600">
              {content.about}
            </p>
          </div>
        </section>

        {/* Services */}
        {services.length ? (
          <section id="services" className="scroll-mt-20 border-y border-slate-100 bg-slate-50/60">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <span className={eyebrow} style={{ color: 'var(--site-primary)' }}>
                  What We Offer
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Our Services
                </h2>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((s, i) => (
                  <div
                    key={i}
                    className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--site-primary) 12%, white)',
                        color: 'var(--site-primary)',
                      }}
                    >
                      <ServiceIcon name={s.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">
                      {s.name}
                    </h3>
                    {s.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {s.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Doctors */}
        {doctors.length ? (
          <section id="doctors" className="scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <span className={eyebrow} style={{ color: 'var(--site-primary)' }}>
                  Meet The Team
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Our Doctors
                </h2>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white"
                      style={{
                        backgroundImage:
                          'linear-gradient(135deg, var(--site-primary), var(--site-accent))',
                      }}
                      aria-hidden="true"
                    >
                      {(d.name || 'D').trim().charAt(0).toUpperCase()}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      {d.name}
                    </h3>
                    {d.specialization ? (
                      <p
                        className="mt-1 text-sm font-medium"
                        style={{ color: 'var(--site-primary)' }}
                      >
                        {d.specialization}
                      </p>
                    ) : null}
                    {d.consultationFee ? (
                      <p className="mt-2 text-sm text-slate-500">
                        Consultation: {d.consultationFee}
                      </p>
                    ) : null}
                    <Link
                      to={bookHref}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                      style={{ color: 'var(--site-primary)' }}
                    >
                      Book with {(d.name || 'doctor').split(' ')[0]}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Gallery */}
        {gallery.length ? (
          <section id="gallery" className="scroll-mt-20 border-y border-slate-100 bg-slate-50/60">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <span className={eyebrow} style={{ color: 'var(--site-primary)' }}>
                  Take A Look
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Gallery
                </h2>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {gallery.map((src, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-slate-100 bg-white"
                  >
                    <img
                      src={src}
                      alt={`${clinicName} gallery image ${i + 1}`}
                      className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Reviews */}
        {reviews.length ? (
          <section id="reviews" className="scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <span className={eyebrow} style={{ color: 'var(--site-primary)' }}>
                  Patient Stories
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  What Our Patients Say
                </h2>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r, i) => (
                  <figure
                    key={i}
                    className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <Stars rating={r.rating} />
                    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                      &ldquo;{r.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                      {r.name}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Contact */}
        <section id="contact" className="scroll-mt-20 border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <span className={eyebrow} style={{ color: 'var(--site-primary)' }}>
                  Get In Touch
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Contact Us
                </h2>
                <p className="mt-4 text-slate-600">
                  We&rsquo;re here to help. Reach out or book your visit online.
                </p>

                <ul className="mt-8 space-y-4">
                  {primaryPhone ? (
                    <li>
                      <a
                        href={`tel:${primaryPhone}`}
                        className="flex items-start gap-3 text-slate-700 transition-colors hover:text-slate-900"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor:
                              'color-mix(in srgb, var(--site-primary) 12%, white)',
                            color: 'var(--site-primary)',
                          }}
                        >
                          <Phone className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="pt-2 text-sm font-medium">{primaryPhone}</span>
                      </a>
                    </li>
                  ) : null}
                  {contact.email ? (
                    <li>
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-start gap-3 text-slate-700 transition-colors hover:text-slate-900"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor:
                              'color-mix(in srgb, var(--site-primary) 12%, white)',
                            color: 'var(--site-primary)',
                          }}
                        >
                          <Mail className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="break-all pt-2 text-sm font-medium">
                          {contact.email}
                        </span>
                      </a>
                    </li>
                  ) : null}
                  {contact.whatsapp ? (
                    <li>
                      <a
                        href={`https://wa.me/${(contact.whatsapp || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 text-slate-700 transition-colors hover:text-slate-900"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor:
                              'color-mix(in srgb, var(--site-primary) 12%, white)',
                            color: 'var(--site-primary)',
                          }}
                        >
                          <MessageCircle className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="pt-2 text-sm font-medium">
                          WhatsApp: {contact.whatsapp}
                        </span>
                      </a>
                    </li>
                  ) : null}
                  {contact.address || clinic.address ? (
                    <li className="flex items-start gap-3 text-slate-700">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor:
                            'color-mix(in srgb, var(--site-primary) 12%, white)',
                          color: 'var(--site-primary)',
                        }}
                      >
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="pt-2 text-sm font-medium">
                        {contact.address || clinic.address}
                      </span>
                    </li>
                  ) : null}
                </ul>

                <Link
                  to={bookHref}
                  className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Book Appointment
                </Link>
              </div>

              <div>
                {content.mapEmbed ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <iframe
                      title={`Map showing ${clinicName}`}
                      src={content.mapEmbed}
                      className="h-full min-h-[320px] w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : (
                  <div
                    className="flex min-h-[320px] w-full items-center justify-center rounded-2xl border border-slate-100 shadow-sm"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, color-mix(in srgb, var(--site-primary) 10%, white), color-mix(in srgb, var(--site-accent) 14%, white))',
                    }}
                    aria-hidden="true"
                  >
                    <MapPin
                      className="h-14 w-14"
                      style={{ color: 'var(--site-primary)' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2.5">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={`${clinicName} logo`}
                className="h-7 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: 'var(--site-primary)' }}
                aria-hidden="true"
              >
                <Stethoscope className="h-4 w-4" />
              </span>
            )}
            <span className="text-sm font-semibold text-slate-900">
              {clinicName}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {clinicName}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating mobile Book button */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 p-3 backdrop-blur sm:hidden">
        <Link
          to={bookHref}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Book Appointment
        </Link>
      </div>
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  );
}