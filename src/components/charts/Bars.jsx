import { cn } from '@/lib/utils';

/**
 * Bars — a lightweight, dependency-free bar chart built from theme tokens (no chart
 * library, no stray hex). `data` is [{ label, value, short? }]. Vertical by default;
 * pass `horizontal` for ranked lists (e.g. doctors). Accessible via per-bar titles.
 */
export function Bars({ data = [], horizontal = false, format = (v) => v, className, barClassName }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="text-sm text-muted-foreground">No data for this range.</p>;

  if (horizontal) {
    return (
      <div className={cn('space-y-2', className)}>
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 truncate text-muted-foreground">{d.label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
              <div className={cn('h-full rounded bg-primary/80', barClassName)} style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="w-12 shrink-0 text-right tabular font-medium">{format(d.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex h-44 items-end gap-1', className)}>
      {data.map((d, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <div
            className={cn('w-full rounded-t bg-primary/80 transition-[height]', barClassName)}
            style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
            title={`${d.label}: ${format(d.value)}`}
          />
          {d.short != null && <span className="text-[10px] tabular text-muted-foreground">{d.short}</span>}
        </div>
      ))}
    </div>
  );
}
