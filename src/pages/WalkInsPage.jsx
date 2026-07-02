import { useState } from 'react';
import { UserPlus } from '@phosphor-icons/react';
import { PageHeader, DataTable, StatusBadge } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { useBranch } from '@/context/BranchContext';
import { useHasRole } from '@/hooks/useRole';
import { fmtTime, todayISODate } from '@/lib/format';
import { WalkInDialog } from '@/components/appointments/WalkInDialog';

export default function WalkInsPage() {
  const { branchId } = useBranch();
  const canManage = useHasRole('owner', 'receptionist');
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useAppointments({ date: todayISODate(), ...(branchId ? { branchId } : {}) });
  const walkins = (data?.items || []).filter((a) => a.source === 'walkin');

  const columns = [
    { key: 'time', header: 'Time', className: 'tabular whitespace-nowrap', render: (a) => fmtTime(a.scheduledAt) },
    { key: 'token', header: 'Token', className: 'font-mono text-xs text-muted-foreground', render: (a) => (a.tokenNumber != null ? `#${a.tokenNumber}` : '—') },
    { key: 'patient', header: 'Patient', render: (a) => <span className="font-medium">{a.patientName || '—'}</span> },
    { key: 'doctor', header: 'Doctor', render: (a) => a.doctorName || '—' },
    { key: 'status', header: 'Status', align: 'right', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Walk-ins"
        description="Patients who arrived without a prior appointment, today."
        actions={canManage && <Button onClick={() => setOpen(true)}><UserPlus weight="bold" className="h-4 w-4" /> Register walk-in</Button>}
      />
      <DataTable
        columns={columns}
        data={walkins}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        empty={{
          icon: UserPlus,
          title: 'No walk-ins yet today',
          description: 'Register a walk-in to add them straight into the live queue.',
          action: canManage ? <Button onClick={() => setOpen(true)}><UserPlus weight="bold" className="h-4 w-4" /> Register walk-in</Button> : null,
        }}
      />
      <WalkInDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
