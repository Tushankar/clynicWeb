import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

/**
 * StatCard — label + big number + optional icon, hint, and trend (section 8.5).
 * Pass `loading` to render a skeleton in place of the value.
 */
export function StatCard({ label, value, icon: Icon, hint, trend, loading, className }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular text-foreground">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {trend && !loading && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-xs font-medium',
            trend.direction === 'down' ? 'text-destructive' : 'text-success'
          )}
        >
          {trend.direction === 'down' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
          {trend.label}
        </div>
      )}
    </Card>
  );
}
