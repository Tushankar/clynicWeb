import { useState } from 'react';
import { Stethoscope, PencilSimple, Plus } from '@phosphor-icons/react';
import { PageHeader, DataTable, Avatar } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDoctors } from '@/hooks/useDoctors';
import { useHasRole } from '@/hooks/useRole';
import { DoctorFormDialog } from '@/components/doctors/DoctorFormDialog';

const inr = (v) => `₹${(v || 0).toLocaleString('en-IN')}`;

export default function DoctorsPage() {
  const canManage = useHasRole('owner', 'receptionist'); // front desk manages profiles + hours
  const canAdd = useHasRole('owner'); // adding a practitioner is owner-level
  const { data, isLoading, isError, error, refetch } = useDoctors(false); // all doctors, incl. inactive
  const doctors = data?.items || [];
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const dialogOpen = creating || !!editing;

  const columns = [
    { key: 'name', header: 'Doctor', render: (d) => (
      <span className="flex items-center gap-3">
        {d.photoUrl ? (
          <img src={d.photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <Avatar name={d.name} />
        )}
        <span className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{d.name}</span>
          {d.qualifications && <span className="block truncate text-xs text-muted-foreground">{d.qualifications}</span>}
        </span>
      </span>
    ) },
    { key: 'specialization', header: 'Specialization', render: (d) => (
      <span>
        {d.specialization || '—'}
        {d.experienceYears > 0 && <span className="ml-1.5 text-xs text-muted-foreground">· {d.experienceYears}y exp</span>}
      </span>
    ) },
    { key: 'consultationFee', header: 'Consultation fee', align: 'right', className: 'tabular', render: (d) => inr(d.consultationFee) },
    {
      key: 'isActive',
      header: 'Status',
      align: 'right',
      render: (d) => (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium', d.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', d.isActive ? 'bg-emerald-500' : 'bg-muted-foreground')} />
          {d.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    ...(canManage
      ? [{
          key: 'actions',
          header: '',
          align: 'right',
          render: (d) => (
            <Button size="sm" className="h-8 px-3 text-xs" onClick={(e) => { e.stopPropagation(); setEditing(d); }}>
              <PencilSimple weight="bold" className="h-3.5 w-3.5" /> Edit
            </Button>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description={canManage
          ? 'Add practitioners and set their fees, weekly hours, and bookable status. Manage one-off leave on Time Off.'
          : 'Practitioners at your clinic and their consultation fees.'}
        actions={canAdd ? (
          <Button onClick={() => setCreating(true)}>
            <Plus weight="bold" className="h-4 w-4" /> Add doctor
          </Button>
        ) : undefined}
      />
      <DataTable
        columns={columns}
        data={doctors}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={canManage ? (d) => setEditing(d) : undefined}
        empty={{
          icon: Stethoscope,
          title: 'No doctors yet',
          description: canAdd
            ? 'Add your first practitioner to start taking bookings — set their weekly hours and fee.'
            : canManage
            ? 'Ask the clinic owner to add a practitioner, then set their hours & fees here.'
            : 'Add practitioners so patients can book with them.',
          action: canAdd ? <Button onClick={() => setCreating(true)}><Plus weight="bold" className="h-4 w-4" /> Add doctor</Button> : undefined,
        }}
      />

      {canManage && (
        <DoctorFormDialog
          open={dialogOpen}
          onOpenChange={(o) => { if (!o) { setEditing(null); setCreating(false); } }}
          doctor={editing}
        />
      )}
    </div>
  );
}
