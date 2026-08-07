import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useMe } from '@/hooks/useMe';
import { fmtDateTime, round2, balanceDue, rupeesInWords } from '@/lib/format';

/** Printable GST invoice (standalone, auth-gated via RequireAuth). */
export default function InvoicePrintPage() {
  const { id } = useParams();
  const clinic = useMe().data?.clinic;
  const { data: inv, isLoading, isError } = useQuery({ queryKey: ['invoice', id], queryFn: () => api.get(`/api/invoices/${id}`) });

  useEffect(() => {
    if (inv) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [inv]);

  if (isLoading) return <Centered>Loading…</Centered>;
  if (isError || !inv) return <Centered>Invoice not found.</Centered>;

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-foreground">
      {/* Supplier block. A document headed "Tax Invoice" must identify the supplier: legal name,
          address, contact and GSTIN. All of these were already on the clinic record and simply
          were not rendered, so the printed document was not a valid tax invoice. */}
      <div className="mb-6 flex items-start justify-between gap-6 border-b pb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">{clinic?.name || 'Clinic'}</h1>
          {clinic?.address && <p className="mt-0.5 text-xs text-muted-foreground">{clinic.address}</p>}
          {clinic?.phone && <p className="text-xs text-muted-foreground">Phone: {clinic.phone}</p>}
          {clinic?.gstNumber
            ? <p className="mt-1 text-xs font-medium">GSTIN: <span className="font-mono">{clinic.gstNumber}</span></p>
            : <p className="mt-1 text-xs text-muted-foreground print:hidden">No GSTIN on file — add one in Settings to issue a compliant tax invoice.</p>}
        </div>
        <div className="shrink-0 text-right text-sm">
          <p className="text-sm font-semibold">{clinic?.gstNumber ? 'Tax Invoice' : 'Invoice'}</p>
          <div className="mt-1 font-mono font-medium">{inv.invoiceNumber}</div>
          <div className="text-muted-foreground">{fmtDateTime(inv.createdAt)}</div>
          <button onClick={() => window.print()} className="mt-2 rounded-md border px-3 py-1.5 text-sm print:hidden"><Printer className="mr-1 inline h-4 w-4" /> Print</button>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <span className="text-muted-foreground">Billed to: </span>
        <span className="font-medium">{inv.patientName}</span>
        {inv.patientPhone && <span className="text-muted-foreground"> · {inv.patientPhone}</span>}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2">Description</th><th className="text-right">Amount</th><th className="text-right">Qty</th><th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{it.description}</td>
              <td className="text-right tabular">₹{it.amount}</td>
              <td className="text-right tabular">{it.quantity}</td>
              <td className="text-right tabular">₹{Math.round(it.amount * it.quantity * 100) / 100}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-4 w-72 space-y-1 text-sm">
        <Row label="Subtotal" value={inv.subtotal} />
        {/* Intra-state supply splits GST into equal CGST + SGST halves; a single blended "GST" line
            is not a compliant presentation. Clinics are almost always intra-state (the patient is
            local), which is the assumption here — inter-state supply would use IGST instead. */}
        {inv.gstAmount > 0 ? (
          <>
            <Row label={`CGST (${round2(inv.gstRate / 2)}%)`} value={round2(inv.gstAmount / 2)} />
            <Row label={`SGST (${round2(inv.gstRate / 2)}%)`} value={round2(inv.gstAmount / 2)} />
          </>
        ) : (
          <Row label="GST" value={0} />
        )}
        <Row label="Total" value={inv.total} strong />
        <Row label="Paid" value={inv.amountPaid} />
        {inv.amountRefunded > 0 && <Row label="Refunded" value={inv.amountRefunded} />}
        {/* Balance due, from the one shared definition (a cancelled/refunded invoice owes nothing). */}
        <Row label="Balance due" value={balanceDue(inv)} strong />
      </div>

      {/* Amount in words is expected on an Indian invoice and is what a payer checks against the
          figures. */}
      <p className="mt-4 text-xs text-muted-foreground">
        Amount in words: <span className="font-medium text-foreground">{rupeesInWords(inv.total)}</span>
      </p>

      {inv.payments?.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          Payment{inv.payments.length > 1 ? 's' : ''}: {inv.payments.map((p, i) => (
            <span key={i}>{i > 0 ? ', ' : ''}₹{p.amount} by {p.method}{p.reference ? ` (${p.reference})` : ''}</span>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-end justify-between gap-6">
        <p className="text-xs text-muted-foreground">Status: {inv.status.replace('_', ' ')} · Thank you.</p>
        <div className="text-center">
          <div className="h-12 w-44 border-b" />
          <p className="mt-1 text-xs text-muted-foreground">Authorised signatory</p>
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        This is a computer-generated invoice{clinic?.gstNumber ? '' : ' (not a tax invoice — no GSTIN on file)'}.
      </p>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between ${strong ? 'border-t pt-1 font-semibold' : ''}`}>
      <span className={strong ? '' : 'text-muted-foreground'}>{label}</span>
      <span className="tabular">₹{value}</span>
    </div>
  );
}
function Centered({ children }) {
  return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{children}</div>;
}
