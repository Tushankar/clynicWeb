/**
 * Shared document (§5.23) — /d/:token. A print-optimized invoice or prescription the
 * clinic sent via email/WhatsApp. "Download PDF" = the browser's print-to-PDF on a
 * page designed for A4; on-screen chrome disappears in print.
 */
import { useCallback, useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { LinkShell, LinkSplash, LinkError } from '@/components/public/LinkPageShell';
import { apiFetch } from '@/lib/api/client';
import { fmtDate } from '@/lib/format';

const inr = (v) => `₹${(Math.round((v ?? 0) * 100) / 100).toLocaleString('en-IN')}`;

export default function SharedDocPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await apiFetch(`/api/public/doc/${token}`, { auth: false }));
    } catch (e) {
      setLoadError(e.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (data) document.title = data.kind === 'invoice' ? `Invoice ${data.invoice.invoiceNumber}` : 'Prescription';
  }, [data]);

  if (loadError) return <LinkError message={loadError} />;
  if (!data) return <LinkSplash />;

  const { clinic, kind } = data;

  return (
    <>
      <style>{`
        @media print {
          .doc-chrome { display: none !important; }
          .doc-sheet { border: 0 !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
          body { background: #fff !important; }
        }
      `}</style>
      <LinkShell clinic={clinic} badge={kind === 'invoice' ? 'Invoice' : 'Prescription'} wide>
        <div className="doc-chrome mb-5 flex items-center justify-between">
          <p className="text-[13px] text-slate-500">Keep a copy for your records — print or save as PDF.</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#0A1B3A] px-4 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(10,27,58,0.45)] transition-all duration-200 hover:-translate-y-0.5"
          >
            <Printer className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Print / Save PDF
          </button>
        </div>

        <article className="doc-sheet overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(10,27,58,0.16)]">
          {/* Letterhead */}
          <header className="border-b-2 border-[#0A1B3A] px-7 py-6 sm:px-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {clinic.logoUrl ? (
                  <img src={clinic.logoUrl} alt={clinic.name} className="h-10 w-auto object-contain" />
                ) : (
                  <h1 className="pmx-display text-2xl font-semibold tracking-tight text-[#0A1B3A]">{clinic.name}</h1>
                )}
                <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-slate-500">
                  {clinic.address}
                  {clinic.phone && <><br />{clinic.phone}</>}
                  {clinic.gstNumber && <><br />GSTIN: {clinic.gstNumber}</>}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {kind === 'invoice' ? 'Tax Invoice' : 'Prescription'}
                </p>
                {kind === 'invoice' ? (
                  <>
                    <p className="mt-1 font-mono text-[15px] font-semibold text-[#0A1B3A]">{data.invoice.invoiceNumber}</p>
                    <p className="mt-0.5 text-[12px] text-slate-500">{fmtDate(data.invoice.createdAt)}</p>
                  </>
                ) : (
                  <p className="mt-1 text-[12px] text-slate-500">{fmtDate(data.prescription.createdAt)}</p>
                )}
              </div>
            </div>
          </header>

          {kind === 'invoice' ? <InvoiceBody inv={data.invoice} /> : <RxBody rx={data.prescription} />}

          <footer className="border-t border-slate-100 bg-slate-50/60 px-7 py-4 sm:px-10">
            <p className="text-[11px] text-slate-400">
              Issued by {clinic.name}. This is a system-generated document{kind === 'prescription' ? ' — follow your doctor’s directions; contact the clinic with any questions' : ''}.
            </p>
          </footer>
        </article>
      </LinkShell>
    </>
  );
}

function InvoiceBody({ inv }) {
  return (
    <div className="px-7 py-6 sm:px-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Billed to</p>
      <p className="mt-1 text-[16px] font-semibold text-[#0B1220]">{inv.patientName}</p>

      <table className="mt-6 w-full text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <th className="pb-2.5 font-semibold">Description</th>
            <th className="pb-2.5 text-center font-semibold">Qty</th>
            <th className="pb-2.5 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-3 text-slate-700">{it.description}</td>
              <td className="py-3 text-center tabular-nums text-slate-500">{it.quantity || 1}</td>
              <td className="py-3 text-right font-medium tabular-nums text-[#0B1220]">{inr(it.amount * (it.quantity || 1))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-5 w-full max-w-xs space-y-1.5 text-[13.5px]">
        <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="tabular-nums">{inr(inv.subtotal)}</span></div>
        {inv.gstAmount > 0 && <div className="flex justify-between text-slate-500"><span>GST ({inv.gstRate}%)</span><span className="tabular-nums">{inr(inv.gstAmount)}</span></div>}
        <div className="flex justify-between border-t border-slate-200 pt-2 text-[15px] font-semibold text-[#0A1B3A]"><span>Total</span><span className="tabular-nums">{inr(inv.total)}</span></div>
        {inv.amountPaid > 0 && <div className="flex justify-between text-emerald-700"><span>Paid</span><span className="tabular-nums">{inr(inv.amountPaid)}</span></div>}
        {inv.balance > 0 && <div className="flex justify-between font-semibold text-amber-700"><span>Balance due</span><span className="tabular-nums">{inr(inv.balance)}</span></div>}
      </div>
    </div>
  );
}

function RxBody({ rx }) {
  return (
    <div className="px-7 py-6 sm:px-10">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Patient</p>
          <p className="mt-1 text-[16px] font-semibold text-[#0B1220]">{rx.patientName}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Prescribed by</p>
          <p className="mt-1 text-[16px] font-semibold text-[#0B1220]">{rx.doctorName}</p>
        </div>
      </div>

      {rx.diagnosis && (
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Diagnosis</p>
          <p className="mt-1 text-[14px] text-slate-700">{rx.diagnosis}</p>
        </div>
      )}

      <p className="mt-6 pmx-display text-3xl font-semibold text-[#0A1B3A]/20" aria-hidden="true">℞</p>
      <table className="mt-2 w-full text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <th className="pb-2.5 font-semibold">Medicine</th>
            <th className="pb-2.5 font-semibold">Dose</th>
            <th className="pb-2.5 font-semibold">Frequency</th>
            <th className="pb-2.5 font-semibold">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rx.items.map((it, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-3 font-medium text-[#0B1220]">{it.drug}</td>
              <td className="py-3 text-slate-600">{it.dose || '—'}</td>
              <td className="py-3 text-slate-600">{it.frequency || '—'}</td>
              <td className="py-3 text-slate-600">{it.duration || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rx.notes && <p className="mt-5 text-[13px] leading-relaxed text-slate-600"><span className="font-semibold text-slate-700">Notes:</span> {rx.notes}</p>}

      <div className="mt-12 flex justify-end">
        <div className="w-48 border-t border-slate-300 pt-2 text-center">
          <p className="text-[12px] font-medium text-slate-500">{rx.doctorName}</p>
          <p className="text-[10.5px] uppercase tracking-wide text-slate-400">Signature</p>
        </div>
      </div>
    </div>
  );
}
