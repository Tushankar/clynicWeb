import { useMemo, useState } from 'react';
import { ClipboardText, Plus, Trash, X, CheckCircle, Warehouse, PencilSimple } from '@phosphor-icons/react';
import { PageHeader, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  usePurchaseOrders, useSuppliers, useMedicines,
  useCreatePurchaseOrder, useUpdatePurchaseOrder, useSetPurchaseOrderStatus, useReceivePurchaseOrder, useRemovePurchaseOrder,
} from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const inr = (v) => (v == null ? '₹0' : `₹${(Math.round(v * 100) / 100).toLocaleString('en-IN')}`);

const PO_STATUS = {
  draft: { label: 'Draft', cls: 'bg-secondary text-secondary-foreground' },
  ordered: { label: 'Ordered', cls: 'bg-info/10 text-info' },
  received: { label: 'Received', cls: 'bg-success/10 text-success' },
  cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-foreground' },
};
function StatusPill({ status }) {
  const m = PO_STATUS[status] || PO_STATUS.draft;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', m.cls)}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{m.label}</span>;
}

export default function PharmacyPurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Purchase orders" description="Order stock from suppliers, then receive it — receiving adds inventory batches and records the cost." />
      <FeatureGate feature="SUPPLIER_PROCUREMENT">
        <PurchaseOrdersBody />
      </FeatureGate>
    </div>
  );
}

function PurchaseOrdersBody() {
  const canManage = useHasRole('owner', 'pharmacy_owner', 'pharmacy_manager');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // PO being edited (draft)
  const [detail, setDetail] = useState(null); // PO detail/actions
  const [receiving, setReceiving] = useState(null); // PO being received
  const { data, isLoading, isError, error, refetch } = usePurchaseOrders({});
  const items = data?.items || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => [p.poNumber, p.supplierName].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const columns = [
    { key: 'poNumber', header: 'PO', className: 'font-mono text-xs text-muted-foreground', render: (p) => p.poNumber },
    { key: 'supplierName', header: 'Supplier', render: (p) => <span className="font-semibold text-foreground">{p.supplierName || '—'}</span> },
    { key: 'items', header: 'Items', align: 'right', render: (p) => (p.items?.length || 0) },
    { key: 'totalCost', header: 'Total', align: 'right', render: (p) => inr(p.totalCost) },
    { key: 'status', header: 'Status', render: (p) => <StatusPill status={p.status} /> },
    { key: 'date', header: 'Created', align: 'right', render: (p) => fmtDate(p.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(p) => setDetail(p)}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by PO number or supplier…' }}
        toolbar={canManage ? <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> New purchase order</Button> : null}
        empty={{
          icon: ClipboardText,
          title: 'No purchase orders yet',
          description: 'Raise a purchase order to a supplier; receiving it adds the stock to your inventory.',
          action: canManage ? <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> New purchase order</Button> : null,
        }}
      />

      {(formOpen || editing) && (
        <PurchaseOrderFormDialog po={editing} onClose={() => { setFormOpen(false); setEditing(null); }} />
      )}
      {detail && (
        <PODetailDialog
          po={detail}
          canManage={canManage}
          onClose={() => setDetail(null)}
          onEdit={(p) => { setDetail(null); setEditing(p); }}
          onReceive={(p) => { setDetail(null); setReceiving(p); }}
        />
      )}
      {receiving && <ReceiveDialog po={receiving} onClose={() => setReceiving(null)} />}
    </div>
  );
}

/* ------------------------------ Detail + actions ------------------------------ */

function PODetailDialog({ po, canManage, onClose, onEdit, onReceive }) {
  const setStatus = useSetPurchaseOrderStatus();
  const removePO = useRemovePurchaseOrder();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const act = async (fn, msg) => { try { await fn(); toast.success(msg); onClose(); } catch (e) { toastApiError(e); } };
  const markOrdered = () => act(() => setStatus.mutateAsync({ id: po._id, status: 'ordered' }), 'Marked as ordered');
  const cancel = () => act(() => setStatus.mutateAsync({ id: po._id, status: 'cancelled' }), 'Purchase order cancelled');
  const del = () => act(() => removePO.mutateAsync(po._id), 'Purchase order deleted');
  const busy = setStatus.isPending || removePO.isPending;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><span className="font-mono">{po.poNumber}</span> <StatusPill status={po.status} /></DialogTitle>
          <DialogDescription>
            {po.supplierName} · created {fmtDate(po.createdAt)}{po.receivedAt ? ` · received ${fmtDate(po.receivedAt)}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Medicine</th>
                <th className="px-3 py-2 text-right font-medium">Qty</th>
                <th className="px-3 py-2 text-right font-medium">Unit cost</th>
                <th className="px-3 py-2 text-left font-medium">Batch</th>
                <th className="px-3 py-2 text-left font-medium">Expiry</th>
                <th className="px-3 py-2 text-right font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {(po.items || []).map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{it.medicineName || '—'}</td>
                  <td className="px-3 py-2 text-right tabular">{it.qty} {it.unit}</td>
                  <td className="px-3 py-2 text-right tabular">{inr(it.unitCost)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{it.batchNo || '—'}</td>
                  <td className="px-3 py-2 text-xs">{it.expiryDate ? fmtDate(it.expiryDate) : '—'}</td>
                  <td className="px-3 py-2 text-right tabular">{inr((it.qty || 0) * (it.unitCost || 0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/30">
              <tr>
                <td className="px-3 py-2 font-medium" colSpan={5}>Total</td>
                <td className="px-3 py-2 text-right font-semibold tabular">{inr(po.totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {po.notes && <p className="text-sm text-muted-foreground">{po.notes}</p>}

        {canManage && po.status !== 'received' && po.status !== 'cancelled' && (
          <DialogFooter className="flex-wrap gap-2">
            {po.status === 'draft' && <Button variant="outline" onClick={() => onEdit(po)}><PencilSimple className="h-4 w-4" /> Edit</Button>}
            {po.status === 'draft' && <Button variant="outline" onClick={markOrdered} disabled={busy}>Mark as ordered</Button>}
            <Button variant="outline" className="text-destructive" onClick={cancel} disabled={busy}><X className="h-4 w-4" /> Cancel PO</Button>
            {po.status === 'draft' && <Button variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(true)} disabled={busy}><Trash className="h-4 w-4" /> Delete</Button>}
            <Button onClick={() => onReceive(po)}><Warehouse className="h-4 w-4" /> Receive stock</Button>
          </DialogFooter>
        )}
        {po.status === 'received' && (
          <p className="flex items-center gap-1.5 text-sm text-success"><CheckCircle weight="fill" className="h-4 w-4" /> Stock received into inventory and the cost recorded.</p>
        )}

        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Delete {po.poNumber}?</DialogTitle><DialogDescription>This draft purchase order will be removed (soft-deleted).</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Keep it</Button>
              <Button variant="destructive" onClick={del} disabled={busy}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Create / edit ------------------------------ */

const BLANK_LINE = { medicineId: '', medicineName: '', qty: '1', unitCost: '', batchNo: '', expiryDate: '' };

function PurchaseOrderFormDialog({ po, onClose }) {
  const isEdit = !!po?._id;
  const suppliers = useSuppliers({}).data?.items || [];
  const medicines = useMedicines({}).data?.items || [];
  const create = useCreatePurchaseOrder();
  const update = useUpdatePurchaseOrder();
  const [supplierId, setSupplierId] = useState(po?.supplierId || '');
  const [notes, setNotes] = useState(po?.notes || '');
  const [lines, setLines] = useState(() =>
    isEdit && po.items?.length
      ? po.items.map((it) => ({ medicineId: String(it.medicineId), medicineName: it.medicineName || '', qty: String(it.qty), unitCost: it.unitCost != null ? String(it.unitCost) : '', batchNo: it.batchNo || '', expiryDate: it.expiryDate ? String(it.expiryDate).slice(0, 10) : '' }))
      : [{ ...BLANK_LINE }]
  );
  const busy = create.isPending || update.isPending;

  const setLine = (i, k) => (v) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const addLine = () => setLines((ls) => [...ls, { ...BLANK_LINE }]);
  const removeLine = (i) => setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls));
  const total = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitCost) || 0), 0);
  const validLines = lines.filter((l) => l.medicineId && Number(l.qty) >= 1);

  const submit = async () => {
    if (!supplierId) { toast.error('Pick a supplier.'); return; }
    if (!validLines.length) { toast.error('Add at least one line with a medicine and quantity.'); return; }
    const payload = {
      supplierId,
      notes,
      items: validLines.map((l) => ({ medicineId: l.medicineId, qty: Number(l.qty), unitCost: l.unitCost === '' ? 0 : Number(l.unitCost), batchNo: l.batchNo, expiryDate: l.expiryDate || undefined })),
    };
    try {
      if (isEdit) await update.mutateAsync({ id: po._id, ...payload });
      else await create.mutateAsync(payload);
      toast.success(isEdit ? 'Purchase order updated' : 'Purchase order created');
      onClose();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${po.poNumber}` : 'New purchase order'}</DialogTitle>
          <DialogDescription>Order stock from a supplier. You'll confirm batch numbers and expiry dates when you receive it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Supplier <span className="text-destructive">*</span></Label>
            {suppliers.length ? (
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                <SelectContent>{suppliers.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">Add a supplier first (Suppliers tab).</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Line items</Label>
              <Button variant="ghost" size="sm" onClick={addLine} disabled={!medicines.length}><Plus className="h-4 w-4" /> Add line</Button>
            </div>
            {!medicines.length && <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">Add medicines to your catalog first (Medicines tab).</p>}
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 items-end gap-2 rounded-xl border bg-muted/20 p-2.5">
                <div className="col-span-12 space-y-1 sm:col-span-4">
                  <span className="text-[11px] text-muted-foreground">Medicine</span>
                  <Select value={l.medicineId} onValueChange={setLine(i, 'medicineId')}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {/* A medicine deleted after this draft was created isn't in the live list — show its
                          snapshotted name (marked removed) so the line is visible, not blank, and can be re-picked. */}
                      {l.medicineId && l.medicineName && !medicines.some((m) => String(m._id) === l.medicineId) && (
                        <SelectItem value={l.medicineId}>{l.medicineName} (removed)</SelectItem>
                      )}
                      {medicines.map((m) => <SelectItem key={m._id} value={m._id}>{m.name}{m.strength ? ` · ${m.strength}` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 space-y-1 sm:col-span-1">
                  <span className="text-[11px] text-muted-foreground">Qty</span>
                  <Input className="h-9" type="number" min="1" value={l.qty} onChange={(e) => setLine(i, 'qty')(e.target.value)} />
                </div>
                <div className="col-span-4 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Unit cost</span>
                  <Input className="h-9" type="number" min="0" step="0.01" value={l.unitCost} onChange={(e) => setLine(i, 'unitCost')(e.target.value)} placeholder="0" />
                </div>
                <div className="col-span-5 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Batch (opt.)</span>
                  <Input className="h-9" value={l.batchNo} onChange={(e) => setLine(i, 'batchNo')(e.target.value)} />
                </div>
                <div className="col-span-6 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Expiry (opt.)</span>
                  <Input className="h-9" type="date" value={l.expiryDate} onChange={(e) => setLine(i, 'expiryDate')(e.target.value)} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" aria-label="Remove line" onClick={() => removeLine(i)} disabled={lines.length === 1}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pr-12 text-sm">
              <span className="text-muted-foreground">Total:&nbsp;</span><span className="font-semibold tabular">{inr(total)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !supplierId || !validLines.length}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create purchase order'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Receive (GRN) ------------------------------ */

function ReceiveDialog({ po, onClose }) {
  const receive = useReceivePurchaseOrder();
  const [lines, setLines] = useState(() => (po.items || []).map((it) => ({ batchNo: it.batchNo || '', expiryDate: it.expiryDate ? String(it.expiryDate).slice(0, 10) : '' })));
  const setLine = (i, k) => (v) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const allExpiry = (po.items || []).every((_, i) => lines[i]?.expiryDate);

  const submit = async () => {
    if (!allExpiry) { toast.error('Every line needs an expiry date to receive stock.'); return; }
    try {
      await receive.mutateAsync({ id: po._id, items: lines.map((l) => ({ batchNo: l.batchNo, expiryDate: l.expiryDate })) });
      toast.success('Stock received into inventory');
      onClose();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receive {po.poNumber}</DialogTitle>
          <DialogDescription>Confirm the batch number and expiry for each line. This adds the stock to inventory and records ₹{(Math.round((po.totalCost || 0) * 100) / 100).toLocaleString('en-IN')} as a purchase expense.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {(po.items || []).map((it, i) => (
            <div key={i} className="grid grid-cols-12 items-end gap-2 rounded-xl border bg-muted/20 p-2.5">
              <div className="col-span-12 sm:col-span-5">
                <p className="truncate font-medium text-foreground">{it.medicineName}</p>
                <p className="text-xs text-muted-foreground">{it.qty} {it.unit} · {inr(it.unitCost)}/unit</p>
              </div>
              <div className="col-span-6 space-y-1 sm:col-span-3">
                <span className="text-[11px] text-muted-foreground">Batch no.</span>
                <Input className="h-9" value={lines[i]?.batchNo || ''} onChange={(e) => setLine(i, 'batchNo')(e.target.value)} />
              </div>
              <div className="col-span-6 space-y-1 sm:col-span-4">
                <span className="text-[11px] text-muted-foreground">Expiry <span className="text-destructive">*</span></span>
                <Input className="h-9" type="date" value={lines[i]?.expiryDate || ''} onChange={(e) => setLine(i, 'expiryDate')(e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={receive.isPending || !allExpiry}><Warehouse className="h-4 w-4" /> {receive.isPending ? 'Receiving…' : 'Receive into inventory'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
