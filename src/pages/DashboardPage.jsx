import { useState } from 'react';
import { Users, CalendarCheck, Clock3, UserX, IndianRupee, Plus, UserPlus } from 'lucide-react';
import { PageHeader, StatCard, DataTable, StatusBadge } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { useRole, useHasRole } from '@/hooks/useRole';
import { useMe } from '@/hooks/useMe';
import { useBranch } from '@/context/BranchContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useQueue } from '@/hooks/useQueue';
import { fmtTime, todayISODate } from '@/lib/format';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import { WalkInDialog } from '@/components/appointments/WalkInDialog';

export default function DashboardPage() {
  const { clinicId } = useRole();
  const canManage = useHasRole('owner', 'receptionist');
  const clinicName = useMe().data?.clinic?.name;
  // Active branch (null = all branches); queue is inherently per-branch so it uses the resolved one.
  const { branchId, resolvedBranchId } = useBranch();

  const { data, isLoading, isError, error, refetch } = useAppointments({ date: todayISODate(), ...(branchId ? { branchId } : {}) });
  const appts = data?.items || [];
  const queue = useQueue(resolvedBranchId, clinicId);

  const [bookOpen, setBookOpen] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);

  const distinctPatients = new Set(appts.map((a) => String(a.patientId))).size;
  const missed = appts.filter((a) => a.status === 'no_show').length;
  const waiting = queue.data?.counts?.waiting ?? 0;

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
        title={clinicName ? `Today at ${clinicName}` : 'Today'}
        description="Your clinic at a glance."
        actions={
          canManage && (
            <>
              <Button variant="outline" onClick={() => setWalkOpen(true)}>
                <UserPlus className="h-4 w-4" /> Walk-in
              </Button>
              <Button onClick={() => setBookOpen(true)}>
                <Plus className="h-4 w-4" /> New appointment
              </Button>
            </>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Today's patients" value={distinctPatients} icon={Users} loading={isLoading} />
        <StatCard label="Appointments" value={appts.length} icon={CalendarCheck} loading={isLoading} />
        <StatCard label="Currently waiting" value={waiting} icon={Clock3} loading={queue.isLoading} />
        <StatCard label="Missed / no-show" value={missed} icon={UserX} loading={isLoading} />
        <StatCard label="Revenue" value="—" icon={IndianRupee} hint="Billing in Phase 3" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Today's appointments</h2>
        <DataTable
          columns={columns}
          data={appts}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          empty={{
            icon: CalendarCheck,
            title: 'Nothing booked yet today',
            description: 'Register a walk-in or share your booking link to fill the day.',
            action: canManage ? <Button onClick={() => setWalkOpen(true)}><UserPlus className="h-4 w-4" /> Register walk-in</Button> : null,
          }}
        />
      </div>

      <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} />
      <WalkInDialog open={walkOpen} onOpenChange={setWalkOpen} />
    </div>
  );
}
