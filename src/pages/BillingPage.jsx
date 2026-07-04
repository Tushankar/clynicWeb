import { useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Globe,
  IndianRupee,
  Plus,
  Receipt,
  ReceiptText,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react';
import { PageHeader, DataTable, Avatar, StatCard } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useInvoices, useDayRegister } from '@/hooks/useBilling';
import { useExpenses, useExpenseCategories, useCreateExpense, useRemoveExpense } from '@/hooks/useExpenses';
import { useExportCsv } from '@/hooks/useExport';
import { useFeature } from '@/hooks/usePlan';
import { useHasRole } from '@/hooks/useRole';
import { fmtDate, fmtTime, todayISODate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { InvoiceFormDialog } from '@/components/billing/InvoiceFormDialog';
import { InvoiceDetailDialog } from '@/components/billing/InvoiceDetailDialog';

const STATUS_CLS = {
  paid: 'bg-success/10 text-success',
  partially_paid: 'bg-warning/15 text-warning',
  unpaid: 'bg-secondary text-secondary-foreground',
  refunded: 'bg-info/10 text-info',
  cancelled: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
};

const inr = (v) => `₹${(Math.round((v ?? 0) * 100) / 100).toLocaleString('en-IN')}`;

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Invoices, payments, the daily register, and expenses." />
      <FeatureGate feature="BILLING">
        <BillingTabs />
      </FeatureGate>
    </div>
  );
}

function BillingTabs() {
  const hasRegister = useFeature('CASH_REGISTER');
  const hasExpenses = useFeature('EXPENSES');
  return (
    <Tabs defaultValue="invoices">
      <TabsList>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        {hasRegister && <TabsTrigger value="register">Register</TabsTrigger>}
        {hasExpenses && <TabsTrigger value="expenses">Expenses</TabsTrigger>}
      </TabsList>
      <TabsContent value="invoices" className="mt-4">
        <InvoicesTab />
      </TabsContent>
      {hasRegister && (
        <TabsContent value="register" className="mt-4">
          <RegisterTab />
        </TabsContent>
      )}
      {hasExpenses && (
        <TabsContent value="expenses" className="mt-4">
          <ExpensesTab />
        </TabsContent>
      )}
    </Tabs>
  );
}

/* ------------------------------------ Invoices ------------------------------------ */

function InvoicesTab() {
  const canCreate = useHasRole('owner', 'receptionist');
  const isOwner = useHasRole('owner');
  const hasExport = useFeature('DATA_EXPORT');
  const exportCsv = useExportCsv();
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [dueOnly, setDueOnly] = useState(false);
  const { data, isLoading, isError, error, refetch } = useInvoices({});
  const all = data?.items || [];
  const invoices = dueOnly ? all.filter((i) => ['unpaid', 'partially_paid'].includes(i.status)) : all;

  const doExport = async () => {
    try {
      await exportCsv.mutateAsync({ entity: 'invoices' });
      toast.success('Invoices exported');
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice', className: 'font-mono text-xs text-muted-foreground' },
    { key: 'patient', header: 'Patient', render: (i) => (
      <span className="flex items-center gap-3">
        <Avatar name={i.patientName || '?'} />
        <span className="font-semibold text-foreground">{i.patientName || '—'}</span>
      </span>
    ) },
    { key: 'total', header: 'Total', align: 'right', render: (i) => inr(i.total) },
    { key: 'balance', header: 'Balance', align: 'right', render: (i) => {
      const bal = Math.max(0, Math.round((i.total - i.amountPaid) * 100) / 100);
      return bal > 0 ? <span className="font-semibold text-warning">{inr(bal)}</span> : <span className="text-muted-foreground">—</span>;
    } },
    { key: 'status', header: 'Status', render: (i) => <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_CLS[i.status] || 'bg-muted')}>{i.status.replace('_', ' ')}</span> },
    { key: 'date', header: 'Date', render: (i) => fmtDate(i.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant={dueOnly ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setDueOnly((v) => !v)}
          aria-pressed={dueOnly}
        >
          <Wallet className="h-4 w-4" /> Dues only
        </Button>
        {isOwner && hasExport && (
          <Button variant="ghost" size="sm" onClick={doExport} disabled={exportCsv.isPending}>
            <Download className="h-4 w-4" /> Export
          </Button>
        )}
        {canCreate && <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New invoice</Button>}
      </div>
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(i) => setDetailId(i._id)}
        empty={{
          icon: Receipt,
          title: dueOnly ? 'No outstanding dues' : 'No invoices yet',
          description: dueOnly ? 'Every invoice is fully settled. 🎉' : 'Create an invoice to bill a patient.',
          action: canCreate && !dueOnly ? <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New invoice</Button> : null,
        }}
      />
      <InvoiceFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <InvoiceDetailDialog invoiceId={detailId} open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
}

/* ------------------------------------ Register ------------------------------------ */

const METHOD_META = {
  cash: { label: 'Cash', icon: Banknote },
  upi: { label: 'UPI', icon: Smartphone },
  card: { label: 'Card', icon: CreditCard },
  online: { label: 'Online', icon: Globe },
};

function RegisterTab() {
  const [date, setDate] = useState(todayISODate());
  const { data, isLoading, isError, error, refetch } = useDayRegister({ date });
  const reg = data || { totals: {}, refunds: {}, dues: {}, entries: [] };
  const shift = (n) => setDate(format(addDays(parseISO(date), n), 'yyyy-MM-dd'));

  const columns = [
    { key: 'time', header: 'Time', className: 'tabular whitespace-nowrap', render: (p) => fmtTime(p.paidAt) },
    { key: 'invoice', header: 'Invoice', className: 'font-mono text-xs text-muted-foreground', render: (p) => p.invoiceNumber },
    { key: 'patient', header: 'Patient', render: (p) => <span className="font-semibold text-foreground">{p.patientName || '—'}</span> },
    { key: 'method', header: 'Method', render: (p) => {
      const m = METHOD_META[p.method] || METHOD_META.cash;
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground"><m.icon className="h-3 w-3" /> {m.label}</span>;
    } },
    { key: 'reference', header: 'Reference', className: 'font-mono text-[11px] text-muted-foreground', render: (p) => p.reference || '—' },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => <span className="font-semibold">{inr(p.amount)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Previous day"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => setDate(todayISODate())}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Next day"><ChevronRight className="h-4 w-4" /></Button>
          <Input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="ml-2 w-40" />
        </div>
        <p className="text-sm text-muted-foreground">{format(parseISO(date), 'EEEE, d MMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Collected" value={inr(reg.totals.total)} icon={IndianRupee} loading={isLoading} hint={`${reg.totals.count ?? 0} payments`} />
        {Object.entries(METHOD_META).map(([k, m]) => (
          <StatCard key={k} label={m.label} value={inr(reg.totals[k])} icon={m.icon} loading={isLoading} />
        ))}
        <StatCard label="Outstanding dues" value={inr(reg.dues.amount)} icon={Wallet} loading={isLoading} hint={`${reg.dues.count ?? 0} invoices — all time`} />
      </div>

      {reg.refunds?.count > 0 && (
        <p className="text-sm text-muted-foreground">
          Refunds today: <span className="font-semibold text-destructive">− {inr(reg.refunds.total)}</span> ({reg.refunds.count})
        </p>
      )}

      <DataTable
        columns={columns}
        data={reg.entries}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        pagination={false}
        empty={{ icon: ReceiptText, title: 'No payments this day', description: 'Payments recorded on invoices appear here, split by method.' }}
      />
    </div>
  );
}

/* ------------------------------------ Expenses ------------------------------------ */

function ExpensesTab() {
  const isOwner = useHasRole('owner');
  const hasExport = useFeature('DATA_EXPORT');
  const exportCsv = useExportCsv();
  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const { data, isLoading, isError, error, refetch } = useExpenses({});
  const removeExpense = useRemoveExpense();
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
  const doExport = async () => {
    try {
      await exportCsv.mutateAsync({ entity: 'expenses' });
      toast.success('Expenses exported');
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (x) => fmtDate(x.date) },
    { key: 'description', header: 'Description', render: (x) => <span className="font-semibold text-foreground">{x.description}</span> },
    { key: 'category', header: 'Category', render: (x) => <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">{x.category}</span> },
    { key: 'method', header: 'Paid via', className: 'capitalize text-muted-foreground', render: (x) => x.method },
    { key: 'amount', header: 'Amount', align: 'right', render: (x) => <span className="font-semibold">{inr(x.amount)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (x) =>
        isOwner ? (
          <Button variant="ghost" size="icon" aria-label="Delete" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoving(x); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Total recorded: <span className="font-semibold text-foreground">{inr(data?.total)}</span>
          <span className="ml-1.5">· feeds the P&L in Analytics</span>
        </p>
        <div className="flex items-center gap-2">
          {isOwner && hasExport && (
            <Button variant="ghost" size="sm" onClick={doExport} disabled={exportCsv.isPending}>
              <Download className="h-4 w-4" /> Export
            </Button>
          )}
          <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add expense</Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        empty={{
          icon: Wallet,
          title: 'No expenses recorded',
          description: 'Log rent, salaries, supplies and lab fees — Analytics turns them into a monthly P&L.',
          action: <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add expense</Button>,
        }}
      />

      <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>
              {removing?.description} · {inr(removing?.amount)} on {removing && fmtDate(removing.date)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doRemove} disabled={removeExpense.isPending}>
              {removeExpense.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExpenseFormDialog({ open, onOpenChange }) {
  const categories = useExpenseCategories().data?.items || [];
  const create = useCreateExpense();
  const [form, setForm] = useState({ date: todayISODate(), category: 'supplies', description: '', amount: '', method: 'cash' });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      await create.mutateAsync({ ...form, amount: Number(form.amount) });
      toast.success('Expense added');
      onOpenChange(false);
      setForm({ date: todayISODate(), category: 'supplies', description: '', amount: '', method: 'cash' });
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>Recorded against your clinic's books; only the owner can delete.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input type="number" min="0" value={form.amount} onChange={(e) => set('amount')(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Input value={form.description} onChange={(e) => set('description')(e.target.value)} placeholder="Dental supplies restock" maxLength={200} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={set('category')}>
                <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Paid via</label>
              <Select value={form.method} onValueChange={set('method')}>
                <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['cash', 'upi', 'card', 'bank', 'other'].map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={create.isPending || !(Number(form.amount) > 0) || !form.description.trim()}>
            {create.isPending ? 'Adding…' : 'Add expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
