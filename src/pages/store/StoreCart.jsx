/**
 * Storefront cart (§ /c/:slug/store/cart). Line items (qty edit, remove), subtotal, checkout.
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react';
import { Button as PmxButton } from '@/components/site/templates/premium-signature/ui';
import { SHADOW } from '@/components/site/templates/premium-signature/lib';
import { useCart } from '@/hooks/useCart';
import { StoreShell, ProductMedia, RxBadge, EmptyPanel, money } from './shared';

export default function StoreCart() {
  const { slug } = useParams();
  const { items, setQty, remove, subtotal, count } = useCart(slug);
  const rxCount = items.filter((i) => i.prescriptionRequired).length;

  useEffect(() => {
    document.title = 'Cart — Store';
    return () => {
      document.title = 'Clynic';
    };
  }, []);

  return (
    <StoreShell slug={slug}>
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          to={`/c/${slug}/store`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-[#0B1220]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue shopping
        </Link>

        <h1 className="pmx-display mt-4 text-[2rem] font-semibold tracking-[-0.02em] text-[#0B1220] sm:text-[2.4rem]">Your cart</h1>

        {items.length === 0 ? (
          <div className="mb-8 mt-8">
            <EmptyPanel
              icon={ShoppingCart}
              title="Your cart is empty"
              message="Browse the store and add the medicines you need — they’ll show up here."
              action={
                <PmxButton to={`/c/${slug}/store`} icon={ArrowRight} magnetic={false}>
                  Browse the store
                </PmxButton>
              }
            />
          </div>
        ) : (
          <div className="mb-8 mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            {/* line items */}
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it.medicineId}
                  className="flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-3.5 sm:p-4"
                  style={{ boxShadow: SHADOW.sm }}
                >
                  <Link
                    to={`/c/${slug}/store/medicine/${it.medicineId}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                  >
                    <ProductMedia product={{ id: it.medicineId, name: it.name, imageUrl: it.imageUrl, prescriptionRequired: it.prescriptionRequired }} className="h-full w-full" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/c/${slug}/store/medicine/${it.medicineId}`} className="pmx-display line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#0B1220] hover:text-emerald-700">
                      {it.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[13px] text-slate-500">{money(it.price)}{it.unit ? ` / ${it.unit}` : ''}</span>
                      {it.prescriptionRequired ? <RxBadge product={{ prescriptionRequired: true }} /> : null}
                    </div>
                    {/* qty control */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-white p-0.5" role="group" aria-label="Quantity">
                        <button
                          type="button"
                          onClick={() => setQty(it.medicineId, it.qty - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="min-w-[2rem] text-center text-[14px] font-semibold tabular text-[#0B1220]">{it.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(it.medicineId, it.qty + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(it.medicineId)}
                        className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-slate-400 transition-colors hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <span className="pmx-display text-[16px] font-semibold text-[#0B1220]">{money(it.price * it.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* summary */}
            <aside className="lg:sticky lg:top-28">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-6" style={{ boxShadow: SHADOW.md }}>
                <h2 className="pmx-display text-[16px] font-semibold text-[#0B1220]">Order summary</h2>
                <dl className="mt-4 space-y-2.5 text-[14px]">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Items ({count})</dt>
                    <dd className="font-semibold tabular text-[#0B1220]">{money(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between text-[12.5px] text-slate-400">
                    <dt>Taxes & delivery</dt>
                    <dd>Calculated at checkout</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[14px] font-semibold text-slate-600">Subtotal</span>
                  <span className="pmx-display text-[22px] font-semibold text-[#0B1220]">{money(subtotal)}</span>
                </div>

                {rxCount > 0 ? (
                  <p className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-50/70 px-3.5 py-3 text-[12.5px] leading-relaxed text-rose-700">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {rxCount} item{rxCount === 1 ? '' : 's'} require a prescription — you’ll upload it at checkout.
                  </p>
                ) : null}

                <PmxButton to={`/c/${slug}/store/checkout`} icon={ArrowRight} magnetic={false} className="mt-5 w-full">
                  Proceed to checkout
                </PmxButton>
              </div>
            </aside>
          </div>
        )}
      </section>
    </StoreShell>
  );
}
