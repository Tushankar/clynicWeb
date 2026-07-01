import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Megaphone, Users, ArrowRight } from 'lucide-react';
import { PageHeader, StatCard, DataTable, StatusBadge } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useDoctors } from '@/hooks/useDoctors';
import { useCurrentDoctor, useDoctorDashboard } from '@/hooks/useDoctorDashboard';
import { fmtTime, todayISODate } from '@/lib/format';

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Doctor dashboard" description="Your day at a glance — queue and today's patients." />
      <FeatureGate feature="DOCTOR_DASHBOARD">
        <DoctorDashboardInner />
      </FeatureGate>
    </div>
  );
}

function DoctorDashboardInner() {
  const navigate = useNavigate();
  const doctors = useDoctors().data?.items || [];
  const current = useCurrentDoctor().data;
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    if (!doctorId) setDoctorId(current?._id || doctors[0]?._id || '');
  }, [current, doctors, doctorId]);

  const { data, isLoading, isError, error, refetch } = useDoctorDashboard({ doctorId, date: todayISODate() });
  const appts = data?.appointments || [];
  const queue = data?.queue || { nowServing: [], waiting: [], counts: {} };
  const serving = queue.nowServing?.[0];

  const columns = [
    { key: 'time', header: 'Time', className: 'tabular whitespace-nowrap', render: (a) => fmtTime(a.scheduledAt) },
    { key: 'token', header: 'Token', className: 'font-mono text-xs text-muted-foreground', render: (a) => (a.tokenNumber != null ? `#${a.tokenNumber}` : '—') },
    { key: 'patient', header: 'Patient', render: (a) => <span className="font-medium">{a.patientName || '—'}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'open',
      header: '',
      align: 'right',
      render: (a) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/patients/${a.patientId}`)}>
          Open <ArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={doctorId} onValueChange={setDoctorId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((d) => (
              <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 sm:col-span-1">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Megaphone className="h-4 w-4" /> Now serving
          </div>
          {serving ? (
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-semibold font-mono text-primary">{serving.token}</span>
              <span className="truncate text-lg font-medium">{serving.name}</span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No one in consultation.</p>
          )}
        </Card>
        <StatCard label="Waiting" value={queue.counts?.waiting ?? 0} icon={Users} loading={isLoading} />
        <StatCard label="Today's appointments" value={appts.length} icon={HeartPulse} loading={isLoading} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Today's patients</h2>
        <DataTable
          columns={columns}
          data={appts}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          empty={{ icon: HeartPulse, title: 'No appointments today', description: 'This doctor has no scheduled patients today.' }}
        />
      </div>
    </div>
  );
}
