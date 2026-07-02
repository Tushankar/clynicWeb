import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { PageHeader, DataTable, Avatar } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { useInvoices } from '@/hooks/useBilling';
import { useHasRole } from '@/hooks/useRole';
import { fmtDate } from '@/lib/format';
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

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Invoices, payments, and refunds." />
      <FeatureGate feature="BILLING"><BillingInner /></FeatureGate>
    </div>
  );
}

function BillingInner() {
  const canCreate = useHasRole('owner', 'receptionist');
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const { data, isLoading, isError, error, refetch } = useInvoices({});
  const invoices = data?.items || [];

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice', className: 'font-mono text-xs text-muted-foreground' },
    { key: 'patient', header: 'Patient', render: (i) => (
      <span className="flex items-center gap-3">
        <Avatar name={i.patientName || '?'} />
        <span className="font-semibold text-foreground">{i.patientName || '—'}</span>
      </span>
    ) },
    { key: 'total', header: 'Total', className: 'tabular', render: (i) => `₹${i.total}` },
    { key: 'paid', header: 'Paid', className: 'tabular', render: (i) => `₹${i.amountPaid}` },
    { key: 'status', header: 'Status', render: (i) => <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_CLS[i.status] || 'bg-muted')}>{i.status.replace('_', ' ')}</span> },
    { key: 'date', header: 'Date', render: (i) => fmtDate(i.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
        empty={{ icon: Receipt, title: 'No invoices yet', description: 'Create an invoice to bill a patient.', action: canCreate ? <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New invoice</Button> : null }}
      />
      <InvoiceFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <InvoiceDetailDialog invoiceId={detailId} open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
}
