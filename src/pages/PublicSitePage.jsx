import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useSite } from '@/hooks/useSite';
import { getTemplate } from '@/components/site/registry';

/** Upsert a <meta> tag (name or property) and return a cleanup-friendly setter. */
function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Public clinic website (§8.6), route /c/:slug. Resolves the slug → one clinic's published site
 * and renders its chosen template. Theme colors are exposed as CSS vars (--site-primary/-accent)
 * so every template themes itself from the clinic's palette. Graceful fallback if unavailable.
 */
export default function PublicSitePage() {
  const { slug: slugParam } = useParams();
  // At the platform root ("/") there is no :slug — serve the flagship clinic's site.
  const slug = slugParam || import.meta.env.VITE_MAIN_SITE_SLUG || 'clynic';
  const { data, isLoading, isError } = useSite(slug);
  const site = data?.available ? data.site : null;

  // SEO: title, description and social cards from the clinic's CMS config.
  useEffect(() => {
    if (!site) return undefined;
    if (site.seo?.title) document.title = site.seo.title;
    setMeta('name', 'description', site.seo?.description);
    setMeta('property', 'og:title', site.seo?.title || site.clinic?.name);
    setMeta('property', 'og:description', site.seo?.description);
    setMeta('property', 'og:type', 'website');
    if (site.content?.hero?.imageUrl) setMeta('property', 'og:image', site.content.hero.imageUrl);
    return () => {
      document.title = 'Clynic';
    };
  }, [site]);

  if (isLoading) {
    // Premium splash — the real brand wordmark, pulsing on porcelain. No layout flash.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8FAFC]">
        <Logo className="h-10 animate-pulse" />
        <span className="text-sm font-medium tracking-wide text-slate-400">Preparing your visit…</span>
      </div>
    );
  }
  if (isError || !site) {
    // Site missing or unpublished — booking still works, so offer it.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8FAFC] px-6 text-center">
        <Logo className="h-10" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">This clinic page isn’t available</h1>
        <p className="max-w-md text-slate-500">The website may be unpublished, but you can still request an appointment.</p>
        <Link
          to={`/c/${slug}/book`}
          className="inline-flex items-center gap-2 rounded-full bg-[#0A1B3A] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <CalendarPlus className="h-5 w-5" /> Book an appointment
        </Link>
      </div>
    );
  }

  // Defense-in-depth: strip any empty/invalid image URLs so no template can render a broken <img>
  // (the API already filters, but templates shouldn't depend on upstream).
  const ok = (u) => typeof u === 'string' && /^https?:\/\//i.test(u.trim());
  const safe = {
    ...site,
    theme: { ...site.theme, logoUrl: ok(site.theme.logoUrl) ? site.theme.logoUrl : '' },
    content: {
      ...site.content,
      hero: { ...site.content.hero, imageUrl: ok(site.content.hero.imageUrl) ? site.content.hero.imageUrl : '' },
      gallery: (site.content.gallery || []).filter(ok),
    },
  };
  const Template = getTemplate(site.template);
  return (
    <div style={{ '--site-primary': site.theme.primaryColor, '--site-accent': site.theme.accentColor }}>
      <Template site={safe} slug={slug} />
    </div>
  );
}
