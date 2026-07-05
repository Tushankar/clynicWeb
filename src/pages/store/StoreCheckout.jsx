/**
 * Storefront checkout (§ /c/:slug/store/checkout).
 * Stepper: Account (email-OTP) → Details (contact + place order) → Prescription (required when
 * the order needs one) → Payment (mock sign+verify in dev, else Razorpay) → Done (cart cleared).
 */
import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  Loader2,
  Package,
  ShieldCheck,
  ShoppingCart,
  Upload,
} from 'lucide-react';
import { Button as PmxButton } from '@/components/site/templates/premium-signature/ui';
import { SHADOW, cx } from '@/components/site/templates/premium-signature/lib';
import { useCart } from '@/hooks/useCart';
import {
  useStoreSession,
  useStoreHome,
  useCreateOrder,
  useUploadPrescription,
  usePayOrder,
} from '@/hooks/useStore';
import { StoreShell, EmptyPanel, RxBadge, money, INPUT_STORE } from './shared';
import StoreAuthPanel from './StoreAuthPanel';

export default function StoreCheckout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { items, subtotal, count, clear } = useCart(slug);
  const { isAuthed, patient } = useStoreSession(slug);
  const home = useStoreHome(slug);
  const storeName = home.data?.store?.name;

  const createOrder = useCreateOrder(slug);
  const uploadRx = useUploadPrescription(slug);
  const payOrder = usePayOrder(slug);

  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ contactPhone: '', deliveryAddress: '', notes: '' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);
  const fileRef = useRef(null);
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    document.title = 'Checkout — Store';
    return () => {
      document.title = 'Clynic';
    };
  }, []);

  // Which step are we on? Derived from auth + order state.
  const rxLikely = items.some((i) => i.prescriptionRequired);
  const step = !isAuthed
    ? 'auth'
    : !order
      ? 'details'
      : order.requiresPrescription && !order.hasPrescription
        ? 'rx'
        : order.paymentStatus === 'paid' || order.status === 'fulfilled'
          ? 'done'
          : 'pay';

  // On payment completion, send the patient to their orders after a beat.
  useEffect(() => {
    if (step === 'done') {
      const t = setTimeout(() => navigate(`/c/${slug}/store/orders`), 2200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [step, navigate, slug]);

  const placeOrder = async () => {
    setErr(null);
    try {
      const body = {
        items: items.map((i) => ({ medicineId: i.medicineId, qty: i.qty })),
        contactPhone: form.contactPhone.trim() || undefined,
        deliveryAddress: form.deliveryAddress.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      const created = await createOrder.mutateAsync(body);
      setOrder(created);
      clear(); // cart is now an order; prevent a duplicate submission
    } catch (e) {
      setErr(e?.body?.message || e?.message || 'Could not place your order. Please try again.');
    }
  };

  const doUpload = async () => {
    if (!file) return;
    setErr(null);
    try {
      const updated = await uploadRx.mutateAsync({ orderId: order.id, file });
      setOrder(updated);
      setFile(null);
    } catch (e) {
      setErr(e?.body?.message || e?.message || 'Upload failed. Please try again.');
    }
  };

  const doPay = async () => {
    setErr(null);
    try {
      const res = await payOrder.mutateAsync({ orderId: order.id, storeName, patient });
      if (res?.order) setOrder(res.order);
      else setOrder((o) => ({ ...o, paymentStatus: 'paid' }));
    } catch (e) {
      if (e?.message === 'Payment cancelled') return; // user closed the gateway — no error banner
      setErr(e?.body?.message || e?.message || 'Payment could not be completed. Please try again.');
    }
  };

  // Empty cart & no order in flight → nudge back to the store.
  if (items.length === 0 && !order) {
    return (
      <StoreShell slug={slug}>
        <section className="mx-auto max-w-3xl px-5 sm:px-8">
          <h1 className="pmx-display mt-4 text-[2rem] font-semibold tracking-[-0.02em] text-[#0B1220]">Checkout</h1>
          <div className="mb-8 mt-8">
            <EmptyPanel
              icon={ShoppingCart}
              title="Your cart is empty"
              message="Add some products before checking out."
              action={<PmxButton to={`/c/${slug}/store`} icon={ArrowRight} magnetic={false}>Browse the store</PmxButton>}
            />
          </div>
        </section>
      </StoreShell>
    );
  }

  const summaryItems = order?.items?.map((i) => ({ name: i.medicineName, qty: i.qty, price: i.unitPrice, unit: i.unit })) || items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, unit: i.unit }));

  return (
    <StoreShell slug={slug}>
      <section className="mx-auto max-w-5xl px-5 sm:px-8">
        <Link to={`/c/${slug}/store/cart`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-[#0B1220]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to cart
        </Link>
        <h1 className="pmx-display mt-4 text-[2rem] font-semibold tracking-[-0.02em] text-[#0B1220] sm:text-[2.4rem]">Checkout</h1>

        <div className="mt-6">
          <CheckoutStepper step={step} showRx={rxLikely || (order?.requiresPrescription ?? false)} />
        </div>

        <div className="mb-8 mt-7 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          {/* -------- step content -------- */}
          <div
            className="relative rounded-[1.75rem] border border-slate-200/70 bg-white p-6 sm:p-8"
            style={{ boxShadow: SHADOW.md }}
          >
            {err ? (
              <p role="alert" className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{err}</p>
            ) : null}

            {step === 'auth' ? (
              <StoreAuthPanel slug={slug} heading="Sign in to place your order" onAuthed={() => setErr(null)} />
            ) : null}

            {step === 'details' ? (
              <div>
                <h2 className="pmx-display text-[18px] font-semibold tracking-[-0.01em] text-[#0B1220]">Delivery details</h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  Signed in as <span className="font-semibold text-slate-700">{patient?.email || patient?.name}</span>.
                </p>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-slate-700">Contact phone</span>
                    <input className={INPUT_STORE} value={form.contactPhone} onChange={setField('contactPhone')} placeholder="+91 98300 00000" inputMode="tel" autoComplete="tel" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-slate-700">Delivery address</span>
                    <textarea
                      className={cx(INPUT_STORE, 'h-auto resize-none py-3')}
                      rows={3}
                      value={form.deliveryAddress}
                      onChange={setField('deliveryAddress')}
                      placeholder="Flat / house, street, area, city, PIN"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-slate-700">Notes <span className="font-normal text-slate-400">(optional)</span></span>
                    <input className={INPUT_STORE} value={form.notes} onChange={setField('notes')} placeholder="Anything the pharmacist should know" />
                  </label>
                  <PmxButton
                    icon={createOrder.isPending ? Loader2 : ArrowRight}
                    magnetic={false}
                    className={cx('w-full', createOrder.isPending && 'pointer-events-none opacity-60 [&_svg]:animate-spin')}
                    onClick={() => !createOrder.isPending && placeOrder()}
                  >
                    {createOrder.isPending ? 'Placing order…' : 'Place order'}
                  </PmxButton>
                </div>
              </div>
            ) : null}

            {step === 'rx' ? (
              <div>
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4">
                  <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" aria-hidden="true" />
                  <div>
                    <p className="pmx-display text-[16px] font-semibold text-rose-900">Prescription required — upload to continue</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-rose-700/90">
                      One or more items need a valid prescription. Upload a clear photo or PDF; our pharmacist verifies it before dispatch.
                    </p>
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-8 text-center transition-colors hover:border-emerald-500/50 hover:bg-emerald-50/40"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    {file ? <FileText className="h-6 w-6" aria-hidden="true" /> : <Upload className="h-6 w-6" aria-hidden="true" />}
                  </span>
                  <span className="text-[14px] font-semibold text-[#0B1220]">{file ? file.name : 'Choose a file to upload'}</span>
                  <span className="text-[12px] text-slate-400">JPG, PNG or PDF · up to a few MB</span>
                </button>

                <PmxButton
                  icon={uploadRx.isPending ? Loader2 : Upload}
                  magnetic={false}
                  className={cx('mt-5 w-full', (!file || uploadRx.isPending) && 'pointer-events-none opacity-40', uploadRx.isPending && '[&_svg]:animate-spin')}
                  aria-disabled={!file || uploadRx.isPending}
                  onClick={() => file && !uploadRx.isPending && doUpload()}
                >
                  {uploadRx.isPending ? 'Uploading…' : 'Upload prescription'}
                </PmxButton>
                <p className="mt-3 text-center text-[12px] text-slate-400">
                  Order <span className="font-semibold text-slate-500">{order?.orderNumber}</span> is saved — you can also finish this later from{' '}
                  <Link to={`/c/${slug}/store/orders`} className="font-semibold text-emerald-700 hover:text-emerald-600">My orders</Link>.
                </p>
              </div>
            ) : null}

            {step === 'pay' ? (
              <div className="flex flex-col items-center py-2 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A1B3A] to-[#12306B] text-white shadow-lg">
                  <CreditCard className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="pmx-display mt-4 text-[20px] font-semibold tracking-[-0.01em] text-[#0B1220]">Complete your payment</h2>
                <p className="mt-1 text-[13px] text-slate-500">Order {order?.orderNumber}</p>
                {order?.requiresPrescription && order?.hasPrescription ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" /> Prescription uploaded
                  </p>
                ) : null}
                <div className="mt-5 w-full max-w-xs rounded-2xl border border-emerald-600/15 bg-emerald-50/70 px-6 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Amount payable</p>
                  <p className="pmx-display mt-1 text-3xl font-semibold text-emerald-800">{money(order?.total)}</p>
                </div>
                <PmxButton
                  icon={payOrder.isPending ? Loader2 : ShieldCheck}
                  magnetic={false}
                  className={cx('mt-6 w-full max-w-xs', payOrder.isPending && 'pointer-events-none opacity-60 [&_svg]:animate-spin')}
                  onClick={() => !payOrder.isPending && doPay()}
                >
                  {payOrder.isPending ? 'Processing…' : `Pay ${money(order?.total)}`}
                </PmxButton>
                <p className="mt-3 text-[12px] text-slate-400">Secured payment · you can also pay later from My orders.</p>
              </div>
            ) : null}

            {step === 'done' ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-[0_16px_40px_-10px_rgba(5,150,105,0.5)]">
                  <Check className="h-8 w-8" strokeWidth={3} aria-hidden="true" />
                </span>
                <h2 className="pmx-display mt-5 text-2xl font-semibold tracking-[-0.02em] text-[#0B1220]">Order confirmed!</h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  {order?.orderNumber} · {money(order?.total)} paid. Taking you to your orders…
                </p>
                <PmxButton to={`/c/${slug}/store/orders`} icon={Package} magnetic={false} className="mt-6">
                  View my orders
                </PmxButton>
              </div>
            ) : null}
          </div>

          {/* -------- summary -------- */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6" style={{ boxShadow: SHADOW.sm }}>
              <h2 className="pmx-display text-[15px] font-semibold text-[#0B1220]">
                {order ? `Order ${order.orderNumber}` : `Your cart (${count})`}
              </h2>
              <ul className="mt-4 space-y-3">
                {summaryItems.map((i, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3 text-[13px]">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[#0B1220]">{i.name}</span>
                      <span className="text-slate-400">Qty {i.qty}{i.unit ? ` · ${i.unit}` : ''}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular text-slate-700">{money((Number(i.price) || 0) * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[13.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold tabular text-[#0B1220]">{money(order ? order.subtotal : subtotal)}</span>
                </div>
                {order ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">GST</span>
                    <span className="font-semibold tabular text-[#0B1220]">{money(order.gstAmount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="font-semibold text-slate-600">Total</span>
                  <span className="pmx-display text-[18px] font-semibold text-[#0B1220]">{money(order ? order.total : subtotal)}</span>
                </div>
              </div>
              {(rxLikely || order?.requiresPrescription) ? (
                <p className="mt-4 flex items-center gap-1.5 text-[12px] text-slate-400">
                  <RxBadge product={{ prescriptionRequired: true }} /> Prescription needed
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </StoreShell>
  );
}

/* -------------------------------------- stepper -------------------------------------- */

function CheckoutStepper({ step, showRx }) {
  const steps = [
    { key: 'auth', label: 'Account' },
    { key: 'details', label: 'Details' },
    ...(showRx ? [{ key: 'rx', label: 'Prescription' }] : []),
    { key: 'pay', label: 'Payment' },
  ];
  const order = ['auth', 'details', 'rx', 'pay', 'done'];
  const activeIdx = order.indexOf(step);

  return (
    <nav aria-label="Checkout steps" className="flex items-center">
      {steps.map((s, i) => {
        const sIdx = order.indexOf(s.key);
        const done = activeIdx > sIdx;
        const active = step === s.key;
        return (
          <Fragment key={s.key}>
            {i > 0 ? (
              <span className="mx-2 h-[2px] min-w-4 flex-1 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                <span className={cx('block h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500', done || active ? 'w-full' : 'w-0')} />
              </span>
            ) : null}
            <span className="flex shrink-0 items-center gap-2">
              <span
                className={cx(
                  'flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-semibold transition-all duration-300',
                  done && 'border-transparent bg-[#0A1B3A] text-white',
                  active && 'border-emerald-500/60 bg-white text-emerald-700 ring-4 ring-emerald-500/15',
                  !done && !active && 'border-slate-200 bg-white text-slate-300'
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" /> : i + 1}
              </span>
              <span className={cx('hidden text-[12.5px] font-semibold sm:block', active ? 'text-[#0B1220]' : done ? 'text-slate-600' : 'text-slate-400')}>{s.label}</span>
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}
