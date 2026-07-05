import { useMemo, useState } from 'react';
import { Truck, Plus, Trash, Phone, Storefront } from '@phosphor-icons/react';
import { PageHeader, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useRemoveSupplier } from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';

export default function PharmacySuppliersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" description="The distributors and vendors your pharmacy buys stock from." />
      <FeatureGate feature="SUPPLIER_PROCUREMENT">
        <SuppliersBody />
      </FeatureGate>
    </div>
  );
}

function SuppliersBody() {
  const canManage = useHasRole('owner', 'pharmacy_owner', 'pharmacy_manager');
  const canDelete = useHasRole('owner', 'pharmacy_owner');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const { data, isLoading, isError, error, refetch } = useSuppliers({});
  const removeSupplier = useRemoveSupplier();
  const items = data?.items || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => [s.name, s.contactPerson, s.phone, s.gstNumber].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const doRemove = async () => {
    try {
      await removeSupplier.mutateAsync(removing._id);
      toast.success('Supplier removed');
      setRemoving(null);
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    {
      key: 'name', header: 'Supplier', render: (s) => (
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Storefront weight="duotone" className="h-5 w-5" /></span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{s.name}</span>
            {s.gstNumber && <span className="block truncate font-mono text-[11px] text-muted-foreground">GST {s.gstNumber}</span>}
          </span>
        </span>
      ),
    },
    { key: 'contactPerson', header: 'Contact', render: (s) => s.contactPerson || <span className="text-muted-foreground">—</span> },
    { key: 'phone', header: 'Phone', render: (s) => s.phone ? <span className="inline-flex items-center gap-1.5 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{s.phone}</span> : <span className="text-muted-foreground">—</span> },
    { key: 'email', header: 'Email', className: 'text-muted-foreground', render: (s) => s.email || '—' },
    { key: 'active', header: 'Status', render: (s) => s.active
      ? <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
      : <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span> },
    {
      key: 'actions', header: '', align: 'right', render: (s) => canDelete ? (
        <Button variant="ghost" size="icon" aria-label="Delete" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoving(s); }}>
          <Trash className="h-4 w-4" />
        </Button>
      ) : null,
    },
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
        onRowClick={canManage ? (s) => setEditing(s) : undefined}
        search={{ value: search, onChange: setSearch, placeholder: 'Search suppliers…' }}
        toolbar={canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add supplier</Button> : null}
        empty={{
          icon: Truck,
          title: 'No suppliers yet',
          description: 'Add the distributors you buy medicines from — you can then raise purchase orders to them.',
          action: canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add supplier</Button> : null,
        }}
      />
      {editing && <SupplierFormDialog supplier={editing} onClose={() => setEditing(null)} />}

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>It's removed from your supplier list but kept in history (soft-deleted). Existing purchase orders are unaffected.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doRemove} disabled={removeSupplier.isPending}>{removeSupplier.isPending ? 'Removing…' : 'Remove'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const BLANK = { name: '', contactPerson: '', phone: '', email: '', gstNumber: '', address: '', notes: '', active: true };

function SupplierFormDialog({ supplier, onClose }) {
  const isEdit = !!supplier._id;
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const [form, setForm] = useState(() => ({ ...BLANK, ...Object.fromEntries(Object.entries(supplier).map(([k, v]) => [k, v == null ? BLANK[k] ?? '' : v])) }));
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const busy = create.isPending || update.isPending;

  const submit = async () => {
    if (!form.name.trim()) { toast.error('A supplier name is required.'); return; }
    const payload = { name: form.name, contactPerson: form.contactPerson, phone: form.phone, email: form.email, gstNumber: form.gstNumber, address: form.address, notes: form.notes, active: !!form.active };
    try {
      if (isEdit) await update.mutateAsync({ id: supplier._id, ...payload });
      else await create.mutateAsync(payload);
      toast.success(isEdit ? 'Supplier updated' : 'Supplier added');
      onClose();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit supplier' : 'Add supplier'}</DialogTitle>
          <DialogDescription>Vendor details used when raising purchase orders.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Supplier name" required><Input value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="MediSupply Distributors" maxLength={200} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact person"><Input value={form.contactPerson} onChange={(e) => set('contactPerson')(e.target.value)} maxLength={120} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => set('phone')(e.target.value)} maxLength={30} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} maxLength={200} /></Field>
            <Field label="GST number"><Input value={form.gstNumber} onChange={(e) => set('gstNumber')(e.target.value)} maxLength={30} /></Field>
          </div>
          <Field label="Address"><Textarea value={form.address} onChange={(e) => set('address')(e.target.value)} rows={2} maxLength={500} /></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(e) => set('notes')(e.target.value)} rows={2} maxLength={1000} /></Field>
          {isEdit && (
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={!!form.active} onCheckedChange={set('active')} aria-label="Active" />
              <span className="font-medium">Active</span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !form.name.trim()}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add supplier'}</Button>
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
