import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Calendar,
  Star,
  Menu,
  X,
  Heart,
  Stethoscope,
  Baby,
  Activity,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

function iconFor(name) {
  const key = (name || '').toString().toLowerCase();
  if (key.includes('baby') || key.includes('child') || key.includes('pedia')) return Baby;
  if (key.includes('heart') || key.includes('cardio')) return Heart;
  if (key.includes('shield') || key.includes('vaccine') || key.includes('immun')) return ShieldCheck;
  if (key.includes('activity') || key.includes('check') || key.includes('vital')) return Activity;
  if (key.includes('clock') || key.includes('urgent') || key.includes('hour')) return Clock;
  if (key.includes('spark') || key.includes('well') || key.includes('care')) return Sparkles;
  return Stethoscope;
}

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Stars({ rating }) {
  const r = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-4 w-4"
          aria-hidden="true"
          fill={i <= r ? 'var(--site-primary)' : 'none'}
          style={{ color: i <= r ? 'var(--site-primary)' : '#d8d2c8' }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function WarmFamilyCare({ site, slug }) {
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

  const navLinks = [
    { href: '#about', label: 'About' },
    services.length ? { href: '#services', label: 'Services' } : null,
    doctors.length ? { href: '#doctors', label: 'Our Team' } : null,
    reviews.length ? { href: '#reviews', label: 'Families' } : null,
    { href: '#contact', label: 'Contact' },
  ].filter(Boolean);

  const bookBtnBase =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--site-primary)]/30';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fdfaf4] text-stone-700 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-amber-100/70 bg-[#fdfaf4]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-4 focus:ring-[var(--site-primary)]/30">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={`${clinicName} logo`}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-amber-100"
              />
            ) : (
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm"
                style={{ backgroundColor: 'var(--site-primary)' }}
                aria-hidden="true"
              >
                <Heart className="h-5 w-5" fill="currentColor" />
              </span>
            )}
            <span className="text-lg font-bold tracking-tight text-stone-800 sm:text-xl">
              {clinicName}
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-[var(--site-primary)]"
              >
                {l.label}
              </a>
            ))}
            {pages.map((p) => (
              <Link
                key={p.slug}
                to={`/c/${slug}/p/${p.slug}`}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-[var(--site-primary)]"
              >
                {p.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={`/c/${slug}/book`}
              className={`${bookBtnBase} hidden px-5 py-2.5 text-sm text-white sm:inline-flex`}
              style={{ backgroundColor: 'var(--site-primary)' }}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Book Appointment
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-100 bg-white text-stone-700 transition-colors hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-[var(--site-primary)]/30 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-amber-100/70 bg-[#fdfaf4] px-4 py-4 lg:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-medium text-stone-700 transition-colors hover:bg-amber-50"
                >
                  {l.label}
                </a>
              ))}
              {pages.map((p) => (
                <Link
                  key={p.slug}
                  to={`/c/${slug}/p/${p.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-medium text-stone-700 transition-colors hover:bg-amber-50"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, color-mix(in srgb, var(--site-primary) 10%, transparent), color-mix(in srgb, var(--site-accent) 12%, transparent))',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: 'var(--site-accent)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: 'var(--site-primary)' }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--site-primary) 14%, transparent)',
                color: 'var(--site-primary)',
              }}
            >
              <Heart className="h-4 w-4" fill="currentColor" aria-hidden="true" />
              Caring for your whole family
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-stone-800 sm:text-5xl md:text-6xl">
              {hero.headline || `Welcome to ${clinicName}`}
            </h1>
            {hero.tagline && (
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600 sm:text-xl">
                {hero.tagline}
              </p>
            )}

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={`/c/${slug}/book`}
                className={`${bookBtnBase} w-full px-8 py-4 text-lg text-white shadow-md sm:w-auto`}
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                <Calendar className="h-5 w-5" aria-hidden="true" />
                Book an Appointment
              </Link>
              {(contact.phone || clinic.phone) && (
                <a
                  href={`tel:${contact.phone || clinic.phone}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-8 py-4 text-lg font-semibold text-stone-700 transition-all duration-300 hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-[var(--site-primary)]/30 sm:w-auto"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Call Us
                </a>
              )}
            </div>

            {hero.imageUrl && (
              <div className="mx-auto mt-14 max-w-3xl">
                <img
                  src={hero.imageUrl}
                  alt={`${clinicName} welcoming space`}
                  className="w-full rounded-3xl object-cover shadow-xl ring-1 ring-amber-100"
                  style={{ maxHeight: '460px' }}
                />
              </div>
            )}
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
              A little about us
            </h2>
            <div
              className="mt-4 h-1.5 w-16 rounded-full"
              style={{ backgroundColor: 'var(--site-accent)' }}
              aria-hidden="true"
            />
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-stone-600">
              {content.about}
            </p>
          </div>
        </section>

        {/* Services */}
        {services.length > 0 && (
          <section id="services" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
                How we care for you
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-stone-500">
                Gentle, thorough care for every member of the family.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => {
                const Icon = iconFor(s.icon || s.name);
                return (
                  <div
                    key={`${s.name}-${i}`}
                    className="group rounded-3xl border border-amber-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span
                      className="inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--site-primary) 12%, transparent)',
                        color: 'var(--site-primary)',
                      }}
                      aria-hidden="true"
                    >
                      <Icon className="h-7 w-7" />
                    </span>
                    <h3 className="mt-5 text-xl font-bold text-stone-800">{s.name}</h3>
                    {s.description && (
                      <p className="mt-2 leading-relaxed text-stone-600">{s.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Doctors */}
        {doctors.length > 0 && (
          <section id="doctors" className="bg-[#f7f1e6] py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
                  Meet our friendly team
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-lg text-stone-500">
                  The caring faces you and your little ones will get to know.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col items-center rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span
                      className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-inner"
                      style={{ backgroundColor: 'var(--site-primary)' }}
                      aria-hidden="true"
                    >
                      {initialsOf(d.name)}
                    </span>
                    <h3 className="mt-5 text-xl font-bold text-stone-800">{d.name}</h3>
                    {d.specialization && (
                      <p
                        className="mt-1 text-sm font-semibold"
                        style={{ color: 'var(--site-primary)' }}
                      >
                        {d.specialization}
                      </p>
                    )}
                    {(d.consultationFee || d.consultationFee === 0) && d.consultationFee !== '' && (
                      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-stone-600">
                        <Stethoscope className="h-4 w-4" aria-hidden="true" />
                        Consultation: {d.consultationFee}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section id="gallery" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
                Our happy place
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-stone-500">
                A warm, welcoming space designed to put everyone at ease.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
              {gallery.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className={`overflow-hidden rounded-2xl shadow-sm ring-1 ring-amber-100 ${
                    i % 5 === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <img
                    src={src}
                    alt={`${clinicName} gallery ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ minHeight: '160px' }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section id="reviews" className="bg-[#f7f1e6] py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
                  Loved by our families
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-lg text-stone-500">
                  Real words from the people we care for.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r, i) => (
                  <figure
                    key={`${r.name}-${i}`}
                    className="flex flex-col rounded-3xl border border-amber-100 bg-white p-7 shadow-sm"
                  >
                    <Stars rating={r.rating} />
                    <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-stone-600">
                      &ldquo;{r.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: 'var(--site-accent)' }}
                        aria-hidden="true"
                      >
                        {initialsOf(r.name)}
                      </span>
                      <span className="font-semibold text-stone-800">{r.name}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
              Come say hello
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-stone-500">
              We would love to hear from you. Reach out anytime.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              {(contact.phone || clinic.phone) && (
                <a
                  href={`tel:${contact.phone || clinic.phone}`}
                  className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-colors hover:bg-amber-50"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--site-primary) 12%, transparent)',
                      color: 'var(--site-primary)',
                    }}
                    aria-hidden="true"
                  >
                    <Phone className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-stone-500">Phone</span>
                    <span className="font-semibold text-stone-800">{contact.phone || clinic.phone}</span>
                  </span>
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-colors hover:bg-amber-50"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--site-primary) 12%, transparent)',
                      color: 'var(--site-primary)',
                    }}
                    aria-hidden="true"
                  >
                    <Mail className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-stone-500">Email</span>
                    <span className="font-semibold text-stone-800">{contact.email}</span>
                  </span>
                </a>
              )}
              {contact.whatsapp && (
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition-colors hover:bg-amber-50"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--site-primary) 12%, transparent)',
                      color: 'var(--site-primary)',
                    }}
                    aria-hidden="true"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-stone-500">WhatsApp</span>
                    <span className="font-semibold text-stone-800">{contact.whatsapp}</span>
                  </span>
                </a>
              )}
              {(contact.address || clinic.address) && (
                <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--site-primary) 12%, transparent)',
                      color: 'var(--site-primary)',
                    }}
                    aria-hidden="true"
                  >
                    <MapPin className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-stone-500">Visit us</span>
                    <span className="font-semibold text-stone-800">{contact.address || clinic.address}</span>
                  </span>
                </div>
              )}

              <Link
                to={`/c/${slug}/book`}
                className={`${bookBtnBase} mt-2 px-8 py-4 text-lg text-white shadow-md`}
                style={{ backgroundColor: 'var(--site-primary)' }}
              >
                <Calendar className="h-5 w-5" aria-hidden="true" />
                Book an Appointment
              </Link>
            </div>

            {content.mapEmbed ? (
              <div className="overflow-hidden rounded-3xl border border-amber-100 shadow-sm">
                <iframe
                  title={`${clinicName} location map`}
                  src={content.mapEmbed}
                  className="h-full min-h-[340px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl p-10 text-center"
                style={{
                  background:
                    'linear-gradient(160deg, color-mix(in srgb, var(--site-primary) 12%, transparent), color-mix(in srgb, var(--site-accent) 14%, transparent))',
                }}
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                  aria-hidden="true"
                >
                  <Heart className="h-7 w-7" fill="currentColor" />
                </span>
                <p className="mt-5 max-w-xs text-lg font-medium text-stone-600">
                  We can&rsquo;t wait to welcome you and your family.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-100 bg-[#f7f1e6]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              {theme.logoUrl ? (
                <img
                  src={theme.logoUrl}
                  alt={`${clinicName} logo`}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-100"
                />
              ) : (
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: 'var(--site-primary)' }}
                  aria-hidden="true"
                >
                  <Heart className="h-5 w-5" fill="currentColor" />
                </span>
              )}
              <span className="text-lg font-bold text-stone-800">{clinicName}</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-stone-600 transition-colors hover:text-[var(--site-primary)]"
                >
                  {l.label}
                </a>
              ))}
              {pages.map((p) => (
                <Link
                  key={p.slug}
                  to={`/c/${slug}/p/${p.slug}`}
                  className="text-sm font-medium text-stone-600 transition-colors hover:text-[var(--site-primary)]"
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 border-t border-amber-200/60 pt-6 text-center text-sm text-stone-500">
            &copy; {new Date().getFullYear()} {clinicName}. Made with care for your family.
          </div>
        </div>
      </footer>

      {/* Floating mobile Book button */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-100 bg-[#fdfaf4]/95 p-3 backdrop-blur-md sm:hidden">
        <Link
          to={`/c/${slug}/book`}
          className={`${bookBtnBase} w-full px-6 py-3.5 text-base text-white shadow-lg`}
          style={{ backgroundColor: 'var(--site-primary)' }}
        >
          <Calendar className="h-5 w-5" aria-hidden="true" />
          Book Appointment
        </Link>
      </div>
      <div className="h-20 sm:hidden" aria-hidden="true" />
    </div>
  );
}