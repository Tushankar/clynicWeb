import { useState } from 'react';
import { HeartHandshake, UserMinus, Repeat, Gem, Cake, CalendarClock, UserPlus, Send } from 'lucide-react';
import { PageHeader, StatCard, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCrmSummary, useCrmSegment, useReengage } from '@/hooks/useCrm';
import { toast, toastApiError } from '@/lib/toast';

// Each retention segment: card metadata + how to render its drill-down rows.
const SEGMENTS = [
  { key: 'lapsed', label: 'Lapsed (6m+)', icon: UserMinus, hint: 'Not seen in 6 months', reengage: true },
  { key: 'repeat', label: 'Repeat patients', icon: Repeat, hint: '2+ completed visits' },
  { key: 'high_value', label: 'High-value', icon: Gem, hint: 'By lifetime revenue' },
  { key: 'birthdays', label: 'Birthdays (30d)', icon: Cake, hint: 'Upcoming' },
  { key: 'followups_due', label: 'Follow-ups due', icon: CalendarClock, hint: 'Within 7 days', reengage: true },
  { key: 'new_this_month', label: 'New this month', icon: UserPlus, hint: 'Newly registered' },
];
const countKey = { lapsed: 'lapsed', repeat: 'repeat', high_value: 'highValue', birthdays: 'birthdays', followups_due: 'followupsDue', new_this_month: 'newThisMonth' };

export default function CrmPage() {
  return (
    <FeatureGate feature="CRM">
      <CrmInner />
    </FeatureGate>
  );
}

function CrmInner() {
  const { data, isLoading } = useCrmSummary();
  const counts = data?.counts || {};
  const [active, setActive] = useState('lapsed');

  return (
    <div className="space-y-6">
      <PageHeader title="CRM & retention" description="Where is revenue leaking? Re-engage lapsed patients and reward your regulars." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {SEGMENTS.map((s) => (
          <button key={s.key} type="button" onClick={() => setActive(s.key)} className="text-left">
            <StatCard
              label={s.label}
              value={counts[countKey[s.key]] ?? 0}
              icon={s.icon}
              hint={s.hint}
              loading={isLoading}
              className={cn('transition-shadow hover:border-primary/40', active === s.key && 'border-primary ring-1 ring-primary/30')}
            />
          </button>
        ))}
      </div>

      <SegmentTable segment={SEGMENTS.find((s) => s.key === active)} />
    </div>
  );
}

function SegmentTable({ segment }) {
  const q = useCrmSegment(segment.key);
  const reengage = useReengage();
  const rows = q.data?.items || [];

  const doReengage = async (p) => {
    try {
      await reengage.mutateAsync(p._id);
      toast.success(`Re-engagement message sent to ${p.name}`);
    } catch (err) {
      toastApiError(err);
    }
  };

  const columns = [
    { key: 'name', header: 'Patient', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'phone', header: 'Phone', className: 'tabular', render: (p) => p.phone || '—' },
    segment.key === 'high_value'
      ? { key: 'revenue', header: 'Lifetime revenue', align: 'right', className: 'tabular', render: (p) => `₹${(p.revenue ?? 0).toLocaleString('en-IN')}` }
      : segment.key === 'birthdays'
      ? { key: 'bday', header: 'Birthday in', align: 'right', render: (p) => `${p.daysToBirthday} day(s)` }
      : { key: 'last', header: 'Last visit', align: 'right', render: (p) => (p.lastVisitAt ? fmtDate(p.lastVisitAt) : '—') },
  ];
  if (segment.reengage) {
    columns.push({
      key: 'action',
      header: '',
      align: 'right',
      render: (p) => (
        <Button variant="outline" size="sm" onClick={() => doReengage(p)} disabled={reengage.isPending || !p.email} title={p.email ? 'Send a re-engagement email' : 'No email on file'}>
          <Send className="h-3.5 w-3.5" /> Re-engage
        </Button>
      ),
    });
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{segment.label}</h2>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={q.isLoading}
        isError={q.isError}
        error={q.error}
        onRetry={q.refetch}
        empty={{ icon: HeartHandshake, title: 'No patients in this segment', description: 'As your clinic sees more patients, retention segments fill in here.' }}
      />
    </div>
  );
}
