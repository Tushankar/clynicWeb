import { CalendarDays, Pill, FileText, FlaskConical, Bell, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState, LoadingSkeleton } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { useTimeline } from '@/hooks/useClinical';
import { fmtDateTime } from '@/lib/format';

const ICONS = { appointment: CalendarDays, prescription: Pill, report: FileText, note: Activity, reminder: Bell, lab: FlaskConical };
const TONE = {
  appointment: 'bg-info/10 text-info',
  prescription: 'bg-primary/10 text-primary',
  report: 'bg-warning/15 text-warning',
  note: 'bg-secondary text-secondary-foreground',
  reminder: 'bg-muted text-muted-foreground',
};

export function TimelineTab({ patientId }) {
  const { data, isLoading, isError, error, refetch } = useTimeline(patientId);
  const items = data?.items || [];

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-destructive">{error?.message || 'Could not load timeline.'}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
      </Card>
    );
  }
  if (items.length === 0) return <div className="rounded-lg border border-dashed"><EmptyState icon={Activity} title="No history yet" description="Visits, prescriptions, reports and reminders will appear here." /></div>;

  // Group by year for a clear chronological read.
  const groups = items.reduce((acc, it) => {
    const year = new Date(it.date).getFullYear() || '—';
    (acc[year] = acc[year] || []).push(it);
    return acc;
  }, {});
  const years = Object.keys(groups).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {years.map((year) => (
        <div key={year}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{year}</h3>
          <ol className="relative space-y-4 border-l pl-6">
            {groups[year].map((it) => {
              const Icon = ICONS[it.type] || Activity;
              return (
                <li key={`${it.type}-${it.id}`} className="relative">
                  <span className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${TONE[it.type] || 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{it.title}</span>
                    <span className="shrink-0 text-caption text-muted-foreground">{fmtDateTime(it.date)}</span>
                  </div>
                  {it.meta && <p className="text-caption text-muted-foreground">{it.meta}</p>}
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
