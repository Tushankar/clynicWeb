import { IndianRupee, TrendingUp, Building2, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PageHeader, StatCard, LoadingSkeleton, DataTable } from '@/components/primitives';
import { Card } from '@/components/ui/card';
import { useAdminAnalytics, useAdminClinics, useSetClinicPlan } from '@/hooks/useAdmin';
import { fmtDate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';

const PLAN_OPTS = ['basic', 'standard', 'premium', 'ultra_premium'];

/** Super-admin platform cockpit (cross-clinic aggregates only). Clinic users get 403 → blocked view. */
export default function AdminPage() {
  const { data, isLoading, isError, error } = useAdminAnalytics();
  const clinicsQ = useAdminClinics();
  const setPlan = useSetClinicPlan();

  const changePlan = async (clinicId, plan) => {
    try {
      await setPlan.mutateAsync({ clinicId, plan });
      toast.success(`Plan set to ${plan}`);
    } catch (e) {
      toastApiError(e);
    }
  };

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
        <StatCard label="Pharmacy GMV (30d)" value={`₹${(a.pharmacy?.gmv30d ?? 0).toLocaleString('en-IN')}`} icon={IndianRupee} hint={`${a.pharmacy?.dispenses30d ?? 0} dispenses · ${a.pharmacy?.storeOrders30d ?? 0} store orders`} loading={isLoading} />
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
            <div>
              <div className="text-2xl font-semibold tabular text-warning">{a.subscriptions?.pastDue ?? 0}</div>
              <div className="text-muted-foreground">Past due</div>
            </div>
          </div>
        )}
      </Card>

      {/* Per-clinic control plane — see & act on individual clinics (not just aggregates). */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Clinics</h3>
        <DataTable
          columns={[
            { key: 'name', header: 'Clinic', render: (c) => (
              <span className="min-w-0">
                <span className="block truncate font-semibold text-foreground">{c.name}</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">/{c.slug}</span>
              </span>
            ) },
            { key: 'plan', header: 'Plan', render: (c) => (
              <select
                value={c.plan}
                onChange={(e) => changePlan(c.clinicId, e.target.value)}
                disabled={setPlan.isPending}
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs capitalize outline-none focus:ring-2 focus:ring-ring/30"
                aria-label={`Plan for ${c.name}`}
              >
                {PLAN_OPTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            ) },
            { key: 'subscriptionStatus', header: 'Subscription', render: (c) => (
              c.subscriptionStatus
                ? <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', c.subscriptionStatus === 'past_due' ? 'bg-warning/15 text-warning' : c.subscriptionStatus === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>{c.subscriptionStatus.replace('_', ' ')}</span>
                : <span className="text-muted-foreground">—</span>
            ) },
            { key: 'doctors', header: 'Doctors', align: 'right', render: (c) => c.doctors },
            { key: 'dues', header: 'Dues', align: 'right', render: (c) => (c.dues > 0 ? <span className="font-semibold text-warning tabular">₹{c.dues.toLocaleString('en-IN')}</span> : <span className="text-muted-foreground">—</span>) },
            { key: 'lastActivityAt', header: 'Last activity', align: 'right', render: (c) => (c.lastActivityAt ? fmtDate(c.lastActivityAt) : '—') },
          ]}
          data={clinicsQ.data?.items || []}
          getRowId={(c) => c.clinicId}
          isLoading={clinicsQ.isLoading}
          isError={clinicsQ.isError}
          error={clinicsQ.error}
          onRetry={clinicsQ.refetch}
          empty={{ icon: Building2, title: 'No clinics yet' }}
        />
      </div>
    </div>
  );
}
