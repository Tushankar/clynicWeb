import { useState } from 'react';
import { ChartLineUp, CurrencyInr, Percent, Wallet, Package, WarningCircle, Prohibit, ShoppingBag, TrendUp } from '@phosphor-icons/react';
import { PageHeader, StatCard, DataTable, LoadingSkeleton } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePharmacyReports } from '@/hooks/usePharmacy';
import { cn } from '@/lib/utils';

const inr = (v) => `₹${(Math.round((v ?? 0) * 100) / 100).toLocaleString('en-IN')}`;
const monthLabel = (ym) => {
  const [y, m] = (ym || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
};

export default function PharmacyReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy reports" description="Sales, margins, expenses and stock valuation — the pharmacy's books at a glance." />
      <FeatureGate feature="PHARMACY_ANALYTICS">
        <ReportsBody />
      </FeatureGate>
    </div>
  );
}

function ReportsBody() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [applied, setApplied] = useState({});
  const { data, isLoading, isError, error, refetch } = usePharmacyReports(applied);
  const r = data || {};
  const sales = r.sales || {};
  const expenses = r.expenses || {};
  const stock = r.stock || {};
  const queue = r.ordersQueue || {};

  if (isError) {
    return (
      <Card className="flex flex-col items-center px-6 py-14 text-center">
        <ChartLineUp className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">{error?.message || 'Could not load reports.'}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Retry</Button>
      </Card>
    );
  }

  const columns = [
    { key: 'name', header: 'Medicine', render: (m) => <span className="font-semibold text-foreground">{m.name}</span> },
    { key: 'qty', header: 'Qty sold', align: 'right', render: (m) => <span className="tabular">{m.qty}</span> },
    { key: 'revenue', header: 'Revenue', align: 'right', render: (m) => inr(m.revenue) },
    { key: 'cogs', header: 'Cost', align: 'right', className: 'text-muted-foreground', render: (m) => inr(m.cogs) },
    {
      key: 'margin', header: 'Margin', align: 'right', render: (m) => (
        <span className={cn('font-semibold tabular', m.margin >= 0 ? 'text-success' : 'text-destructive')}>{inr(m.margin)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Period picker */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">From</span>
          <Input type="date" className="h-9 w-40" value={range.from} onChange={(e) => setRange((x) => ({ ...x, from: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">To</span>
          <Input type="date" className="h-9 w-40" value={range.to} onChange={(e) => setRange((x) => ({ ...x, to: e.target.value }))} />
        </div>
        <Button variant="outline" size="sm" className="h-9" onClick={() => setApplied({ ...(range.from && { from: range.from }), ...(range.to && { to: range.to }) })}>Apply</Button>
        {(applied.from || applied.to) && (
          <Button variant="ghost" size="sm" className="h-9" onClick={() => { setRange({ from: '', to: '' }); setApplied({}); }}>Last 30 days</Button>
        )}
      </div>

      {/* Money KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sales revenue" value={inr(sales.revenue)} icon={CurrencyInr} loading={isLoading} hint={`${sales.dispenses ?? 0} dispenses · ${sales.fulfilledOrders ?? 0} online orders`} />
        <StatCard label="Gross margin" value={inr(sales.grossMargin)} icon={TrendUp} loading={isLoading} hint={`${sales.marginPct ?? 0}% of sales · COGS ${inr(sales.cogs)}`} />
        <StatCard label="Expenses" value={inr(expenses.total)} icon={Wallet} loading={isLoading} hint={`stock ${inr(expenses.purchases)} · other ${inr(expenses.other)}`} />
        <StatCard label="Net (operating)" value={inr(r.net)} icon={Percent} loading={isLoading} hint="gross margin − other expenses" />
      </div>

      {/* Stock health + queue */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Stock value" value={inr(stock.stockValue)} icon={Package} loading={isLoading} hint={`${stock.totalBatches ?? 0} batches, at cost`} />
        <StatCard label="Low stock" value={stock.lowStockCount ?? 0} icon={WarningCircle} loading={isLoading} hint="at/below reorder level" />
        <StatCard label="Expiring soon" value={stock.expiringBatches ?? 0} icon={WarningCircle} loading={isLoading} hint={`within ${stock.nearExpiryDays ?? 60} days`} />
        <StatCard label="Expired" value={stock.expiredBatches ?? 0} icon={Prohibit} loading={isLoading} hint="excluded from availability" />
        <StatCard label="Today's sales" value={inr(sales.today)} icon={ShoppingBag} loading={isLoading} hint={`${sales.todayCount ?? 0} sale(s) · ${queue.pending ?? 0} orders pending${queue.rxAwaitingVerification ? ` · ${queue.rxAwaitingVerification} Rx to verify` : ''}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 6-month P&L trend (same visual idiom as the clinic P&L in Analytics) */}
        <Card className="p-5">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Monthly trend</h3>
          <p className="mb-4 text-xs text-muted-foreground">Sales vs expenses (cash view) — last 6 months.</p>
          {isLoading ? <LoadingSkeleton lines={5} /> : <Trend rows={r.trend || []} />}
        </Card>

        {/* Top medicines */}
        <div>
          <DataTable
            columns={columns}
            data={r.topMedicines || []}
            getRowId={(m) => m.medicineId}
            isLoading={isLoading}
            pagination={false}
            empty={{ icon: ChartLineUp, title: 'No sales in this period', description: 'Dispense at the counter or fulfil online orders and the leaders appear here.' }}
          />
        </div>
      </div>
    </div>
  );
}

/** Revenue vs expenses paired bars per month — same pattern as the clinic P&L widget. */
function Trend({ rows }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
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
            <div className="h-2 overflow-hidden rounded-full bg-muted" title={`Sales ${inr(r.revenue)}`}>
              <div className="h-full rounded-full bg-success/80" style={{ width: `${(r.revenue / max) * 100}%` }} />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" title={`Expenses ${inr(r.expenses)}`}>
              <div className="h-full rounded-full bg-destructive/70" style={{ width: `${(r.expenses / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
