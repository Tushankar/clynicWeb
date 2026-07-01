import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useMe } from '@/hooks/useMe';
import { fmtDateTime } from '@/lib/format';

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
      <div className="mb-6 flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-semibold">{clinic?.name || 'Clinic'}</h1>
          <p className="text-sm text-muted-foreground">Tax Invoice</p>
        </div>
        <div className="text-right text-sm">
          <div className="font-mono font-medium">{inv.invoiceNumber}</div>
          <div className="text-muted-foreground">{fmtDateTime(inv.createdAt)}</div>
          <button onClick={() => window.print()} className="mt-2 rounded-md border px-3 py-1.5 text-sm print:hidden"><Printer className="mr-1 inline h-4 w-4" /> Print</button>
        </div>
      </div>

      <div className="mb-4 text-sm"><span className="text-muted-foreground">Billed to: </span><span className="font-medium">{inv.patientName}</span></div>

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

      <div className="ml-auto mt-4 w-64 space-y-1 text-sm">
        <Row label="Subtotal" value={inv.subtotal} />
        <Row label={`GST (${inv.gstRate}%)`} value={inv.gstAmount} />
        <Row label="Total" value={inv.total} strong />
        <Row label="Paid" value={inv.amountPaid} />
        {inv.amountRefunded > 0 && <Row label="Refunded" value={inv.amountRefunded} />}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">Status: {inv.status.replace('_', ' ')} · Thank you.</p>
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
