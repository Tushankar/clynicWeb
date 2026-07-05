import { useMemo, useState } from 'react';
import { ShoppingBag, ShieldCheck, CurrencyInr, ClipboardText, FileText, CheckCircle, XCircle } from '@phosphor-icons/react';
import { PageHeader, StatCard, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  useStoreOrders, useStoreOrder,
  useVerifyStoreOrder, useRejectStoreOrder, useFulfillStoreOrder, useCancelStoreOrder,
} from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { fmtDate, inr } from '@/lib/format';
import { cn } from '@/lib/utils';

/* -------------------------------- badges -------------------------------- */

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-warning/15 text-warning' },
  verified: { label: 'Verified', cls: 'bg-info/10 text-info' },
  fulfilled: { label: 'Fulfilled', cls: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', cls: 'bg-destructive/10 text-destructive' },
};
const PAYMENT = {
  unpaid: { label: 'Unpaid', cls: 'bg-warning/15 text-warning' },
  paid: { label: 'Paid', cls: 'bg-success/10 text-success' },
};
const VERIFY = {
  not_required: { label: 'No Rx', cls: 'bg-secondary text-secondary-foreground' },
  pending: { label: 'Rx pending', cls: 'bg-warning/15 text-warning' },
  verified: { label: 'Rx verified', cls: 'bg-success/10 text-success' },
  rejected: { label: 'Rx rejected', cls: 'bg-destructive/10 text-destructive' },
};

function Pill({ map, value }) {
  const cfg = map[value] || { label: value, cls: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

const patientName = (o) => o.patient?.name || o.patientName || o.customerName || o.contactName || o.patient?.email || o.contactEmail || '—';

/* -------------------------------- page -------------------------------- */

export default function PharmacyOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Store Orders" description="Online pharmacy orders — verify prescriptions, take payments and fulfil from stock." />
      <FeatureGate feature="PHARMACY_STOREFRONT">
        <OrdersBody />
      </FeatureGate>
    </div>
  );
}

function OrdersBody() {
  const canManage = useHasRole('owner', 'pharmacy_owner', 'pharmacy_manager');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const { data, isLoading, isError, error, refetch } = useStoreOrders(status === 'all' ? {} : { status });
  const items = data?.items || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((o) => [o.orderNumber, patientName(o)].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const stats = useMemo(() => ({
    total: items.length,
    pendingRx: items.filter((o) => o.verificationStatus === 'pending').length,
    unpaid: items.filter((o) => o.paymentStatus === 'unpaid' && o.status !== 'cancelled').length,
    revenue: items.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + (Number(o.total) || 0), 0),
  }), [items]);

  const columns = [
    { key: 'orderNumber', header: 'Order', render: (o) => <span className="font-semibold text-foreground">{o.orderNumber}</span> },
    { key: 'patient', header: 'Patient', render: (o) => <span className="block max-w-[180px] truncate text-muted-foreground">{patientName(o)}</span> },
    { key: 'total', header: 'Total', align: 'right', render: (o) => inr(o.total) },
    { key: 'payment', header: 'Payment', render: (o) => <Pill map={PAYMENT} value={o.paymentStatus} /> },
    { key: 'verify', header: 'Prescription', render: (o) => <Pill map={VERIFY} value={o.verificationStatus} /> },
    { key: 'status', header: 'Status', render: (o) => <Pill map={STATUS} value={o.status} /> },
    { key: 'date', header: 'Date', align: 'right', render: (o) => <span className="text-muted-foreground">{o.createdAt ? fmtDate(o.createdAt) : '—'}</span> },
  ];

  const statusFilter = (
    <Select value={status} onValueChange={(v) => setStatus(v)}>
      <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="verified">Verified</SelectItem>
        <SelectItem value="fulfilled">Fulfilled</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders" value={stats.total} icon={ShoppingBag} loading={isLoading} />
        <StatCard label="Rx to review" value={stats.pendingRx} icon={ShieldCheck} loading={isLoading} hint="prescriptions pending" />
        <StatCard label="Unpaid" value={stats.unpaid} icon={ClipboardText} loading={isLoading} hint="awaiting payment" />
        <StatCard label="Paid revenue" value={inr(stats.revenue)} icon={CurrencyInr} loading={isLoading} hint="this list" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(o) => setSelectedId(o._id || o.id)}
        search={{ value: search, onChange: setSearch, placeholder: 'Search order # or patient…' }}
        toolbar={statusFilter}
        empty={{ icon: ShoppingBag, title: 'No store orders yet', description: 'Orders placed in your online store will appear here to verify, charge and fulfil.' }}
      />

      {selectedId && (
        <OrderDetailDialog id={selectedId} canManage={canManage} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

/* ---------------------------- detail dialog ---------------------------- */

function OrderDetailDialog({ id, canManage, onClose }) {
  const canCancel = useHasRole('owner', 'pharmacy_owner'); // cancel is admin-only (backend-gated)
  const { data: order, isLoading } = useStoreOrder(id);
  const verify = useVerifyStoreOrder();
  const reject = useRejectStoreOrder();
  const fulfill = useFulfillStoreOrder();
  const cancel = useCancelStoreOrder();
  const [mode, setMode] = useState(null); // 'reject' | 'cancel'
  const [reason, setReason] = useState('');
  const busy = verify.isPending || reject.isPending || fulfill.isPending || cancel.isPending;

  const run = async (fn, okMsg) => {
    try {
      await fn();
      toast.success(okMsg);
      setMode(null);
      setReason('');
    } catch (e) {
      toastApiError(e);
    }
  };

  // Trust the server MIME type: inline <img> only for images; PDFs (and unknown types) get a
  // "View prescription" link that opens the signed URL in a new tab.
  const isImage = /image/i.test(order?.prescriptionMimeType || '');
  const canFulfill = order && order.paymentStatus === 'paid'
    && (order.verificationStatus === 'not_required' || order.verificationStatus === 'verified')
    && !['fulfilled', 'cancelled'].includes(order.status);
  const canReview = order && order.verificationStatus === 'pending';
  // Cancel is admin-only on the backend (owner / pharmacy_owner) — mirror that here so a
  // pharmacy_manager never sees a button that would 403.
  const cancellable = order && !['fulfilled', 'cancelled'].includes(order.status);
  const showCancel = canCancel && cancellable;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isLoading ? 'Order' : order?.orderNumber}</DialogTitle>
          <DialogDescription>
            {isLoading ? 'Loading…' : `${patientName(order)}${order?.createdAt ? ` · ${fmtDate(order.createdAt)}` : ''}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !order ? (
          <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill map={STATUS} value={order.status} />
              <Pill map={PAYMENT} value={order.paymentStatus} />
              {order.requiresPrescription ? <Pill map={VERIFY} value={order.verificationStatus} /> : null}
            </div>

            {/* items */}
            <div className="divide-y rounded-xl border">
              {order.items?.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{it.medicineName}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.qty}{it.unit ? ` · ${it.unit}` : ''} · {inr(it.unitPrice)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular">{inr((Number(it.unitPrice) || 0) * it.qty)}</span>
                </div>
              ))}
            </div>

            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular font-medium">{inr(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">GST</dt><dd className="tabular font-medium">{inr(order.gstAmount)}</dd></div>
              <div className="flex justify-between border-t pt-1.5"><dt className="font-semibold">Total</dt><dd className="tabular text-base font-semibold">{inr(order.total)}</dd></div>
            </dl>

            {/* prescription */}
            {order.requiresPrescription ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck weight="fill" className="h-4 w-4 text-destructive" /> Prescription
                  <span className="ml-auto"><Pill map={VERIFY} value={order.verificationStatus} /></span>
                </p>
                {order.rejectionReason && order.verificationStatus === 'rejected' ? (
                  <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">Rejected: {order.rejectionReason}</p>
                ) : null}
                {order.hasPrescription && order.prescriptionUrl ? (
                  isImage ? (
                    <a href={order.prescriptionUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-lg border">
                      <img src={order.prescriptionUrl} alt="Uploaded prescription" className="max-h-72 w-full bg-card object-contain" />
                    </a>
                  ) : (
                    <a href={order.prescriptionUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-primary hover:border-primary/40">
                      <FileText className="h-4 w-4" /> View prescription
                    </a>
                  )
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">No prescription uploaded yet.</p>
                )}
              </div>
            ) : null}

            {/* reason input */}
            {mode ? (
              <div className="space-y-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <Label className="text-sm font-medium">{mode === 'reject' ? 'Reason for rejecting the prescription' : 'Reason for cancelling'}</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Shared with the patient" maxLength={500} autoFocus />
              </div>
            ) : null}
          </div>
        )}

        {canManage && order && (
          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {showCancel && (
                <Button variant="outline" className="text-destructive hover:text-destructive" disabled={busy}
                  onClick={() => (mode === 'cancel' ? run(() => cancel.mutateAsync({ id, reason }), 'Order cancelled') : setMode('cancel'))}>
                  <XCircle className="h-4 w-4" /> {mode === 'cancel' ? 'Confirm cancel' : 'Cancel order'}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {canReview && (
                <>
                  <Button variant="outline" disabled={busy}
                    onClick={() => (mode === 'reject' ? run(() => reject.mutateAsync({ id, reason }), 'Prescription rejected') : setMode('reject'))}>
                    <XCircle className="h-4 w-4" /> {mode === 'reject' ? 'Confirm reject' : 'Reject Rx'}
                  </Button>
                  <Button disabled={busy || mode === 'reject'} onClick={() => run(() => verify.mutateAsync(id), 'Prescription verified')}>
                    <CheckCircle className="h-4 w-4" /> Verify Rx
                  </Button>
                </>
              )}
              {canFulfill && (
                <Button disabled={busy} onClick={() => run(() => fulfill.mutateAsync(id), 'Order fulfilled')}>
                  <ShoppingBag className="h-4 w-4" /> Fulfil order
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
