import { Link } from 'react-router-dom';
import { IndianRupee, Users, UserX, CalendarCheck, TrendingUp, UserMinus, Pill } from 'lucide-react';
import { PageHeader, StatCard, LoadingSkeleton } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Card } from '@/components/ui/card';
import { Bars } from '@/components/charts/Bars';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useFeature } from '@/hooks/usePlan';
import { usePharmacyReports } from '@/hooks/usePharmacy';
import { useBranch } from '@/context/BranchContext';
import { cn } from '@/lib/utils';

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
  // Ultra Premium pharmacy snapshot (§6.7) — feature-gated: renders NOTHING for non-Ultra clinics,
  // so their analytics page is unchanged. Data comes from the pharmacy reports endpoint (additive;
  // the shared analytics service/response is untouched).
  const hasPharmacy = useFeature('PHARMACY_ANALYTICS');
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Revenue (30d)" value={inr(a.revenue?.total)} icon={IndianRupee} loading={isLoading} hint={`${a.revenue?.invoices ?? 0} invoices`} />
        <StatCard label="Patients seen" value={seen} icon={Users} loading={isLoading} hint={`${a.patients?.new ?? 0} new · ${a.patients?.returning ?? 0} returning`} />
        <StatCard label="No-show rate" value={`${a.appointments?.noShowRate ?? 0}%`} icon={UserX} loading={isLoading} hint={`${a.appointments?.total ?? 0} appointments`} />
        <StatCard label="Follow-up completion" value={`${a.followUp?.completionRate ?? 0}%`} icon={CalendarCheck} loading={isLoading} hint={`${a.followUp?.completed ?? 0}/${a.followUp?.due ?? 0} due`} />
        <StatCard label="Lapsed patients" value={a.retention?.lapsed ?? 0} icon={UserMinus} loading={isLoading} hint={`at risk · ${a.retention?.neverReturned ?? 0} never returned`} />
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

        {/* Depth (§5.24) */}
        <Card className="p-5">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Revenue by service</h3>
          <p className="mb-4 text-xs text-muted-foreground/70">What you actually bill for, ranked.</p>
          {isLoading ? (
            <LoadingSkeleton lines={4} />
          ) : (
            <Bars data={(a.revenueByService || []).map((s) => ({ label: s.label, value: s.amount }))} horizontal format={inr} />
          )}
        </Card>
        <Card className="p-5">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Doctor utilization</h3>
          <p className="mb-4 text-xs text-muted-foreground/70">Booked time vs offered availability (net of time off).</p>
          {isLoading ? <LoadingSkeleton lines={4} /> : <Utilization rows={a.utilization || []} />}
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">No-show heatmap</h3>
          <p className="mb-4 text-xs text-muted-foreground/70">Where no-shows cluster by weekday and hour — tighten reminders or overbook there.</p>
          {isLoading ? <LoadingSkeleton lines={5} /> : <NoShowHeatmap heatmap={a.heatmap} />}
        </Card>
        <Card className="p-5">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Growth (6 months)</h3>
          <p className="mb-4 text-xs text-muted-foreground/70">New patient registrations vs completed visits.</p>
          {isLoading ? <LoadingSkeleton lines={4} /> : <Trend trend={a.trend} />}
        </Card>
        {a.pnl && (
          <Card className="p-5">
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">Profit & loss (6 months)</h3>
            <p className="mb-4 text-xs text-muted-foreground/70">Collected revenue minus recorded expenses.</p>
            {isLoading ? <LoadingSkeleton lines={4} /> : <Pnl rows={a.pnl} />}
          </Card>
        )}
        {hasPharmacy && <PharmacySnapshot />}
      </div>
    </div>
  );
}

/** Ultra Premium: the pharmacy's books in one card, linking to the full pharmacy reports. */
function PharmacySnapshot() {
  const { data, isLoading, isError, refetch } = usePharmacyReports({});
  const s = data?.sales || {};
  // Never render confident ₹0 books on a failed request — that reads as "the pharmacy sold nothing".
  if (isError) {
    return (
      <Card className="p-5">
        <h3 className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><Pill className="h-4 w-4" /> Pharmacy (30 days)</h3>
        <p className="mt-2 text-sm text-muted-foreground">Couldn’t load the pharmacy snapshot.</p>
        <button className="mt-2 text-sm text-primary underline" onClick={() => refetch()}>Retry</button>
      </Card>
    );
  }
  const rows = [
    { label: 'Sales (30d)', value: inr(s.revenue) },
    { label: 'Gross margin', value: `${inr(s.grossMargin)} (${s.marginPct ?? 0}%)` },
    { label: 'Expenses', value: inr(data?.expenses?.total) },
    { label: 'Stock value', value: inr(data?.stock?.stockValue) },
  ];
  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><Pill className="h-4 w-4" /> Pharmacy (30 days)</h3>
        <Link to="/dashboard/pharmacy/reports" className="text-xs font-medium text-primary hover:underline">Full reports →</Link>
      </div>
      <p className="mb-4 text-xs text-muted-foreground/70">Counter dispenses + online store, at a glance.</p>
      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : (
        <dl className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between text-sm">
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-semibold tabular text-foreground">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

/* ------------------------------ depth visualizations ------------------------------ */

const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'short' });
};

function Utilization({ rows }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No active doctors in this range.</p>;
  return (
    <div className="space-y-3">
      {rows.map((d) => (
        <div key={d.doctorId} className="text-sm">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate font-medium text-foreground">{d.name}</span>
            <span className="shrink-0 tabular text-muted-foreground">
              {Math.round(d.bookedMinutes / 60)}h / {Math.round(d.availableMinutes / 60)}h ·{' '}
              <span className={cn('font-semibold', d.utilization >= 75 ? 'text-success' : d.utilization >= 40 ? 'text-foreground' : 'text-warning')}>
                {d.utilization}%
              </span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full', d.utilization >= 75 ? 'bg-success' : d.utilization >= 40 ? 'bg-primary/80' : 'bg-warning')}
              style={{ width: `${Math.min(100, d.utilization)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoShowHeatmap({ heatmap }) {
  const cells = heatmap?.cells || [];
  if (!cells.length) return <p className="text-sm text-muted-foreground">No appointments in this range.</p>;

  const hours = cells.map((c) => c.hour);
  const minH = Math.min(...hours);
  const maxH = Math.max(...hours);
  const range = Array.from({ length: maxH - minH + 1 }, (_, i) => minH + i);
  const byKey = new Map(cells.map((c) => [`${c.dow}-${c.hour}`, c]));
  const maxNoShow = Math.max(1, ...cells.map((c) => c.noShow));
  // Monday-first reading order.
  const days = [1, 2, 3, 4, 5, 6, 0];
  const labels = heatmap.dowLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="grid gap-1" style={{ gridTemplateColumns: `44px repeat(${range.length}, minmax(24px, 1fr))` }}>
          <span />
          {range.map((h) => (
            <span key={h} className="text-center text-[10px] tabular text-muted-foreground">{h}</span>
          ))}
          {days.map((dow) => (
            <div key={dow} className="contents">
              <span className="flex items-center text-[11px] font-medium text-muted-foreground">{labels[dow]}</span>
              {range.map((h) => {
                const c = byKey.get(`${dow}-${h}`);
                const intensity = c ? c.noShow / maxNoShow : 0;
                return (
                  <div
                    key={h}
                    title={c ? `${labels[dow]} ${h}:00 — ${c.noShow} no-show${c.noShow !== 1 ? 's' : ''} of ${c.total}` : 'No appointments'}
                    className={cn('flex h-7 items-center justify-center rounded-md text-[10px] font-semibold tabular', !c && 'bg-muted/40')}
                    style={
                      c
                        ? {
                            backgroundColor: c.noShow > 0 ? `hsl(0 72% 51% / ${0.12 + intensity * 0.55})` : 'hsl(var(--success) / 0.12)',
                            color: c.noShow > 0 ? (intensity > 0.5 ? '#fff' : 'hsl(0 72% 41%)') : 'hsl(var(--success))',
                          }
                        : undefined
                    }
                  >
                    {c ? (c.noShow || '·') : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Red = no-shows (darker = more) · green dot = all attended · number = no-show count.</p>
      </div>
    </div>
  );
}

function Trend({ trend }) {
  const months = trend?.months || [];
  if (!months.length) return <p className="text-sm text-muted-foreground">Not enough history yet.</p>;
  const max = Math.max(1, ...(trend.visits || []), ...(trend.newPatients || []));
  return (
    <div>
      <div className="flex h-40 items-end gap-2">
        {months.map((m, i) => (
          <div key={m} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/3 rounded-t bg-primary/85"
                style={{ height: `${Math.max(3, ((trend.visits[i] || 0) / max) * 100)}%` }}
                title={`${monthLabel(m)}: ${trend.visits[i] || 0} visits`}
              />
              <div
                className="w-1/3 rounded-t bg-success/80"
                style={{ height: `${Math.max(3, ((trend.newPatients[i] || 0) / max) * 100)}%` }}
                title={`${monthLabel(m)}: ${trend.newPatients[i] || 0} new patients`}
              />
            </div>
            <span className="text-[10.5px] text-muted-foreground">{monthLabel(m)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary/85" /> Visits</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-success/80" /> New patients</span>
      </div>
    </div>
  );
}

function Pnl({ rows }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.revenue, r.expenses)));
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.month} className="text-sm">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-muted-foreground">{monthLabel(r.month)}</span>
            <span className={cn('font-semibold tabular', r.net >= 0 ? 'text-success' : 'text-destructive')}>
              {r.net >= 0 ? '+' : '−'}{inr(Math.abs(r.net))}
            </span>
          </div>
          <div className="space-y-1">
            <div className="h-2 overflow-hidden rounded-full bg-muted" title={`Revenue ${inr(r.revenue)}`}>
              <div className="h-full rounded-full bg-success/80" style={{ width: `${(r.revenue / max) * 100}%` }} />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" title={`Expenses ${inr(r.expenses)}`}>
              <div className="h-full rounded-full bg-destructive/70" style={{ width: `${(r.expenses / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-success/80" /> Revenue collected</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-destructive/70" /> Expenses</span>
      </div>
    </div>
  );
}
