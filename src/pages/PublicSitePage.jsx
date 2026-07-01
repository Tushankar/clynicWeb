import { useParams, Navigate, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Star, CalendarPlus } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { usePublicSite } from '@/hooks/useWebsite';

/**
 * Public clinic website (§5.19) — rendered from the owner's structured content. If the
 * clinic has no published site (or lacks the Premium feature), we fall back to the plain
 * booking page. Mobile-first, theme-token styling (no template look).
 */
export default function PublicSitePage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = usePublicSite(slug);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  // No published site → send visitors straight to booking (still fully functional).
  if (isError || !data?.available) return <Navigate to={`/c/${slug}`} replace />;

  const { clinic, doctors = [], content } = data;
  const c = content || {};
  const bookHref = `/c/${slug}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card/90 px-4 py-3 backdrop-blur sm:px-8">
        <div className="flex items-center gap-2 font-semibold">
          {clinic.logoUrl ? <img src={clinic.logoUrl} alt="" className="h-8 w-auto rounded object-contain" /> : <Logo className="h-8" />}
          {clinic.name}
        </div>
        <Link to={bookHref} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          <CalendarPlus className="h-4 w-4" /> Book
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-8 sm:py-16">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{c.headline || `Welcome to ${clinic.name}`}</h1>
        {c.about && <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">{c.about}</p>}
        <Link to={bookHref} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90">
          <CalendarPlus className="h-5 w-5" /> Book an appointment
        </Link>
      </section>

      <main className="mx-auto max-w-4xl space-y-14 px-4 pb-20 sm:px-8">
        {/* Doctors */}
        {doctors.length > 0 && (
          <Section title="Our doctors">
            <div className="grid gap-4 sm:grid-cols-2">
              {doctors.map((d, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-muted-foreground">{d.specialization || 'General'}</div>
                  {d.consultationFee > 0 && <div className="mt-1 text-sm text-muted-foreground">Consultation ₹{d.consultationFee}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Services */}
        {c.services?.length > 0 && (
          <Section title="Services">
            <div className="grid gap-4 sm:grid-cols-2">
              {c.services.map((s, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="font-medium">{s.name}</div>
                  {s.description && <div className="mt-1 text-sm text-muted-foreground">{s.description}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Gallery */}
        {c.gallery?.length > 0 && (
          <Section title="Gallery">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {c.gallery.map((url, i) => (
                <img key={i} src={url} alt="" loading="lazy" className="aspect-square w-full rounded-lg border object-cover" />
              ))}
            </div>
          </Section>
        )}

        {/* Reviews */}
        {c.reviews?.length > 0 && (
          <Section title="What patients say">
            <div className="grid gap-4 sm:grid-cols-2">
              {c.reviews.map((r, i) => (
                <figure key={i} className="rounded-lg border p-4">
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`h-4 w-4 ${s < r.rating ? 'fill-current' : 'opacity-30'}`} />)}
                  </div>
                  <blockquote className="mt-2 text-sm">{r.text}</blockquote>
                  <figcaption className="mt-2 text-caption text-muted-foreground">— {r.author || 'Patient'}</figcaption>
                </figure>
              ))}
            </div>
          </Section>
        )}

        {/* Contact + map */}
        <Section title="Visit us">
          <div className="grid gap-4 sm:grid-cols-2">
            <ul className="space-y-2 text-sm">
              {clinic.address && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {clinic.address}</li>}
              {c.hours && <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> {c.hours}</li>}
              {(c.contact?.phone || clinic.phone) && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {c.contact?.phone || clinic.phone}</li>}
              {c.contact?.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {c.contact.email}</li>}
            </ul>
            {/^https:\/\//i.test(c.contact?.mapUrl || '') && (
              <div className="overflow-hidden rounded-lg border">
                <iframe title="map" src={c.contact.mapUrl} className="h-56 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups" />
              </div>
            )}
          </div>
        </Section>
      </main>

      <footer className="border-t py-6 text-center text-caption text-muted-foreground">
        {clinic.name} · <Link to={bookHref} className="text-primary hover:underline">Book online</Link> · Powered by Clinic OS
      </footer>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
