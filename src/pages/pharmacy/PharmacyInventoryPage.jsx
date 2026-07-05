import { useMemo, useState } from 'react';
import { Package, Plus, Trash, WarningCircle, CurrencyInr, Prohibit, Stack } from '@phosphor-icons/react';
import { PageHeader, StatCard, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useBatches, useInventorySummary, useMedicines, useCreateBatch, useUpdateBatch, useRemoveBatch } from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { fmtDate, todayISODate } from '@/lib/format';
import { cn } from '@/lib/utils';

const inr = (v) => (v == null ? '—' : `₹${(Math.round(v * 100) / 100).toLocaleString('en-IN')}`);

const EXPIRY_META = {
  expired: { label: 'Expired', cls: 'bg-destructive/10 text-destructive' },
  expiring: { label: 'Expiring', cls: 'bg-warning/15 text-warning' },
  ok: { label: 'In date', cls: 'bg-success/10 text-success' },
};
function ExpiryBadge({ status }) {
  const m = EXPIRY_META[status] || EXPIRY_META.ok;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', m.cls)}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{m.label}</span>;
}

export default function PharmacyInventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Stock as batches — each with its own expiry, quantity, and cost. Availability excludes expired stock." />
      <FeatureGate feature="PHARMACY_MANAGEMENT">
        <InventoryBody />
      </FeatureGate>
    </div>
  );
}

function InventoryBody() {
  const canManage = useHasRole('owner', 'pharmacy_owner', 'pharmacy_manager');
  const canDelete = useHasRole('owner', 'pharmacy_owner');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // batch or {} for new
  const [removing, setRemoving] = useState(null);
  const { data, isLoading, isError, error, refetch } = useBatches({});
  const { data: summary, isLoading: summaryLoading } = useInventorySummary();
  const removeBatch = useRemoveBatch();
  const items = data?.items || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((b) => [b.medicineName, b.medicineBrand, b.batchNo].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const doRemove = async () => {
    try {
      await removeBatch.mutateAsync(removing._id);
      toast.success('Batch removed');
      setRemoving(null);
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    {
      key: 'medicine', header: 'Medicine', render: (b) => (
        <span className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{b.medicineName}</span>
          {b.medicineBrand && <span className="block truncate text-xs text-muted-foreground">{b.medicineBrand}</span>}
        </span>
      ),
    },
    { key: 'batchNo', header: 'Batch', className: 'font-mono text-xs text-muted-foreground', render: (b) => b.batchNo || '—' },
    { key: 'expiryDate', header: 'Expiry', render: (b) => (
      <span className="flex items-center gap-2">
        <span className="tabular text-sm">{b.expiryDate ? fmtDate(b.expiryDate) : '—'}</span>
        <ExpiryBadge status={b.expiryStatus} />
      </span>
    ) },
    { key: 'quantityInStock', header: 'Qty', align: 'right', render: (b) => <span className="font-semibold tabular">{b.quantityInStock} <span className="text-xs font-normal text-muted-foreground">{b.unit}</span></span> },
    { key: 'purchaseUnitCost', header: 'Unit cost', align: 'right', render: (b) => inr(b.purchaseUnitCost) },
    { key: 'value', header: 'Value', align: 'right', render: (b) => inr((b.quantityInStock || 0) * (b.purchaseUnitCost || 0)) },
    {
      key: 'actions', header: '', align: 'right', render: (b) => canDelete ? (
        <Button variant="ghost" size="icon" aria-label="Delete" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoving(b); }}>
          <Trash className="h-4 w-4" />
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Stock value" value={inr(summary?.stockValue)} icon={CurrencyInr} loading={summaryLoading} hint={`${summary?.totalBatches ?? 0} batches`} />
        <StatCard label="Low stock" value={summary?.lowStockCount ?? 0} icon={WarningCircle} loading={summaryLoading} hint="medicines at/below reorder" />
        <StatCard label="Expiring soon" value={summary?.expiringBatches ?? 0} icon={Stack} loading={summaryLoading} hint={`within ${summary?.nearExpiryDays ?? 60} days`} />
        <StatCard label="Expired" value={summary?.expiredBatches ?? 0} icon={Prohibit} loading={summaryLoading} hint="excluded from availability" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={canManage ? (b) => setEditing(b) : undefined}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by medicine or batch no…' }}
        toolbar={canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add stock</Button> : null}
        empty={{
          icon: Package,
          title: 'No stock yet',
          description: 'Add a stock batch — pick a medicine, its batch number, expiry, quantity and cost.',
          action: canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add stock</Button> : null,
        }}
      />

      {editing && <BatchFormDialog batch={editing} onClose={() => setEditing(null)} />}

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove this batch?</DialogTitle>
            <DialogDescription>
              {removing?.medicineName} · batch {removing?.batchNo || '—'} · {removing?.quantityInStock} {removing?.unit}. Soft-deleted and kept in history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doRemove} disabled={removeBatch.isPending}>
              {removeBatch.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BatchFormDialog({ batch, onClose }) {
  const isEdit = !!batch._id;
  const create = useCreateBatch();
  const update = useUpdateBatch();
  const medicines = useMedicines({}).data?.items || [];
  const [form, setForm] = useState({
    medicineId: batch.medicineId || '',
    batchNo: batch.batchNo || '',
    expiryDate: batch.expiryDate ? String(batch.expiryDate).slice(0, 10) : '',
    quantityInStock: batch.quantityInStock ?? '',
    purchaseUnitCost: batch.purchaseUnitCost ?? '',
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const busy = create.isPending || update.isPending;
  const valid = form.medicineId && form.expiryDate && form.quantityInStock !== '' && Number(form.quantityInStock) >= 0;

  const submit = async () => {
    if (!valid) { toast.error('Pick a medicine, expiry date and quantity.'); return; }
    const payload = {
      batchNo: form.batchNo,
      expiryDate: form.expiryDate,
      quantityInStock: Number(form.quantityInStock),
      purchaseUnitCost: form.purchaseUnitCost === '' ? 0 : Number(form.purchaseUnitCost),
    };
    try {
      if (isEdit) await update.mutateAsync({ id: batch._id, ...payload });
      else await create.mutateAsync({ medicineId: form.medicineId, ...payload });
      toast.success(isEdit ? 'Batch updated' : 'Stock added');
      onClose();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit stock batch' : 'Add stock'}</DialogTitle>
          <DialogDescription>{isEdit ? batch.medicineName : 'A batch is a specific lot with its own expiry and cost.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Medicine <span className="text-destructive">*</span></Label>
              {medicines.length ? (
                <Select value={form.medicineId} onValueChange={set('medicineId')}>
                  <SelectTrigger><SelectValue placeholder="Select a medicine" /></SelectTrigger>
                  <SelectContent>
                    {medicines.map((m) => <SelectItem key={m._id} value={m._id}>{m.name}{m.strength ? ` · ${m.strength}` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">Add a medicine in the Medicines tab first.</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Batch number</Label>
              <Input value={form.batchNo} onChange={(e) => set('batchNo')(e.target.value)} placeholder="e.g. B2409" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Expiry date <span className="text-destructive">*</span></Label>
              <Input type="date" min={todayISODate()} value={form.expiryDate} onChange={(e) => set('expiryDate')(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Quantity <span className="text-destructive">*</span></Label>
              <Input type="number" min="0" value={form.quantityInStock} onChange={(e) => set('quantityInStock')(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Unit cost (₹)</Label>
              <Input type="number" min="0" step="0.01" value={form.purchaseUnitCost} onChange={(e) => set('purchaseUnitCost')(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !valid}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add stock'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
