/**
 * Storefront home (§ /c/:slug/store) — Premium Signature edition.
 * Hero + prominent search, category tiles, symptom chips, featured products, trust row.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Package, Pill, Search, Sparkles, Stethoscope } from 'lucide-react';
import { SectionHead, Eyebrow, SafeImg } from '@/components/site/templates/premium-signature/ui';
import { GRADIENTS, SHADOW, cx } from '@/components/site/templates/premium-signature/lib';
import { Reveal, Stagger, Item } from '@/components/site/templates/premium-signature/motion';
import { useSite } from '@/hooks/useSite';
import { useStoreHome } from '@/hooks/useStore';
import {
  StoreShell,
  StoreSplash,
  StoreUnavailable,
  ProductGrid,
  ProductGridSkeleton,
  TrustRow,
  EmptyPanel,
} from './shared';

export default function StoreHome() {
  const { slug } = useParams();
  const { data: siteData, isLoading: siteLoading } = useSite(slug);
  const home = useStoreHome(slug);

  useEffect(() => {
    const n = home.data?.store?.name;
    if (n) document.title = `Store — ${n}`;
    return () => {
      document.title = 'Clynic';
    };
  }, [home.data]);

  if (home.isLoading || siteLoading) return <StoreSplash />;

  const explicitlyOff = siteData?.available && siteData.site?.store === false;
  if (home.isError || explicitlyOff || !home.data) return <StoreUnavailable slug={slug} />;

  const { store, categories = [], featured = [], symptoms = [] } = home.data;

  return (
    <StoreShell slug={slug} showSearch={false}>
      {/* -------------------------------- hero -------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 px-6 py-12 text-white sm:px-12 sm:py-16"
          style={{ background: 'linear-gradient(150deg,#060E22 0%,#0A1B3A 58%,#0C2B47 115%)', boxShadow: SHADOW.lg }}>
          <div aria-hidden="true" className="pmx-grid-dark absolute inset-0 opacity-50" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle,#10B981 0%,transparent 65%)' }} />
          <div className="relative max-w-2xl">
            <Reveal>
              <Eyebrow tone="dark">Online pharmacy</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="pmx-display mt-4 text-balance text-[2.1rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[3rem]">
                Medicines from {store?.name || 'our pharmacy'}, delivered with care
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-slate-300 sm:text-lg">
                Genuine products from a licensed pharmacy. Search for what you need, or browse by category —
                prescription items are verified by our pharmacist before dispatch.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <HeroSearch slug={slug} />
            </Reveal>
            {symptoms.length ? (
              <Reveal delay={0.32}>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-medium text-slate-400">Popular:</span>
                  {symptoms.slice(0, 6).map((tag) => (
                    <Link
                      key={tag}
                      to={`/c/${slug}/store/symptoms/${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-200 backdrop-blur transition-all hover:border-emerald-400/40 hover:bg-white/10"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {/* -------------------------------- trust -------------------------------- */}
      <section className="mx-auto mt-6 max-w-6xl px-5 sm:px-8">
        <Reveal>
          <TrustRow />
        </Reveal>
      </section>

      {/* ------------------------------ categories ------------------------------ */}
      {categories.length ? (
        <section className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
          <SectionHead eyebrow="Shop by category" title="Find what you need, faster" align="left" />
          <Stagger className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <Item key={cat.slug}>
                <CategoryTile slug={slug} cat={cat} i={i} />
              </Item>
            ))}
          </Stagger>
        </section>
      ) : null}

      {/* ------------------------------- symptoms ------------------------------- */}
      {symptoms.length ? (
        <section className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
          <SectionHead eyebrow="Shop by need" title="Care for common concerns" align="left" />
          <div className="mt-8 flex flex-wrap gap-2.5">
            {symptoms.map((tag) => (
              <Link
                key={tag}
                to={`/c/${slug}/store/symptoms/${encodeURIComponent(tag)}`}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:text-[#0B1220]"
                style={{ boxShadow: SHADOW.sm }}
              >
                <Stethoscope className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {tag}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ------------------------------- featured ------------------------------- */}
      <section className="mx-auto mb-8 mt-16 max-w-6xl px-5 sm:px-8">
        <SectionHead eyebrow="Featured" title="Popular right now" align="left" />
        <div className="mt-8">
          {home.isFetching && !featured.length ? (
            <ProductGridSkeleton />
          ) : featured.length ? (
            <ProductGrid slug={slug} products={featured} />
          ) : (
            <EmptyPanel
              icon={Package}
              title="No products yet"
              message="This pharmacy hasn’t listed products for the store yet. Please check back soon."
            />
          )}
        </div>
      </section>
    </StoreShell>
  );
}

function HeroSearch({ slug }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (term) navigate(`/c/${slug}/store/search?q=${encodeURIComponent(term)}`);
  };
  return (
    <form onSubmit={submit} className="mt-8 flex max-w-xl items-center gap-2" role="search">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search medicines, brands, salts…"
          aria-label="Search the store"
          className="h-13 h-[52px] w-full rounded-2xl border border-white/10 bg-white/95 pl-12 pr-4 text-[15px] text-[#0B1220] shadow-lg outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/25"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-[52px] shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 px-5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
        style={{ boxShadow: SHADOW.glow }}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" /> Search
      </button>
    </form>
  );
}

function CategoryTile({ slug, cat, i }) {
  const gradient = GRADIENTS[i % GRADIENTS.length];
  return (
    <Link
      to={`/c/${slug}/store/category/${cat.slug}`}
      className="group relative flex aspect-[5/4] flex-col justify-end overflow-hidden rounded-3xl border border-slate-200/70 p-4 text-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30"
      style={{ boxShadow: SHADOW.sm }}
    >
      {cat.imageUrl ? (
        <>
          <SafeImg src={cat.imageUrl} alt={cat.name} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#060E22]/85 via-[#060E22]/20 to-transparent" />
        </>
      ) : (
        <div aria-hidden="true" className="absolute inset-0" style={{ background: gradient }}>
          <div className="pmx-plus absolute inset-0 opacity-[0.12]" />
          <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Pill className="h-6 w-6 text-white/90" strokeWidth={1.8} aria-hidden="true" />
          </span>
        </div>
      )}
      <div className="relative">
        <p className="pmx-display text-[15px] font-semibold leading-tight tracking-[-0.01em]">{cat.name}</p>
        {cat.description ? <p className="mt-0.5 line-clamp-1 text-[12px] text-white/75">{cat.description}</p> : null}
      </div>
    </Link>
  );
}
