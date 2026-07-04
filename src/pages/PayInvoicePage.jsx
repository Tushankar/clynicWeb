/**
 * Public payment link (§5.23) — /pay/:token. The patient sees the invoice with its
 * outstanding balance and pays securely (Razorpay; mock-signed in dev). The amount
 * always comes from the server; the signature is verified server-side before any
 * credit is recorded.
 */
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, CreditCard, Loader2, ReceiptText, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { LinkShell, LinkSplash, LinkError, TicketPanel } from '@/components/public/LinkPageShell';
import { apiFetch } from '@/lib/api/client';
import { collectPayment } from '@/lib/payments/razorpayCheckout';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const inr = (v) => `₹${(Math.round((v ?? 0) * 100) / 100).toLocaleString('en-IN')}`;

export default function PayInvoicePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [justPaid, setJustPaid] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await apiFetch(`/api/public/pay/${token}`, { auth: false }));
    } catch (e) {
      setLoadError(e.message);
    }
  }, [token]);

  useEffect(() => {
    document.title = 'Pay invoice';
    load();
  }, [load]);

  const pay = async () => {
    setErr(null);
    setBusy(true);
    try {
      const order = await apiFetch(`/api/public/pay/${token}/order`, { auth: false, method: 'POST' });
      const proof = await collectPayment(order, {
        name: data.clinic.name,
        description: `Invoice ${data.invoice.invoiceNumber}`,
        mockSign: async (orderId) => apiFetch(`/api/public/pay/${token}/mock-sign`, { auth: false, method: 'POST', body: { orderId } }),
      });
      const res = await apiFetch(`/api/public/pay/${token}/verify`, { auth: false, method: 'POST', body: proof });
      setData((d) => ({ ...d, invoice: res.invoice }));
      setJustPaid(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loadError) return <LinkError message={loadError} />;
  if (!data) return <LinkSplash />;

  const { clinic, invoice: inv } = data;
  const settled = inv.balance <= 0;

  return (
    <LinkShell clinic={clinic} badge="Payment request">
      {justPaid && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          Payment received — thank you! A receipt is recorded against {inv.invoiceNumber}.
        </motion.div>
      )}

      <TicketPanel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
              Invoice {inv.invoiceNumber}
            </p>
            <h1 className="pmx-display mt-2 text-[26px] font-semibold tracking-tight sm:text-[30px]">
              {settled ? 'All settled' : inr(inv.balance)}
            </h1>
            <p className="mt-1 text-[13px] text-slate-400">
              {settled ? 'Nothing left to pay on this invoice.' : `Amount due · billed to ${inv.patientName}`}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
              settled ? 'border-emerald-300/30 bg-emerald-400/15 text-emerald-300' : 'border-amber-300/30 bg-amber-400/15 text-amber-300'
            )}
          >
            {settled ? 'Paid' : inv.status.replace('_', ' ')}
          </span>
        </div>
      </TicketPanel>

      {/* Line items */}
      <section className="mt-6 overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_20px_48px_-20px_rgba(10,27,58,0.16)]">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <ReceiptText className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-500">Bill details</h2>
          <span className="ml-auto text-[12.5px] text-slate-400">{fmtDate(inv.createdAt)}</span>
        </div>
        <div className="px-5 py-2">
          {inv.items.map((it, i) => (
            <div key={i} className="flex items-baseline justify-between border-b border-slate-50 py-3 last:border-0">
              <span className="text-[14px] text-slate-700">
                {it.description}
                {it.quantity > 1 && <span className="ml-1.5 text-[12px] text-slate-400">× {it.quantity}</span>}
              </span>
              <span className="text-[14px] font-medium tabular-nums text-[#0B1220]">{inr(it.amount * (it.quantity || 1))}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-[13.5px]">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="tabular-nums">{inr(inv.subtotal)}</span></div>
          {inv.gstAmount > 0 && <div className="flex justify-between text-slate-500"><span>GST ({inv.gstRate}%)</span><span className="tabular-nums">{inr(inv.gstAmount)}</span></div>}
          <div className="flex justify-between font-semibold text-[#0B1220]"><span>Total</span><span className="tabular-nums">{inr(inv.total)}</span></div>
          {inv.amountPaid > 0 && (
            <div className="flex justify-between text-emerald-700"><span>Paid</span><span className="tabular-nums">− {inr(inv.amountPaid)}</span></div>
          )}
          {!settled && (
            <div className="flex justify-between border-t border-slate-200/70 pt-2 text-[15px] font-semibold text-[#0A1B3A]">
              <span>Amount due</span><span className="tabular-nums">{inr(inv.balance)}</span>
            </div>
          )}
        </div>
      </section>

      {err && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{err}</p>}

      {!settled && (
        <button
          type="button"
          onClick={pay}
          disabled={busy}
          className="mt-6 flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#0A1B3A] py-4 text-[15px] font-semibold text-white shadow-[0_16px_36px_-10px_rgba(10,27,58,0.5)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          {busy ? <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4.5 w-4.5 text-emerald-300" aria-hidden="true" />}
          {busy ? 'Opening secure checkout…' : `Pay ${inr(inv.balance)} securely`}
        </button>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70" aria-hidden="true" />
        UPI · Cards · Netbanking — verified server-side, powered by Razorpay
      </p>
    </LinkShell>
  );
}
