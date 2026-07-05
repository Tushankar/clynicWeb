import { useState } from 'react';
import { Wallet, Plus, Trash, Truck, Money } from '@phosphor-icons/react';
import { PageHeader, StatCard, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { usePharmacyExpenses, usePharmacyExpenseMeta, useCreatePharmacyExpense, useRemovePharmacyExpense } from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { fmtDate, todayISODate } from '@/lib/format';

const inr = (v) => (v == null ? '₹0' : `₹${(Math.round(v * 100) / 100).toLocaleString('en-IN')}`);

export default function PharmacyExpensesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Pharmacy outgoings — stock purchases (from received orders) and other costs." />
      <FeatureGate feature="PHARMACY_ANALYTICS">
        <ExpensesBody />
      </FeatureGate>
    </div>
  );
}

function ExpensesBody() {
  const canManage = useHasRole('owner', 'pharmacy_owner', 'pharmacy_manager');
  const canDelete = useHasRole('owner', 'pharmacy_owner');
  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const { data, isLoading, isError, error, refetch } = usePharmacyExpenses({});
  const removeExpense = useRemovePharmacyExpense();
  const items = data?.items || [];

  const doRemove = async () => {
    try {
      await removeExpense.mutateAsync(removing._id);
      toast.success('Expense removed');
      setRemoving(null);
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (x) => fmtDate(x.date) },
    {
      key: 'type', header: 'Type', render: (x) => x.type === 'purchase'
        ? <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"><Truck weight="fill" className="h-3 w-3" /> Purchase</span>
        : <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">{x.category || 'other'}</span>,
    },
    {
      key: 'detail', header: 'Detail', render: (x) => (
        <span className="min-w-0">
          <span className="block truncate text-foreground">{x.note || (x.type === 'purchase' ? 'Stock purchase' : '—')}</span>
          {(x.poNumber || x.supplierName) && <span className="block truncate text-xs text-muted-foreground">{[x.poNumber, x.supplierName].filter(Boolean).join(' · ')}</span>}
        </span>
      ),
    },
    { key: 'amount', header: 'Amount', align: 'right', render: (x) => <span className="font-semibold tabular">{inr(x.amount)}</span> },
    {
      key: 'actions', header: '', align: 'right', render: (x) => (canDelete && x.type !== 'purchase') ? (
        <Button variant="ghost" size="icon" aria-label="Delete" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoving(x); }}>
          <Trash className="h-4 w-4" />
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total expenses" value={inr(data?.total)} icon={Wallet} loading={isLoading} hint="all recorded" />
        <StatCard label="Stock purchases" value={inr(data?.purchases)} icon={Truck} loading={isLoading} hint="from received orders" />
        <StatCard label="Other expenses" value={inr(data?.other)} icon={Money} loading={isLoading} hint="manually recorded" />
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        toolbar={canManage ? <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add expense</Button> : null}
        empty={{
          icon: Wallet,
          title: 'No expenses yet',
          description: 'Receiving a purchase order records its cost here automatically; you can also log other pharmacy expenses.',
          action: canManage ? <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add expense</Button> : null,
        }}
      />

      {formOpen && <ExpenseFormDialog onClose={() => setFormOpen(false)} />}

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>{removing?.note || removing?.category} · {inr(removing?.amount)} on {removing && fmtDate(removing.date)}.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doRemove} disabled={removeExpense.isPending}>{removeExpense.isPending ? 'Deleting…' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExpenseFormDialog({ onClose }) {
  const categories = usePharmacyExpenseMeta().data?.categories || [];
  const create = useCreatePharmacyExpense();
  const [form, setForm] = useState({ date: todayISODate(), category: 'other', amount: '', note: '' });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!(Number(form.amount) > 0)) { toast.error('Enter a positive amount.'); return; }
    try {
      await create.mutateAsync({ ...form, amount: Number(form.amount) });
      toast.success('Expense added');
      onClose();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>A manual pharmacy expense (rent, salaries, utilities…). Stock purchases are recorded automatically on receipt.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Amount (₹)</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set('amount')(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Category</Label>
            <Select value={form.category} onValueChange={set('category')}>
              <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Note</Label>
            <Input value={form.note} onChange={(e) => set('note')(e.target.value)} placeholder="e.g. Monthly shop rent" maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={create.isPending || !(Number(form.amount) > 0)}>{create.isPending ? 'Adding…' : 'Add expense'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
