import { IndianRupee, Users, UserX, CalendarCheck, TrendingUp } from 'lucide-react';
import { PageHeader, StatCard, LoadingSkeleton } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Card } from '@/components/ui/card';
import { Bars } from '@/components/charts/Bars';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useBranch } from '@/context/BranchContext';

export default function AnalyticsPage() {
  return (
    <FeatureGate feature="ANALYTICS">
      <AnalyticsInner />
    </FeatureGate>
  );
}

const inr = (v) => `₹${(v ?? 0).toLocaleString('en-IN')}`;
const shortDay = (iso) => iso?.slice(8, 10); // 'DD'

function AnalyticsInner() {
  const { branchId } = useBranch();
  const { data, isLoading, isError, error, refetch } = useAnalytics(branchId ? { branchId } : {});
  const a = data || {};

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Your clinic's performance over the last 30 days." />
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <TrendingUp className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">{error?.message || 'Could not load analytics.'}</p>
          <button className="mt-3 text-sm text-primary underline" onClick={() => refetch()}>Retry</button>
        </Card>
      </div>
    );
  }

  const revenueBars = (a.revenue?.byDay || []).map((d) => ({ label: d.date, value: d.revenue, short: shortDay(d.date) }));
  const peakBars = (a.peakHours || []).map((h) => ({ label: `${h.hour}:00`, value: h.count, short: h.hour % 3 === 0 ? String(h.hour) : '' }));
  const doctorBars = (a.doctors?.mostVisited || []).map((d) => ({ label: d.name, value: d.count }));
  const seen = a.patients?.seen || 0;
  const nr = [
    { label: 'New', value: a.patients?.new || 0 },
    { label: 'Returning', value: a.patients?.returning || 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Your clinic's performance over the last 30 days." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue (30d)" value={inr(a.revenue?.total)} icon={IndianRupee} loading={isLoading} hint={`${a.revenue?.invoices ?? 0} invoices`} />
        <StatCard label="Patients seen" value={seen} icon={Users} loading={isLoading} hint={`${a.patients?.new ?? 0} new · ${a.patients?.returning ?? 0} returning`} />
        <StatCard label="No-show rate" value={`${a.appointments?.noShowRate ?? 0}%`} icon={UserX} loading={isLoading} hint={`${a.appointments?.total ?? 0} appointments`} />
        <StatCard label="Follow-up completion" value={`${a.followUp?.completionRate ?? 0}%`} icon={CalendarCheck} loading={isLoading} hint={`${a.followUp?.completed ?? 0}/${a.followUp?.due ?? 0} due`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Revenue by day</h3>
          {isLoading ? <LoadingSkeleton lines={4} /> : <Bars data={revenueBars} format={inr} />}
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Peak hours</h3>
          {isLoading ? <LoadingSkeleton lines={4} /> : <Bars data={peakBars} />}
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Most-visited doctors</h3>
          {isLoading ? <LoadingSkeleton lines={3} /> : <Bars data={doctorBars} horizontal />}
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">New vs returning</h3>
          {isLoading ? <LoadingSkeleton lines={3} /> : <Bars data={nr} horizontal />}
        </Card>
      </div>
    </div>
  );
}
