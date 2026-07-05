/**
 * Storefront (Ultra Premium, UP-D) — shared chrome & product primitives.
 *
 * The public pharmacy store is PUBLIC-SITE work, so it reuses the premium-signature design
 * system (porcelain canvas, deep-navy accents, emerald, glass) — never shadcn. Every store
 * page wraps its content in <StoreShell> for the fixed glass navbar (with a live cart badge),
 * ambient lighting and the shared site footer.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Loader2,
  Package,
  Phone,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react';
import { PmxStyles } from '@/components/site/templates/premium-signature/styles';
import { Blob, BrandMark, Button as PmxButton, SafeImg } from '@/components/site/templates/premium-signature/ui';
import { GRADIENTS, SHADOW, cx, deriveModel } from '@/components/site/templates/premium-signature/lib';
import Footer from '@/components/site/templates/premium-signature/sections/Footer';
import { useSite } from '@/hooks/useSite';
import { useCart } from '@/hooks/useCart';
import { useStoreSession } from '@/hooks/useStore';
import { inr } from '@/lib/format';

export const money = (v) => inr(v);

const INPUT_STORE =
  'h-11 w-full rounded-2xl border border-slate-200/90 bg-white px-4 text-[15px] text-[#0B1220] placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10';

/* --------------------------------- page shell --------------------------------- */

export function StoreShell({ slug, children, showSearch = true }) {
  const { data } = useSite(slug);
  const siteModel = data?.available ? deriveModel(data.site, slug) : null;
  return (
    <div className="pmx relative isolate min-h-screen overflow-x-clip bg-[#F8FAFC] text-[#0B1220] antialiased">
      <PmxStyles />
      <Blob className="-right-48 -top-48" from="rgba(16,185,129,0.13)" size={640} />
      <Blob className="-left-56 top-[420px]" from="rgba(37,99,235,0.09)" size={560} />
      <div aria-hidden="true" className="pmx-grid absolute inset-x-0 top-0 -z-10 h-[480px] opacity-60" />

      <StoreNav slug={slug} siteModel={siteModel} showSearch={showSearch} />

      <main className="pt-24 sm:pt-28">{children}</main>

      {siteModel ? (
        <div className="mt-4">
          <Footer m={siteModel} basePath={`/c/${slug}`} />
        </div>
      ) : (
        <footer className="mx-auto mt-16 max-w-6xl px-5 pb-10 pt-10 text-center text-[12px] text-slate-400 sm:px-8">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70" aria-hidden="true" />
            Licensed pharmacy · Secure payments · Powered by <span className="font-semibold text-slate-500">Clynic</span>
          </p>
        </footer>
      )}
    </div>
  );
}

/* ---------------------------------- navbar ---------------------------------- */

function StoreNav({ slug, siteModel, showSearch }) {
  const navigate = useNavigate();
  const { count } = useCart(slug);
  const { isAuthed } = useStoreSession(slug);
  const [q, setQ] = useState('');
  const name = siteModel?.name || 'Pharmacy';
  const logoUrl = siteModel?.theme?.logoUrl || '';

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (term) navigate(`/c/${slug}/store/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
    >
      <div
        className="mx-auto flex max-w-6xl items-center gap-2 rounded-full border border-slate-200/70 bg-white/85 py-2 pl-4 pr-2 shadow-[0_10px_36px_-12px_rgba(10,27,58,0.18)] sm:gap-3 sm:pl-5 sm:pr-2.5"
        style={{ backdropFilter: 'blur(20px) saturate(1.5)', WebkitBackdropFilter: 'blur(20px) saturate(1.5)' }}
      >
        <Link to={`/c/${slug}/store`} className="min-w-0 shrink-0" aria-label={`${name} store — home`}>
          <BrandMark logoUrl={logoUrl} name={name} size="sm" />
        </Link>

        {showSearch ? (
          <form onSubmit={submit} className="relative min-w-0 flex-1" role="search">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search medicines, brands…"
              aria-label="Search the store"
              className="h-10 w-full rounded-full border border-slate-200/80 bg-slate-50/80 pl-10 pr-4 text-[14px] text-[#0B1220] placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </form>
        ) : (
          <span className="flex-1" />
        )}

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={`/c/${slug}/store/orders`}
            className="hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-[#0B1220] sm:inline-flex"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            {isAuthed ? 'My orders' : 'Sign in'}
          </Link>
          <Link
            to={`/c/${slug}/store/cart`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-900/5"
            aria-label={`Cart (${count} item${count === 1 ? '' : 's'})`}
          >
            <ShoppingCart className="h-[19px] w-[19px]" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                {count > 99 ? '99+' : count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* --------------------------------- product bits --------------------------------- */

/** Product imagery — the real photo when present, else a tasteful gradient icon tile
 *  (Pill / Package), NEVER a placeholder photo. */
export function ProductMedia({ product, className, eager = false }) {
  const gradient = GRADIENTS[hashIndex(product?.id || product?.name || '') % GRADIENTS.length];
  if (product?.imageUrl) {
    return <SafeImg src={product.imageUrl} alt={product.name} eager={eager} className={cx('object-cover', className)} imgClassName="h-full w-full object-cover" />;
  }
  const Icon = product?.prescriptionRequired ? ShieldCheck : Pill;
  return (
    <div
      className={cx('flex items-center justify-center', className)}
      style={{ background: gradient }}
      role="img"
      aria-label={product?.name || 'Medicine'}
    >
      <Icon className="h-1/3 w-1/3 max-h-16 max-w-16 text-white/85" strokeWidth={1.6} aria-hidden="true" />
    </div>
  );
}

function hashIndex(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function RxBadge({ product, className }) {
  if (!product?.prescriptionRequired) {
    return (
      <span className={cx('inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15', className)}>
        <BadgeCheck className="h-3 w-3" aria-hidden="true" /> OTC
      </span>
    );
  }
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-600/15', className)}>
      <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Rx{product.scheduleClass && product.scheduleClass !== 'OTC' ? ` · ${product.scheduleClass}` : ''}
    </span>
  );
}

export function StockPill({ inStock, className }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
        className
      )}
    >
      <span className={cx('h-1.5 w-1.5 rounded-full', inStock ? 'bg-emerald-500' : 'bg-slate-400')} aria-hidden="true" />
      {inStock ? 'In stock' : 'Out of stock'}
    </span>
  );
}

/** Product grid card — image/tile, name, brand·strength, price, stock + Rx, quick add. */
export function ProductCard({ slug, product }) {
  const { add } = useCart(slug);
  const [added, setAdded] = useState(false);
  const to = `/c/${slug}/store/medicine/${product.id}`;

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    add({
      medicineId: product.id,
      name: product.name,
      price: product.price,
      prescriptionRequired: product.prescriptionRequired,
      unit: product.unit,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30"
      style={{ boxShadow: SHADOW.sm }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
        <ProductMedia product={product} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3">
          <RxBadge product={product} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="pmx-display line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#0B1220]">{product.name}</p>
        <p className="mt-0.5 line-clamp-1 text-[12.5px] text-slate-500">
          {[product.brand, product.strength].filter(Boolean).join(' · ') || product.composition || product.form || '—'}
        </p>
        <div className="mt-2">
          <StockPill inStock={product.inStock} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 pt-1">
          <span className="pmx-display text-[18px] font-semibold text-[#0B1220]">{money(product.price)}</span>
          <button
            type="button"
            onClick={quickAdd}
            disabled={!product.inStock}
            aria-label={product.inStock ? `Add ${product.name} to cart` : 'Out of stock'}
            className={cx(
              'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-all duration-200',
              !product.inStock
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0A1B3A] text-white hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(10,27,58,0.5)]'
            )}
          >
            {added ? 'Added' : <><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add</>}
          </button>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ slug, products }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} slug={slug} product={p} />
      ))}
    </div>
  );
}

/* --------------------------------- states --------------------------------- */

export function StoreSplash({ label = 'Loading the store…' }) {
  return (
    <div className="pmx flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-6">
      <PmxStyles />
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1B3A] to-[#12306B] text-white shadow-lg">
        <Store className="h-6 w-6 animate-pulse" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium tracking-wide text-slate-400">{label}</span>
    </div>
  );
}

export function StoreUnavailable({ slug, title = 'Store not available', message }) {
  return (
    <div className="pmx flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8FAFC] px-6 text-center">
      <PmxStyles />
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0A1B3A] to-[#12306B] text-white shadow-lg">
        <Store className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="pmx-display text-2xl font-semibold tracking-[-0.02em] text-[#0B1220]">{title}</h1>
      <p className="max-w-md text-[15px] leading-relaxed text-slate-500">
        {message || 'This clinic hasn’t opened an online pharmacy store yet. You can still book an appointment or visit the website.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PmxButton to={`/c/${slug}`} variant="ghost" icon={ArrowLeft} magnetic={false}>
          Back to website
        </PmxButton>
        <PmxButton to={`/c/${slug}/book`} icon={ArrowRight} magnetic={false}>
          Book an appointment
        </PmxButton>
      </div>
    </div>
  );
}

/** Panel-level empty state (inside the shell). */
export function EmptyPanel({ icon: Icon = Package, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="pmx-display mt-4 text-lg font-semibold text-[#0B1220]">{title}</p>
      {message ? <p className="mt-1.5 max-w-sm text-[14px] text-slate-500">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorPanel({ message = 'Something went wrong loading this.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/70 bg-white px-6 py-16 text-center">
      <p className="text-[15px] font-medium text-[#0B1220]">Couldn’t load this</p>
      <p className="mt-1 max-w-sm text-[13.5px] text-slate-500">{message}</p>
      {onRetry ? (
        <PmxButton variant="ghost" magnetic={false} className="mt-5" onClick={onRetry}>
          Try again
        </PmxButton>
      ) : null}
    </div>
  );
}

/** Loading skeleton grid for product listings. */
export function ProductGridSkeleton({ n = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white" style={{ boxShadow: SHADOW.sm }}>
          <div className="aspect-[4/3] w-full animate-pulse bg-slate-100" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-7 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Trust signal row — verified pharmacy / secure payments / licensed. */
export function TrustRow({ className }) {
  const items = [
    { icon: BadgeCheck, label: 'Verified pharmacy' },
    { icon: ShieldCheck, label: 'Secure payments' },
    { icon: Truck, label: 'Reliable fulfilment' },
    { icon: Phone, label: 'Pharmacist support' },
  ];
  return (
    <div className={cx('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {items.map((t) => (
        <div key={t.label} className="flex items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <t.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

export { INPUT_STORE };
