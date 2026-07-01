import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { useSite } from '@/hooks/useSite';

/**
 * Public custom page (Premium CMS_ADVANCED), route /c/:slug/p/:pageSlug. Renders one published
 * custom page's body in a branded shell that inherits the clinic's theme color.
 */
export default function PublicCustomPage() {
  const { slug, pageSlug } = useParams();
  const { data, isLoading, isError } = useSite(slug);
  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-white text-slate-400">Loading…</div>;
  const site = data?.available ? data.site : null;
  if (isError || !site) return <Navigate to={`/c/${slug}`} replace />;
  const page = (site.pages || []).find((p) => p.slug === pageSlug);
  if (!page) return <Navigate to={`/c/${slug}`} replace />;

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
