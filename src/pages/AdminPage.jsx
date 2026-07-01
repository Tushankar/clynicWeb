import { IndianRupee, TrendingUp, Building2, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PageHeader, StatCard, LoadingSkeleton } from '@/components/primitives';
import { Card } from '@/components/ui/card';
import { useAdminAnalytics } from '@/hooks/useAdmin';

/** Super-admin platform cockpit (cross-clinic aggregates only). Clinic users get 403 → blocked view. */
export default function AdminPage() {
  const { data, isLoading, isError, error } = useAdminAnalytics();

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform analytics" />
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <ShieldAlert className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">{error?.status === 403 ? 'Super-admin access only.' : error?.message}</p>
        </Card>
      </div>
    );
  }

  const a = data || {};
  return (
    <div className="space-y-6">
      <PageHeader title="Platform analytics" description="Cross-clinic SaaS metrics — aggregates only, no patient data." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="MRR" value={`₹${(a.revenue?.mrr ?? 0).toLocaleString('en-IN')}`} icon={IndianRupee} loading={isLoading} />
        <StatCard label="ARR" value={`₹${(a.revenue?.arr ?? 0).toLocaleString('en-IN')}`} icon={TrendingUp} loading={isLoading} />
        <StatCard label="Total collected" value={`₹${(a.revenue?.totalCollected ?? 0).toLocaleString('en-IN')}`} icon={IndianRupee} loading={isLoading} />
        <StatCard label="Clinics" value={a.clinics?.total ?? 0} icon={Building2} loading={isLoading} />
        <StatCard label="Active (30d)" value={a.clinics?.activeByUsage ?? 0} icon={Activity} hint={`${a.clinics?.inactiveByUsage ?? 0} inactive`} loading={isLoading} />
        <StatCard label="Failed payments" value={a.failedPayments ?? 0} icon={AlertTriangle} loading={isLoading} />
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Clinics by plan</h3>
        {isLoading ? (
          <LoadingSkeleton lines={3} />
        ) : (
          <div className="flex flex-wrap gap-6 text-sm">
            {Object.entries(a.clinics?.byPlan || {}).map(([plan, count]) => (
              <div key={plan}>
                <div className="text-2xl font-semibold tabular">{count}</div>
                <div className="capitalize text-muted-foreground">{plan}</div>
              </div>
            ))}
            <div>
              <div className="text-2xl font-semibold tabular">{a.subscriptions?.churnRate ?? 0}%</div>
              <div className="text-muted-foreground">Churn</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
