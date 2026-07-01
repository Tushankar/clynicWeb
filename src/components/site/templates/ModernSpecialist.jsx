import { Link } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Mail,
  MessageCircle,
  Menu,
  X,
  Star,
  ArrowUpRight,
  ArrowRight,
  Stethoscope,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

function Star5({ rating }) {
  const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-4 w-4"
          style={{
            color: i <= r ? 'var(--site-primary)' : 'rgba(148,163,184,0.4)',
            fill: i <= r ? 'var(--site-primary)' : 'transparent',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ModernSpecialist({ site, slug }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const clinic = site?.clinic || {};
  const theme = site?.theme || {};
  const content = site?.content || {};
  const hero = content.hero || {};
  const contact = content.contact || {};
  const services = Array.isArray(content.services) ? content.services : [];
  const gallery = Array.isArray(content.gallery) ? content.gallery : [];
  const doctors = Array.isArray(site?.doctors) ? site.doctors : [];
  const reviews = Array.isArray(site?.reviews) ? site.reviews : [];
  const pages = Array.isArray(site?.pages) ? site.pages : [];
  const mapEmbed = content.mapEmbed || '';

  const name = clinic.name || 'Clinic';
  const bookPath = `/c/${slug}/book`;

  const navItems = [
    services.length > 0 && { label: 'Services', href: '#services' },
    doctors.length > 0 && { label: 'Specialists', href: '#doctors' },
    gallery.length > 0 && { label: 'Gallery', href: '#gallery' },
    reviews.length > 0 && { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-sans text-slate-900 antialiased">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={`${name} logo`}
                className="h-9 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {name}
              </span>
            )}
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-wide text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
              >
                {item.label}
              </a>
            ))}
            {pages.map((page) => (
              <Link
                key={page.slug}
                to={`/c/${slug}/p/${page.slug}`}
                className="text-sm font-medium tracking-wide text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
              >
                {page.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to={bookPath}
              className="hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              Book Appointment
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8" aria-label="Mobile">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  to={`/c/${slug}/p/${page.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {page.title}
                </Link>
              ))}
              <Link
                to={bookPath}
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                Book Appointment
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden bg-slate-950 text-white">
        {hero.imageUrl ? (
          <>
            <img
              src={hero.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-slate-950/40" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, var(--site-primary), transparent 55%), radial-gradient(circle at 85% 80%, var(--site-accent), transparent 55%), #020617',
            }}
          />
        )}

        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 pb-20 pt-36 sm:px-8 sm:pt-40">
          <span
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--site-primary)' }} />
            Specialist Care
          </span>

          <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {hero.headline || name}
          </h1>

          {hero.tagline && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              {hero.tagline}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to={bookPath}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              Book Appointment
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            {(contact.phone || clinic.phone) && (
              <a
                href={`tel:${contact.phone || clinic.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contact.phone || clinic.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <span
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--site-primary)' }}
              >
                About
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Precision. Experience. Trust.
              </h2>
            </div>
            <div className="lg:col-span-8">
              <p className="whitespace-pre-line text-lg leading-relaxed text-slate-600">
                {content.about}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section id="services" className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-2xl">
              <span
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--site-primary)' }}
              >
                Services
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Comprehensive specialist treatments
              </h2>
            </div>

            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => (
                <div
                  key={`${service.name}-${i}`}
                  className="group flex flex-col bg-white p-8 transition-colors hover:bg-slate-950"
                >
                  <span
                    className="text-sm font-bold tabular-nums transition-colors group-hover:text-white"
                    style={{ color: 'var(--site-primary)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-white">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 transition-colors group-hover:text-slate-300">
                      {service.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {doctors.length > 0 && (
        <section id="doctors" className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-2xl">
              <span
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--site-primary)' }}
              >
                Specialists
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Meet the team
              </h2>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex flex-col rounded-2xl border border-slate-200 p-8 transition-shadow hover:shadow-xl"
                >
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--site-accent)', color: '#fff' }}
                  >
                    <Stethoscope className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-900">
                    {doctor.name}
                  </h3>
                  {doctor.specialization && (
                    <p className="mt-1 text-sm font-medium" style={{ color: 'var(--site-primary)' }}>
                      {doctor.specialization}
                    </p>
                  )}
                  {(doctor.consultationFee || doctor.consultationFee === 0) && doctor.consultationFee !== '' && (
                    <p className="mt-4 text-sm text-slate-500">
                      Consultation:{' '}
                      <span className="font-semibold text-slate-900">
                        {doctor.consultationFee}
                      </span>
                    </p>
                  )}
                  <Link
                    to={bookPath}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80 focus:outline-none focus-visible:underline"
                    style={{ color: 'var(--site-primary)' }}
                  >
                    Book with {doctor.name.split(' ')[0]}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-2xl">
              <span
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--site-primary)' }}
              >
                Gallery
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Inside our practice
              </h2>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-200"
                >
                  <img
                    src={src}
                    alt={`${name} gallery image ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section id="reviews" className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-2xl">
              <span
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--site-primary)' }}
              >
                Reviews
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                What patients say
              </h2>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review, i) => (
                <figure
                  key={`${review.name}-${i}`}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8"
                >
                  <Star5 rating={review.rating} />
                  <blockquote className="mt-5 flex-1 text-base leading-relaxed text-slate-200">
                    “{review.text}”
                  </blockquote>
                  <figcaption className="mt-6 text-sm font-semibold text-white">
                    {review.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'var(--site-primary)' }}
              >
                Contact
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Get in touch
              </h2>

              <dl className="mt-10 space-y-6">
                {(contact.phone || clinic.phone) && (
                  <div className="flex items-start gap-4">
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--site-primary)', color: '#fff' }}
                    >
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</dt>
                      <dd>
                        <a
                          href={`tel:${contact.phone || clinic.phone}`}
                          className="text-lg font-medium text-slate-900 transition-colors hover:opacity-70"
                        >
                          {contact.phone || clinic.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {contact.email && (
                  <div className="flex items-start gap-4">
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--site-primary)', color: '#fff' }}
                    >
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-lg font-medium text-slate-900 transition-colors hover:opacity-70"
                        >
                          {contact.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {contact.whatsapp && (
                  <div className="flex items-start gap-4">
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--site-primary)', color: '#fff' }}
                    >
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">WhatsApp</dt>
                      <dd>
                        <a
                          href={`https://wa.me/${String(contact.whatsapp).replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-slate-900 transition-colors hover:opacity-70"
                        >
                          {contact.whatsapp}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {(contact.address || clinic.address) && (
                  <div className="flex items-start gap-4">
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--site-primary)', color: '#fff' }}
                    >
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Address</dt>
                      <dd className="text-lg font-medium text-slate-900">
                        {contact.address || clinic.address}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              <Link
                to={bookPath}
                className="mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                Book Appointment
                <Calendar className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>

            {mapEmbed ? (
              <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                <iframe
                  title={`Map to ${name}`}
                  src={mapEmbed}
                  className="h-full min-h-[360px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-400">
                <MapPin className="h-10 w-10" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              {theme.logoUrl ? (
                <img
                  src={theme.logoUrl}
                  alt={`${name} logo`}
                  className="h-9 w-auto max-w-[160px] object-contain"
                />
              ) : (
                <span className="text-xl font-bold tracking-tight text-white">{name}</span>
              )}
              {(contact.address || clinic.address) && (
                <p className="mt-3 max-w-xs text-sm leading-relaxed">
                  {contact.address || clinic.address}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  to={`/c/${slug}/p/${page.slug}`}
                  className="text-sm font-medium transition-colors hover:text-white"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-500">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating mobile Book button */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md sm:hidden">
        <Link
          to={bookPath}
          className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          Book Appointment
          <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}