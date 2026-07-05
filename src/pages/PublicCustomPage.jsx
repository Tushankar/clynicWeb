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

    return (
      <div style={{ '--site-primary': site.theme.primaryColor, '--site-accent': site.theme.accentColor }} className="pmx min-h-screen overflow-x-clip bg-[#012F24] text-[#0B1220] antialiased flex flex-col">
        <PmxStyles />
        
        {/* Pass the basePath parameter so anchors route back to the home route */}
        <Navbar m={m} basePath={`/c/${slug}`} />

        {/* Ambient Top Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-radial from-emerald-500/20 to-transparent blur-3xl" />
        </div>

        {/* Branded Header Section */}
        <header className="relative pt-36 pb-12 sm:pt-44 sm:pb-16 text-center select-none z-10">
          <div className="mx-auto max-w-4xl px-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6">
              {site.clinic.name} — Solutions
            </span>
            <h1 className="pmx-display text-4xl sm:text-5xl lg:text-[56px] font-light leading-[1.18] tracking-[-0.03em] text-white">
              {page.title}
            </h1>
          </div>
        </header>

        {/* Editorial Body container with signature porcelain background */}
        <section className="relative bg-[#FAF8F5] py-16 sm:py-24 z-10 flex-grow">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-[2.5rem] bg-white p-8 sm:p-14 shadow-2xl border border-slate-200/50 text-[#012F24]">
              <div className="space-y-6">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-slate-700 text-base sm:text-lg leading-relaxed font-light font-sans whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer m={m} />
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
