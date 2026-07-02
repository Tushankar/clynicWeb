import { Stethoscope } from '@phosphor-icons/react';
import { PageHeader, DataTable } from '@/components/primitives';
import { cn } from '@/lib/utils';
import { useDoctors } from '@/hooks/useDoctors';

export default function DoctorsPage() {
  const { data, isLoading, isError, error, refetch } = useDoctors(false); // all doctors, incl. inactive
  const doctors = data?.items || [];

  const columns = [
    { key: 'name', header: 'Doctor', render: (d) => <span className="font-medium">{d.name}</span> },
    { key: 'specialization', header: 'Specialization', render: (d) => d.specialization || '—' },
    { key: 'consultationFee', header: 'Consultation fee', align: 'right', className: 'tabular', render: (d) => `₹${(d.consultationFee || 0).toLocaleString('en-IN')}` },
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Doctors" description="Practitioners at your clinic and their consultation fees." />
      <DataTable
        columns={columns}
        data={doctors}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        empty={{ icon: Stethoscope, title: 'No doctors yet', description: 'Add practitioners so patients can book with them.' }}
      />
    </div>
  );
}
