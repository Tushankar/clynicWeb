import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/hooks/usePatients';
import { useHasRole } from '@/hooks/useRole';
import { ageFromDob, fmtDate } from '@/lib/format';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const canCreate = useHasRole('owner', 'receptionist');
  const { data, isLoading, isError, error, refetch } = usePatients(search);
  const patients = data?.items || [];

  const columns = [
    { key: 'patientCode', header: 'Code', className: 'font-mono text-xs text-muted-foreground' },
    { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'phone', header: 'Phone', render: (p) => p.phone || '—' },
    { key: 'age', header: 'Age', render: (p) => ageFromDob(p.dob) ?? '—' },
    { key: 'gender', header: 'Gender', className: 'capitalize', render: (p) => p.gender || '—' },
    { key: 'lastVisitAt', header: 'Last visit', render: (p) => (p.lastVisitAt ? fmtDate(p.lastVisitAt) : '—') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Search before registering — reuse an existing record to avoid duplicates."
        actions={canCreate && <Button onClick={() => setFormOpen(true)}><UserPlus className="h-4 w-4" /> New patient</Button>}
      />

      <DataTable
        columns={columns}
        data={patients}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(p) => navigate(`/patients/${p._id}`)}
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
