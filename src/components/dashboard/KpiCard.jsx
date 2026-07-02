import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkline } from '@/components/charts/Sparkline';
import { cn } from '@/lib/utils';

// Soft icon containers + matching sparkline hue, one per KPI (calm, not bright).
const TINTS = {
  blue: 'bg-blue-50 text-blue-600',
  teal: 'bg-teal-50 text-teal-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
};
const SPARK = { blue: '#2563eb', teal: '#14b8a6', green: '#16a34a', amber: '#f59e0b', rose: '#e11d48', violet: '#7c3aed' };

/**
 * KpiCard — top label, big metric, day-over-day trend, and a tiny sparkline.
 * `trend` = { dir: 'up'|'down'|'flat', good: boolean, text: string }.
 */
export function KpiCard({ label, value, icon: Icon, tint = 'blue', trend, spark = [], loading }) {
  const TrendIcon = trend?.dir === 'down' ? TrendDown : trend?.dir === 'up' ? TrendUp : Minus;
  return (
    <Card className="card-lift p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', TINTS[tint])}>
            <Icon weight="duotone" className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-9 w-24" />
      ) : (
        <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight tabular text-foreground">{value}</p>
      )}

      <div className="mt-3 flex items-end justify-between gap-3">
        {trend && !loading ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold',
              trend.dir === 'flat' ? 'text-muted-foreground' : trend.good ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            <TrendIcon weight="bold" className="h-3.5 w-3.5" />
            {trend.text}
          </span>
        ) : (
          <span />
        )}
        {!loading && spark.length > 1 && <Sparkline data={spark} color={SPARK[tint]} className="h-8 w-24" />}
      </div>
    </Card>
  );
}
