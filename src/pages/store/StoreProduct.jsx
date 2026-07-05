/**
 * Storefront product detail (§ /c/:slug/store/medicine/:id).
 * Big media, identity, price, stock, Rx badge + disclaimer, description, dosage, qty + add.
 */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button as PmxButton } from '@/components/site/templates/premium-signature/ui';
import { SHADOW, cx } from '@/components/site/templates/premium-signature/lib';
import { useStoreProduct } from '@/hooks/useStore';
import { useCart } from '@/hooks/useCart';
import { StoreShell, ProductMedia, RxBadge, StockPill, ErrorPanel, money } from './shared';

const DISCLAIMER = 'This product information is general; it is not medical advice. Consult a doctor.';

export default function StoreProduct() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error, refetch } = useStoreProduct(slug, id);
  const { add, items } = useCart(slug);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product?.name) document.title = `${product.name} — Store`;
    return () => {
      document.title = 'Clynic';
    };
  }, [product]);

  const inCart = product ? items.find((i) => i.medicineId === product.id) : null;

  const doAdd = () => {
    if (!product?.inStock) return;
    add(
      {
        medicineId: product.id,
        name: product.name,
        price: product.price,
        prescriptionRequired: product.prescriptionRequired,
        unit: product.unit,
        imageUrl: product.imageUrl,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <StoreShell slug={slug}>
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          to={`/c/${slug}/store`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-[#0B1220]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to store
        </Link>

        {isLoading ? (
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="aspect-square w-full animate-pulse rounded-[2rem] border border-slate-200/70 bg-slate-100" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        ) : isError || !product ? (
          <div className="mt-6">
            <ErrorPanel message={error?.message || 'This product could not be found.'} onRetry={refetch} />
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            {/* media */}
            <div
              className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white"
              style={{ boxShadow: SHADOW.md }}
            >
              <ProductMedia product={product} eager className="h-full w-full" />
              <span className="absolute left-4 top-4">
                <RxBadge product={product} />
              </span>
            </div>

            {/* details */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {product.category ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {product.category}
                  </span>
                ) : null}
                <StockPill inStock={product.inStock} />
              </div>

              <h1 className="pmx-display mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.02em] text-[#0B1220] sm:text-[2.2rem]">
                {product.name}
              </h1>
              <p className="mt-1.5 text-[15px] text-slate-500">
                {[product.brand, product.strength, product.form].filter(Boolean).join(' · ') || product.composition || ''}
              </p>
              {product.composition && (product.brand || product.strength) ? (
                <p className="mt-1 text-[13px] text-slate-400">{product.composition}</p>
              ) : null}

              <div className="mt-5 flex items-end gap-2">
                <span className="pmx-display text-[2rem] font-semibold text-[#0B1220]">{money(product.price)}</span>
                {product.unit ? <span className="pb-1.5 text-[13px] text-slate-400">per {product.unit}</span> : null}
              </div>

              {/* Rx disclaimer */}
              {product.prescriptionRequired ? (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3.5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
                  <div>
                    <p className="text-[13.5px] font-semibold text-rose-800">Prescription required</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-rose-700/90">
                      You’ll be asked to upload a valid prescription at checkout. Our pharmacist verifies it before dispatch.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* qty + add */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-white p-1" role="group" aria-label="Quantity">
                  <button
                    type="button"
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                    disabled={qty <= 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="pmx-display min-w-[2.5rem] text-center text-[16px] font-semibold tabular text-[#0B1220]">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((n) => Math.min(99, n + 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <PmxButton
                  icon={added ? Check : ShoppingCart}
                  variant={added ? 'emerald' : 'primary'}
                  magnetic={false}
                  className={cx(!product.inStock && 'pointer-events-none opacity-40')}
                  aria-disabled={!product.inStock}
                  onClick={doAdd}
                >
                  {!product.inStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}
                </PmxButton>

                {inCart ? (
                  <Link to={`/c/${slug}/store/cart`} className="text-[13.5px] font-semibold text-emerald-700 hover:text-emerald-600">
                    View cart ({inCart.qty}) →
                  </Link>
                ) : null}
              </div>

              {/* description / dosage */}
              {product.description ? (
                <div className="mt-8">
                  <h2 className="pmx-display text-[15px] font-semibold text-[#0B1220]">About this product</h2>
                  <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-slate-600">{product.description}</p>
                </div>
              ) : null}
              {product.dosageInfo ? (
                <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <h2 className="pmx-display text-[14px] font-semibold text-[#0B1220]">Dosage</h2>
                  <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-600">{product.dosageInfo}</p>
                </div>
              ) : null}

              <p className="mt-6 text-[12px] leading-relaxed text-slate-400">{DISCLAIMER}</p>
            </div>
          </div>
        )}
      </section>
    </StoreShell>
  );
}
