import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Download, Eye } from 'lucide-react';
import { PageHeader, DataTable, Avatar } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/hooks/usePatients';
import { useHasRole } from '@/hooks/useRole';
import { useFeature } from '@/hooks/usePlan';
import { useExportCsv } from '@/hooks/useExport';
import { toast, toastApiError } from '@/lib/toast';
import { ageFromDob, fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';

// Segment tag tints (mirrors the CRM segments so a patient reads the same everywhere).
const TAG_TONE = {
  repeat: 'bg-info/10 text-info',
  high_value: 'bg-violet-100 text-violet-700',
  vip: 'bg-violet-100 text-violet-700',
  lapsed: 'bg-amber-100 text-amber-700',
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const canCreate = useHasRole('owner', 'receptionist');
  const isOwner = useHasRole('owner');
  const hasExport = useFeature('DATA_EXPORT');
  const exportCsv = useExportCsv();
  const { data, isLoading, isError, error, refetch } = usePatients(search);
  const patients = data?.items || [];

  const doExport = async () => {
    try {
      await exportCsv.mutateAsync({ entity: 'patients' });
      toast.success('Patients exported');
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    { key: 'patientCode', header: 'Code', className: 'font-mono text-xs text-muted-foreground' },
    { key: 'name', header: 'Name', render: (p) => (
      <span className="flex items-center gap-3">
        <Avatar name={p.name} />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{p.name}</span>
          {p.tags?.length ? (
            <span className="mt-0.5 flex flex-wrap gap-1">
              {p.tags.slice(0, 3).map((t) => (
                <span key={t} className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize', TAG_TONE[t] || 'bg-secondary text-secondary-foreground')}>
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </span>
    ) },
    { key: 'phone', header: 'Phone', render: (p) => p.phone || '—' },
    { key: 'age', header: 'Age', render: (p) => ageFromDob(p.dob) ?? '—' },
    { key: 'lastVisitAt', header: 'Last visit', render: (p) => (p.lastVisitAt ? fmtDate(p.lastVisitAt) : '—') },
    { key: 'balance', header: 'Balance', align: 'right', render: (p) => (
      p.balanceDue > 0
        ? <span className="font-semibold text-warning tabular">₹{p.balanceDue.toLocaleString('en-IN')}</span>
        : <span className="text-muted-foreground">—</span>
    ) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <Button
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/patients/${p._id}`); }}
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Search before registering — reuse an existing record to avoid duplicates."
        actions={
          <>
            {isOwner && hasExport && (
              <Button variant="ghost" onClick={doExport} disabled={exportCsv.isPending}>
                <Download className="h-4 w-4" /> Export
              </Button>
            )}
            {canCreate && <Button onClick={() => setFormOpen(true)}><UserPlus className="h-4 w-4" /> New patient</Button>}
          </>
        }
      />

      <DataTable
        columns={columns}
        data={patients}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(p) => navigate(`/dashboard/patients/${p._id}`)}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by name, phone, or code…' }}
        empty={{
          icon: Users,
          title: search ? 'No matching patients' : 'No patients yet',
          description: search ? 'Try a different name or phone number.' : 'Register your first patient to get started.',
          action: canCreate && !search ? <Button onClick={() => setFormOpen(true)}><UserPlus className="h-4 w-4" /> New patient</Button> : null,
        }}
      />

      <PatientFormDialog open={formOpen} onOpenChange={setFormOpen} patient={null} />
    </div>
  );
}
