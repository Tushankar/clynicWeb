/**
 * Storefront orders (§ /c/:slug/store/orders). Requires an OTP session (prompts sign-in when
 * none). Lists the patient's orders; selecting one shows detail: items, prescription status
 * (re-upload if rejected), and pay if unpaid.
 */
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  Loader2,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingCart,
  Upload,
} from 'lucide-react';
import { Button as PmxButton } from '@/components/site/templates/premium-signature/ui';
import { SHADOW, cx } from '@/components/site/templates/premium-signature/lib';
import {
  useStoreSession,
  useStoreLogout,
  useStoreHome,
  useMyOrders,
  useMyOrder,
  useUploadPrescription,
  usePayOrder,
} from '@/hooks/useStore';
import { fmtDate } from '@/lib/format';
import { StoreShell, EmptyPanel, ErrorPanel, money } from './shared';
import StoreAuthPanel from './StoreAuthPanel';

/* ---------------------------------- badges ---------------------------------- */

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700' },
  verified: { label: 'Verified', cls: 'bg-sky-50 text-sky-700' },
  fulfilled: { label: 'Fulfilled', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700' },
};
const PAYMENT = {
  unpaid: { label: 'Unpaid', cls: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700' },
};
const VERIFY = {
  not_required: { label: 'No Rx needed', cls: 'bg-slate-100 text-slate-500' },
  pending: { label: 'Rx pending review', cls: 'bg-amber-50 text-amber-700' },
  verified: { label: 'Rx verified', cls: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rx rejected', cls: 'bg-rose-50 text-rose-700' },
};

function Badge({ map, value }) {
  const cfg = map[value] || { label: value, cls: 'bg-slate-100 text-slate-500' };
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold', cfg.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function StoreOrders() {
  const { slug } = useParams();
  const { isAuthed, patient } = useStoreSession(slug);
  const logout = useStoreLogout(slug);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.title = 'My orders — Store';
    return () => {
      document.title = 'Clynic';
    };
  }, []);

  return (
    <StoreShell slug={slug}>
      <section className="mx-auto max-w-4xl px-5 sm:px-8">
        {!isAuthed ? (
          <>
            <h1 className="pmx-display mt-4 text-[2rem] font-semibold tracking-[-0.02em] text-[#0B1220]">My orders</h1>
            <div className="mx-auto mb-8 mt-8 max-w-md rounded-[1.75rem] border border-slate-200/70 bg-white p-6 sm:p-8" style={{ boxShadow: SHADOW.md }}>
              <StoreAuthPanel slug={slug} heading="Sign in to view your orders" sub="We’ll email you a 6-digit code to see your order history." />
            </div>
          </>
        ) : selectedId ? (
          <OrderDetail slug={slug} id={selectedId} patient={patient} onBack={() => setSelectedId(null)} />
        ) : (
          <OrderList slug={slug} patient={patient} onLogout={logout} onSelect={setSelectedId} />
        )}
      </section>
    </StoreShell>
  );
}

/* -------------------------------- order list -------------------------------- */

function OrderList({ slug, patient, onLogout, onSelect }) {
  const { data, isLoading, isError, error, refetch } = useMyOrders(slug);
  const orders = data?.items || [];

  return (
    <>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="pmx-display text-[2rem] font-semibold tracking-[-0.02em] text-[#0B1220] sm:text-[2.4rem]">My orders</h1>
          {patient?.email ? <p className="mt-1 text-[13px] text-slate-500">{patient.email}</p> : null}
        </div>
        <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-500 transition-colors hover:text-[#0B1220]">
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out
        </button>
      </div>

      <div className="mb-8 mt-7">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-3xl border border-slate-200/70 bg-white" style={{ boxShadow: SHADOW.sm }} />
            ))}
          </div>
        ) : isError ? (
          <ErrorPanel message={error?.message} onRetry={refetch} />
        ) : orders.length === 0 ? (
          <EmptyPanel
            icon={ShoppingCart}
            title="No orders yet"
            message="When you place an order it will appear here, with live status and payment details."
            action={<PmxButton to={`/c/${slug}/store`} magnetic={false}>Browse the store</PmxButton>}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelect(o.id)}
                className="flex w-full items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30"
                style={{ boxShadow: SHADOW.sm }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Package className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="pmx-display text-[15px] font-semibold text-[#0B1220]">{o.orderNumber}</span>
                    <Badge map={STATUS} value={o.status} />
                    <Badge map={PAYMENT} value={o.paymentStatus} />
                    {o.requiresPrescription ? <Badge map={VERIFY} value={o.verificationStatus} /> : null}
                  </div>
                  <p className="mt-1 text-[12.5px] text-slate-500">
                    {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? '' : 's'} · {o.createdAt ? fmtDate(o.createdAt) : ''}
                  </p>
                </div>
                <span className="pmx-display shrink-0 text-[16px] font-semibold text-[#0B1220]">{money(o.total)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------- order detail ------------------------------- */

function OrderDetail({ slug, id, patient, onBack }) {
  const { data: order, isLoading, isError, error, refetch } = useMyOrder(slug, id);
  const home = useStoreHome(slug);
  const uploadRx = useUploadPrescription(slug);
  const payOrder = usePayOrder(slug);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);

  const doUpload = async () => {
    if (!file) return;
    setErr(null);
    try {
      await uploadRx.mutateAsync({ orderId: id, file });
      setFile(null);
    } catch (e) {
      setErr(e?.body?.message || e?.message || 'Upload failed. Please try again.');
    }
  };
  const doPay = async () => {
    setErr(null);
    try {
      await payOrder.mutateAsync({ orderId: id, storeName: home.data?.store?.name, patient });
    } catch (e) {
      if (e?.message === 'Payment cancelled') return;
      setErr(e?.body?.message || e?.message || 'Payment could not be completed.');
    }
  };

  const back = (
    <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-[#0B1220]">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All orders
    </button>
  );

  if (isLoading) {
    return (
      <div className="mt-4">
        {back}
        <div className="mt-6 h-64 animate-pulse rounded-3xl border border-slate-200/70 bg-white" style={{ boxShadow: SHADOW.sm }} />
      </div>
    );
  }
  if (isError || !order) {
    return (
      <div className="mt-4">
        {back}
        <div className="mt-6"><ErrorPanel message={error?.message || 'Order not found.'} onRetry={refetch} /></div>
      </div>
    );
  }

  const needsUpload = order.requiresPrescription && (!order.hasPrescription || order.verificationStatus === 'rejected');
  const canPay = order.paymentStatus === 'unpaid' && order.status !== 'cancelled';
  // Trust the server-reported MIME type, not the URL. Inline <img> only for images; PDFs (and
  // any unknown type) get a "View prescription" link that opens the signed URL in a new tab.
  const isImage = /image/i.test(order.prescriptionMimeType || '');

  return (
    <div className="mt-4 mb-8">
      {back}

      <div className="mt-5 rounded-[1.75rem] border border-slate-200/70 bg-white p-6 sm:p-8" style={{ boxShadow: SHADOW.md }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="pmx-display text-[22px] font-semibold tracking-[-0.02em] text-[#0B1220]">{order.orderNumber}</h1>
            <p className="mt-1 text-[12.5px] text-slate-500">{order.createdAt ? fmtDate(order.createdAt) : ''}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge map={STATUS} value={order.status} />
            <Badge map={PAYMENT} value={order.paymentStatus} />
            {order.requiresPrescription ? <Badge map={VERIFY} value={order.verificationStatus} /> : null}
          </div>
        </div>

        {err ? <p role="alert" className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{err}</p> : null}

        {/* items */}
        <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {order.items?.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-[#0B1220]">{it.medicineName}</p>
                <p className="text-[12px] text-slate-400">Qty {it.qty}{it.unit ? ` · ${it.unit}` : ''} · {money(it.unitPrice)}</p>
              </div>
              <span className="shrink-0 text-[14px] font-semibold tabular text-slate-700">{money((Number(it.unitPrice) || 0) * it.qty)}</span>
            </div>
          ))}
        </div>

        {/* totals */}
        <dl className="mt-4 space-y-2 text-[13.5px]">
          <div className="flex items-center justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold tabular text-[#0B1220]">{money(order.subtotal)}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-slate-500">GST</dt><dd className="font-semibold tabular text-[#0B1220]">{money(order.gstAmount)}</dd></div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5"><dt className="font-semibold text-slate-600">Total</dt><dd className="pmx-display text-[18px] font-semibold text-[#0B1220]">{money(order.total)}</dd></div>
        </dl>

        {/* prescription */}
        {order.requiresPrescription ? (
          <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#0B1220]">
              <ShieldCheck className="h-4.5 w-4.5 h-[18px] w-[18px] text-rose-600" aria-hidden="true" /> Prescription
              <span className="ml-auto"><Badge map={VERIFY} value={order.verificationStatus} /></span>
            </p>
            {order.verificationStatus === 'rejected' && order.rejectionReason ? (
              <p className="mt-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700">
                Rejected: {order.rejectionReason}
              </p>
            ) : null}

            {order.hasPrescription && order.prescriptionUrl ? (
              isImage ? (
                <a href={order.prescriptionUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-xl border border-slate-200">
                  <img src={order.prescriptionUrl} alt="Uploaded prescription" className="max-h-64 w-full object-contain bg-white" />
                </a>
              ) : (
                <a href={order.prescriptionUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-emerald-700 hover:border-emerald-500/40">
                  <FileText className="h-4 w-4" aria-hidden="true" /> View uploaded prescription
                </a>
              )
            ) : null}

            {needsUpload ? (
              <div className="mt-4">
                <p className="text-[13px] font-semibold text-rose-700">
                  {order.verificationStatus === 'rejected' ? 'Please upload a valid prescription to continue.' : 'Upload a prescription to continue.'}
                </p>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-center transition-colors hover:border-emerald-500/50"
                >
                  {file ? <FileText className="h-5 w-5 text-emerald-700" aria-hidden="true" /> : <Upload className="h-5 w-5 text-slate-400" aria-hidden="true" />}
                  <span className="text-[13.5px] font-semibold text-[#0B1220]">{file ? file.name : 'Choose a file (JPG, PNG, PDF)'}</span>
                </button>
                <PmxButton
                  icon={uploadRx.isPending ? Loader2 : Upload}
                  magnetic={false}
                  className={cx('mt-3 w-full', (!file || uploadRx.isPending) && 'pointer-events-none opacity-40', uploadRx.isPending && '[&_svg]:animate-spin')}
                  aria-disabled={!file || uploadRx.isPending}
                  onClick={() => file && !uploadRx.isPending && doUpload()}
                >
                  {uploadRx.isPending ? 'Uploading…' : 'Upload prescription'}
                </PmxButton>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* pay */}
        {canPay ? (
          <PmxButton
            icon={payOrder.isPending ? Loader2 : CreditCard}
            magnetic={false}
            className={cx('mt-6 w-full', payOrder.isPending && 'pointer-events-none opacity-60 [&_svg]:animate-spin')}
            onClick={() => !payOrder.isPending && doPay()}
          >
            {payOrder.isPending ? 'Processing…' : `Pay ${money(order.total)}`}
          </PmxButton>
        ) : order.paymentStatus === 'paid' ? (
          <p className="mt-6 flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
            <Check className="h-4 w-4" aria-hidden="true" /> Payment complete
          </p>
        ) : null}
      </div>
    </div>
  );
}
