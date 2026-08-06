import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { useSite } from '@/hooks/useSite';

// Premium template imports
import { deriveModel } from '../components/site/templates/premium-signature/lib';
import Navbar from '../components/site/templates/premium-signature/sections/Navbar';
import Footer from '../components/site/templates/premium-signature/sections/Footer';
import MobileBar from '../components/site/templates/premium-signature/sections/MobileBar';
import { PmxStyles } from '../components/site/templates/premium-signature/styles';

/**
 * Public custom page (Premium CMS_ADVANCED), route /c/:slug/p/:pageSlug. Renders one published
 * custom page's body in a branded shell that inherits the clinic's theme color.
 */
export default function PublicCustomPage() {
  const { slug, pageSlug } = useParams();
  const { data, isLoading, isError } = useSite(slug);
  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] text-slate-400">Loading…</div>;
  const site = data?.available ? data.site : null;
  if (isError || !site) return <Navigate to={`/c/${slug}`} replace />;
  const page = (site.pages || []).find((p) => p.slug === pageSlug);
  if (!page) return <Navigate to={`/c/${slug}`} replace />;

  const templateId = site.template || 'premium-signature';

  if (templateId === 'premium-signature') {
    // Flagship luxury design
    const m = deriveModel(site, slug);
    const paragraphs = page.body.split('\n\n');

    // `relative` on the root matters: the ambient glow is absolutely positioned and would
    // otherwise anchor to the viewport and bleed over the whole page.
    return (
      <div style={{ '--site-primary': site.theme.primaryColor, '--site-accent': site.theme.accentColor }} className="pmx relative min-h-screen overflow-x-clip bg-[#012F24] text-[#0B1220] antialiased flex flex-col">
        <PmxStyles />

        {/* basePath so in-page anchors route back to the home route; tone="dark" because this
            page opens on the forest header — without it the nav links are grey on dark green. */}
        <Navbar m={m} basePath={`/c/${slug}`} tone="dark" />

        {/* Ambient glow behind the dark header only */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px] overflow-hidden opacity-40">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-[120px]" />
        </div>

        {/* Branded Header Section */}
        <header className="relative pt-32 pb-14 sm:pt-40 sm:pb-20 text-center select-none z-10">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              to={`/c/${slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" /> {site.clinic.name}
            </Link>
            <h1 className="pmx-display text-balance text-4xl sm:text-5xl lg:text-[56px] font-light leading-[1.18] tracking-[-0.03em] text-white">
              {page.title}
            </h1>
          </div>
        </header>

        {/* Editorial Body container with signature porcelain background */}
        <section className="relative bg-[#FAF8F5] py-16 sm:py-24 z-10 flex-grow">
          <div className="mx-auto max-w-3xl px-6">
            <article className="rounded-[2.5rem] bg-white p-8 sm:p-14 shadow-xl border border-slate-200/60">
              <div className="space-y-6">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-[#3A4D44] text-base sm:text-[17px] leading-[1.75] whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </article>

            {/* Always leave a way forward — a custom page must never be a dead end. */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/c/${slug}/book`}
                className="inline-flex items-center gap-2 rounded-full bg-[#012F24] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#001f18]"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Book an appointment
              </Link>
              <Link
                to={`/c/${slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#012F24]/25 px-7 py-3.5 text-sm font-semibold text-[#012F24] transition-all hover:-translate-y-0.5 hover:bg-[#012F24] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to {site.clinic.name}
              </Link>
            </div>
          </div>
        </section>

        <Footer m={m} basePath={`/c/${slug}`} />
        <MobileBar m={m} />
      </div>
    );
  }

  // Original fallback layout for basic templates
  return (
    <div style={{ '--site-primary': site.theme.primaryColor }} className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-8">
        <Link to={`/c/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> {site.clinic.name}
        </Link>
        <Link to={`/c/${slug}/book`} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: 'var(--site-primary)' }}>
          <CalendarPlus className="h-4 w-4" /> Book
        </Link>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900">{page.title}</h1>
        <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">{page.body}</div>
      </article>
    </div>
  );
}
