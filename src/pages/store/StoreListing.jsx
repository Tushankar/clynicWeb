/**
 * Storefront listing — reused for category / symptom / search results.
 * mode="category" (/store/category/:catSlug), "symptom" (/store/symptoms/:tag),
 * "search" (/store/search?q=). Product grid + heading + empty/error states.
 */
import { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Search } from 'lucide-react';
import { Eyebrow } from '@/components/site/templates/premium-signature/ui';
import { useStoreCategory, useStoreSymptom, useStoreSearch } from '@/hooks/useStore';
import { StoreShell, ProductGrid, ProductGridSkeleton, EmptyPanel, ErrorPanel } from './shared';

export default function StoreListing({ mode = 'category' }) {
  const { slug, catSlug, tag } = useParams();
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const category = useStoreCategory(slug, mode === 'category' ? catSlug : undefined);
  const symptom = useStoreSymptom(slug, mode === 'symptom' ? tag : undefined);
  const search = useStoreSearch(slug, mode === 'search' ? q : undefined);
  const query = mode === 'category' ? category : mode === 'symptom' ? symptom : search;

  const items = query.data?.items || [];
  const heading =
    mode === 'category'
      ? category.data?.category?.name || catSlug
      : mode === 'symptom'
        ? symptom.data?.symptom || tag
        : q;
  const eyebrow = mode === 'category' ? 'Category' : mode === 'symptom' ? 'Symptom' : 'Search results';

  useEffect(() => {
    if (heading) document.title = `${heading} — Store`;
    return () => {
      document.title = 'Clynic';
    };
  }, [heading]);

  return (
    <StoreShell slug={slug}>
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          to={`/c/${slug}/store`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-[#0B1220]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All products
        </Link>

        <div className="mt-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="pmx-display mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-[#0B1220] sm:text-[2.4rem]">
            {mode === 'search' ? (
              <>Results for <span className="text-emerald-700">“{heading}”</span></>
            ) : (
              heading || 'Products'
            )}
          </h1>
          {!query.isLoading && !query.isError ? (
            <p className="mt-2 text-[14px] text-slate-500">
              {items.length} {items.length === 1 ? 'product' : 'products'}
              {mode === 'category' && category.data?.category?.description ? ` · ${category.data.category.description}` : ''}
            </p>
          ) : null}
        </div>

        <div className="mb-8 mt-8">
          {query.isLoading ? (
            <ProductGridSkeleton />
          ) : query.isError ? (
            <ErrorPanel message={query.error?.message} onRetry={query.refetch} />
          ) : items.length ? (
            <ProductGrid slug={slug} products={items} />
          ) : (
            <EmptyPanel
              icon={mode === 'search' ? Search : Package}
              title={mode === 'search' ? 'No matches found' : 'Nothing here yet'}
              message={
                mode === 'search'
                  ? 'Try a different medicine name, brand or salt.'
                  : 'There are no products in this section right now. Please check back soon.'
              }
            />
          )}
        </div>
      </section>
    </StoreShell>
  );
}
