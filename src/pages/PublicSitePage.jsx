import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { useSite } from '@/hooks/useSite';
import { getTemplate } from '@/components/site/registry';

/**
 * Public clinic website (§8.6), route /c/:slug. Resolves the slug → one clinic's published site
 * and renders its chosen template. Theme colors are exposed as CSS vars (--site-primary/-accent)
 * so every template themes itself from the clinic's palette. Graceful fallback if unavailable.
 */
export default function PublicSitePage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useSite(slug);
  const site = data?.available ? data.site : null;

  useEffect(() => {
    if (site?.seo?.title) document.title = site.seo.title;
    return () => { document.title = 'Clynic'; };
  }, [site]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-slate-400">Loading…</div>;
  }
  if (isError || !site) {
    // Site missing or unpublished — booking still works, so offer it.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">This clinic page isn’t available</h1>
        <p className="max-w-md text-slate-500">The website may be unpublished, but you can still request an appointment.</p>
        <Link to={`/c/${slug}/book`} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 font-medium text-white hover:bg-teal-700">
          <CalendarPlus className="h-5 w-5" /> Book an appointment
        </Link>
      </div>
    );
  }

  const Template = getTemplate(site.template);
  return (
    <div style={{ '--site-primary': site.theme.primaryColor, '--site-accent': site.theme.accentColor }}>
      <Template site={site} slug={slug} />
    </div>
  );
}
