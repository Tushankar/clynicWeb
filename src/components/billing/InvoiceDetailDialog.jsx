import { useState, useEffect } from 'react';
import { Printer, CreditCard, IndianRupee, Undo2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/primitives';
import { useInvoice, useRecordPayment, useRefund, usePayOnline } from '@/hooks/useBilling';
import { useHasRole } from '@/hooks/useRole';
import { fmtDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast, toastApiError } from '@/lib/toast';

const STATUS_CLS = {
  paid: 'bg-success/10 text-success',
  partially_paid: 'bg-warning/15 text-warning',
  unpaid: 'bg-secondary text-secondary-foreground',
  refunded: 'bg-info/10 text-info',
  cancelled: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
};

export function InvoiceDetailDialog({ invoiceId, open, onOpenChange }) {
  const isOwner = useHasRole('owner');
  const { data: inv, isLoading } = useInvoice(open ? invoiceId : null);
  const recordPayment = useRecordPayment();
  const refund = useRefund();
  const payOnline = usePayOnline();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');

  const outstanding = inv ? Math.round((inv.total - inv.amountPaid) * 100) / 100 : 0;
  useEffect(() => {
    if (inv) setAmount(String(outstanding > 0 ? outstanding : ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inv?._id, inv?.amountPaid]);

  const take = async () => {
    try {
      await recordPayment.mutateAsync({ id: inv._id, amount: Number(amount), method });
      toast.success('Payment recorded');
    } catch (e) {
      toastApiError(e);
    }
  };
  const pay = async () => {
    try {
      await payOnline.mutateAsync(inv._id);
      toast.success('Online payment verified & recorded');
    } catch (e) {
      toastApiError(e);
    }
  };
  const doRefund = async () => {
    try {
      await refund.mutateAsync({ id: inv._id, amount: inv.amountPaid, reason: 'Refund' });
      toast.success('Refund issued');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{inv ? inv.invoiceNumber : 'Invoice'}</DialogTitle>
        </DialogHeader>
        {isLoading || !inv ? (
          <LoadingSkeleton lines={6} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm"><span className="font-medium">{inv.patientName}</span> · {fmtDateTime(inv.createdAt)}</div>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_CLS[inv.status] || 'bg-muted')}>{inv.status.replace('_', ' ')}</span>
            </div>

            <div className="rounded-md border">
              {inv.items.map((it, i) => (
                <div key={i} className="flex justify-between border-b px-3 py-2 text-sm last:border-0">
                  <span>{it.description}{it.quantity > 1 ? ` × ${it.quantity}` : ''}</span>
                  <span className="tabular">₹{Math.round(it.amount * it.quantity * 100) / 100}</span>
                </div>
              ))}
              <div className="space-y-1 px-3 py-2 text-sm">
                <Row label="Subtotal" value={inv.subtotal} />
                <Row label={`GST (${inv.gstRate}%)`} value={inv.gstAmount} />
                <Row label="Total" value={inv.total} strong />
                <Row label="Paid" value={inv.amountPaid} />
                {inv.amountRefunded > 0 && <Row label="Refunded" value={inv.amountRefunded} />}
              </div>
            </div>

            {outstanding > 0 && (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                <div className="text-sm font-medium">Take payment (outstanding ₹{outstanding})</div>
                <div className="flex gap-2">
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28" />
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={take} disabled={recordPayment.isPending || !(Number(amount) > 0)}>
                    <IndianRupee className="h-4 w-4" /> Record
                  </Button>
                </div>
                <Button variant="outline" className="w-full" onClick={pay} disabled={payOnline.isPending}>
                  <CreditCard className="h-4 w-4" /> {payOnline.isPending ? 'Processing…' : 'Pay online (Razorpay)'}
                </Button>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => window.open(`/invoice/${inv._id}`, '_blank', 'noopener')}>
                <Printer className="h-4 w-4" /> Print
              </Button>
              {isOwner && inv.amountPaid > inv.amountRefunded && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={doRefund} disabled={refund.isPending}>
                  <Undo2 className="h-4 w-4" /> Refund
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={cn('flex justify-between', strong && 'font-semibold')}>
      <span className={strong ? '' : 'text-muted-foreground'}>{label}</span>
      <span className="tabular">₹{value}</span>
    </div>
  );
}
