import { useEffect, useMemo, useRef, useState } from 'react';
import { Pill, Plus, Trash, Package, WarningCircle, ImageSquare, ShieldCheck } from '@phosphor-icons/react';
import { PageHeader, StatCard, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  useMedicines, useMedicineMeta, useInventorySummary,
  useCreateMedicine, useUpdateMedicine, useRemoveMedicine, useUploadMedicineImage,
} from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';

const inr = (v) => (v == null ? '—' : `₹${(Math.round(v * 100) / 100).toLocaleString('en-IN')}`);

/* Rx badge — schedule class drives the label; H/H1/X always need a prescription (§12). */
function RxBadge({ medicine }) {
  if (!medicine.prescriptionRequired && medicine.scheduleClass === 'OTC') {
    return <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">OTC</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
      <ShieldCheck weight="fill" className="h-3 w-3" /> Rx{medicine.scheduleClass !== 'OTC' ? ` · ${medicine.scheduleClass}` : ''}
    </span>
  );
}

function Thumb({ url, name }) {
  if (url) return <img src={url} alt={name} className="h-10 w-10 shrink-0 rounded-lg border object-cover" />;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Pill weight="duotone" className="h-5 w-5" />
    </span>
  );
}

export default function PharmacyMedicinesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Medicines" description="Your pharmacy's product catalog — used for stock, dispensing, and the online store." />
      <FeatureGate feature="PHARMACY_MANAGEMENT">
        <MedicinesBody />
      </FeatureGate>
    </div>
  );
}

function MedicinesBody() {
  const canManage = useHasRole('owner', 'pharmacy_owner', 'pharmacy_manager');
  const canDelete = useHasRole('owner', 'pharmacy_owner');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // medicine object or {} for new
  const [removing, setRemoving] = useState(null);
  const { data, isLoading, isError, error, refetch } = useMedicines({});
  const { data: summary, isLoading: summaryLoading } = useInventorySummary();
  const removeMedicine = useRemoveMedicine();
  const items = data?.items || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => [m.name, m.brand, m.composition, m.sku, m.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const doRemove = async () => {
    try {
      await removeMedicine.mutateAsync(removing._id);
      toast.success('Medicine removed');
      setRemoving(null);
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    {
      key: 'name', header: 'Medicine', render: (m) => (
        <span className="flex items-center gap-3">
          <Thumb url={m.imageUrl} name={m.name} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{m.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {[m.brand, m.strength].filter(Boolean).join(' · ') || m.composition || '—'}
            </span>
          </span>
        </span>
      ),
    },
    { key: 'category', header: 'Category', render: (m) => m.category ? <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">{m.category}</span> : <span className="text-muted-foreground">—</span> },
    { key: 'rx', header: 'Type', render: (m) => <RxBadge medicine={m} /> },
    { key: 'price', header: 'Price', align: 'right', render: (m) => inr(m.sellingPrice) },
    {
      key: 'available', header: 'In stock', align: 'right', render: (m) => (
        <span className="inline-flex items-center justify-end gap-2">
          {m.expiringSoonQty > 0 && <span title={`${m.expiringSoonQty} expiring soon`} className="h-2 w-2 rounded-full bg-warning" />}
          <span className={cn('font-semibold tabular', m.lowStock ? 'text-warning' : m.available > 0 ? 'text-foreground' : 'text-muted-foreground')}>
            {m.available}
          </span>
          {m.lowStock && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-warning">Low</span>}
        </span>
      ),
    },
    {
      key: 'actions', header: '', align: 'right', render: (m) => canDelete ? (
        <Button variant="ghost" size="icon" aria-label="Delete" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoving(m); }}>
          <Trash className="h-4 w-4" />
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Medicines" value={summary?.totalMedicines ?? items.length} icon={Pill} loading={summaryLoading && isLoading} />
        <StatCard label="Stock value" value={inr(summary?.stockValue)} icon={Package} loading={summaryLoading} hint="non-expired batches, at cost" />
        <StatCard label="Low stock" value={summary?.lowStockCount ?? 0} icon={WarningCircle} loading={summaryLoading} hint="at or below reorder level" />
        <StatCard label="Expiring soon" value={summary?.expiringBatches ?? 0} icon={WarningCircle} loading={summaryLoading} hint={`within ${summary?.nearExpiryDays ?? 60} days`} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={canManage ? (m) => setEditing(m) : undefined}
        search={{ value: search, onChange: setSearch, placeholder: 'Search medicines, brands, salts…' }}
        toolbar={canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add medicine</Button> : null}
        empty={{
          icon: Pill,
          title: 'No medicines yet',
          description: 'Build your catalog — add the medicines your pharmacy stocks and sells.',
          action: canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add medicine</Button> : null,
        }}
      />

      {editing && <MedicineFormDialog medicine={editing} onClose={() => setEditing(null)} />}

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>
              It's removed from your catalog but kept in history (soft-deleted). Existing stock batches are unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doRemove} disabled={removeMedicine.isPending}>
              {removeMedicine.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const BLANK = {
  name: '', brand: '', composition: '', category: '', form: 'tablet', strength: '', unit: 'strip',
  sku: '', scheduleClass: 'OTC', prescriptionRequired: false, sellingPrice: '', gstRate: '', hsnCode: '',
  reorderLevel: '', description: '', dosageInfo: '', active: true,
};

function MedicineFormDialog({ medicine, onClose }) {
  const isEdit = !!medicine._id;
  const meta = useMedicineMeta().data || { forms: [], units: [], scheduleClasses: [] };
  const create = useCreateMedicine();
  const update = useUpdateMedicine();
  const uploadImage = useUploadMedicineImage();
  const fileInput = useRef(null);
  const blobUrlRef = useRef(null); // track the preview object URL so we can revoke it (no leak)
  const [form, setForm] = useState(() => ({ ...BLANK, ...Object.fromEntries(Object.entries(medicine).map(([k, v]) => [k, v == null ? BLANK[k] ?? '' : v])) }));
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(medicine.imageUrl || null);
  // Once a NEW medicine is created, remember its id: if a later step (image upload) fails and the
  // user retries, we must UPDATE that record — never create a second duplicate. Persists across renders.
  const [createdId, setCreatedId] = useState(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const rxForced = ['H', 'H1', 'X'].includes(form.scheduleClass);
  const busy = create.isPending || update.isPending || uploadImage.isPending;

  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast.error('Please choose an image file.'); return; }
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(f);
    blobUrlRef.current = url;
    setFile(f);
    setPreview(url);
  };

  const submit = async () => {
    if (!form.name.trim()) { toast.error('A medicine name is required.'); return; }
    const payload = {
      ...form,
      prescriptionRequired: rxForced ? true : !!form.prescriptionRequired,
      sellingPrice: form.sellingPrice === '' ? null : Number(form.sellingPrice),
      gstRate: form.gstRate === '' ? 0 : Number(form.gstRate),
      reorderLevel: form.reorderLevel === '' ? 0 : Number(form.reorderLevel),
    };
    try {
      // Use the existing id (edit) or one we already created on a prior attempt; otherwise create once.
      let id = medicine._id || createdId;
      if (id) {
        await update.mutateAsync({ id, ...payload });
      } else {
        const saved = await create.mutateAsync(payload);
        id = saved?._id;
        setCreatedId(id); // so a retry after an image-upload failure patches, never re-creates
      }
      if (file && id) await uploadImage.mutateAsync({ id, file });
      toast.success(isEdit ? 'Medicine updated' : 'Medicine added');
      onClose();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit medicine' : 'Add medicine'}</DialogTitle>
          <DialogDescription>Catalog definition — shared across branches. Stock is added separately in Inventory.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Image + identity */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition-colors hover:border-primary/50"
              aria-label="Upload medicine image"
            >
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImageSquare weight="duotone" className="h-7 w-7 text-muted-foreground" />}
              <span className="absolute inset-x-0 bottom-0 bg-foreground/60 py-0.5 text-center text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                {preview ? 'Change' : 'Add photo'}
              </span>
            </button>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={pickFile} />
            <div className="grid flex-1 gap-3">
              <Field label="Name" required>
                <Input value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="Paracetamol 500mg" maxLength={200} autoFocus />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Brand"><Input value={form.brand} onChange={(e) => set('brand')(e.target.value)} placeholder="Calpol" maxLength={200} /></Field>
                <Field label="Salt / composition"><Input value={form.composition} onChange={(e) => set('composition')(e.target.value)} placeholder="Paracetamol" maxLength={300} /></Field>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Category"><Input value={form.category} onChange={(e) => set('category')(e.target.value)} placeholder="Analgesic" maxLength={120} /></Field>
            <Field label="Form">
              <Select value={form.form} onValueChange={set('form')}>
                <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                <SelectContent>{meta.forms.map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Strength"><Input value={form.strength} onChange={(e) => set('strength')(e.target.value)} placeholder="500mg" maxLength={60} /></Field>
            <Field label="Stock unit">
              <Select value={form.unit} onValueChange={set('unit')}>
                <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                <SelectContent>{meta.units.map((u) => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="SKU"><Input value={form.sku} onChange={(e) => set('sku')(e.target.value)} placeholder="Optional" maxLength={60} /></Field>
            <Field label="Reorder level"><Input type="number" min="0" value={form.reorderLevel} onChange={(e) => set('reorderLevel')(e.target.value)} placeholder="0" /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Selling price (₹)"><Input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => set('sellingPrice')(e.target.value)} placeholder="0.00" /></Field>
            <Field label="GST rate (%)"><Input type="number" min="0" max="100" step="0.01" value={form.gstRate} onChange={(e) => set('gstRate')(e.target.value)} placeholder="0" /></Field>
            <Field label="HSN code"><Input value={form.hsnCode} onChange={(e) => set('hsnCode')(e.target.value)} placeholder="3004" maxLength={20} /></Field>
          </div>

          {/* Compliance */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Drug schedule">
                <Select value={form.scheduleClass} onValueChange={set('scheduleClass')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{meta.scheduleClasses.map((s) => <SelectItem key={s} value={s}>{s === 'OTC' ? 'OTC (over the counter)' : `Schedule ${s}`}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 text-sm">
                  <Switch checked={rxForced ? true : !!form.prescriptionRequired} onCheckedChange={set('prescriptionRequired')} disabled={rxForced} aria-label="Prescription required" />
                  <span className={cn('font-medium', rxForced && 'text-muted-foreground')}>Prescription required</span>
                </label>
              </div>
            </div>
            {rxForced && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck weight="fill" className="h-3.5 w-3.5 text-destructive" /> Schedule {form.scheduleClass} drugs always require a valid prescription.
              </p>
            )}
          </div>

          <Field label="Standard dosage info"><Textarea value={form.dosageInfo} onChange={(e) => set('dosageInfo')(e.target.value)} placeholder="e.g. 1 tablet twice daily after food" rows={2} maxLength={1000} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => set('description')(e.target.value)} placeholder="Product details shown on the store" rows={2} maxLength={2000} /></Field>

          {isEdit && (
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={!!form.active} onCheckedChange={set('active')} aria-label="Active" />
              <span className="font-medium">Active</span>
              <span className="text-muted-foreground">— inactive medicines are hidden from dispensing and the store.</span>
            </label>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !form.name.trim()}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add medicine'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
