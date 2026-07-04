import { useState } from 'react';
import { Send, Handshake, CalendarClock, Mail, MessageCircle, Megaphone } from 'lucide-react';
import { PageHeader, StatCard, DataTable, Avatar } from '@/components/primitives';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fmtDateTime } from '@/lib/format';
import { useCommsSummary, useCommsList } from '@/hooks/useCommunications';

// Template → display metadata (icon + badge tint). Keep in sync with the API's template enum.
const TEMPLATE_META = {
  reengage: { label: 'Re-engagement', icon: Handshake, badge: 'bg-violet-100 text-violet-700' },
  birthday: { label: 'Birthday wish', icon: Handshake, badge: 'bg-pink-100 text-pink-700' },
  followup: { label: 'Follow-up reminder', icon: CalendarClock, badge: 'bg-amber-100 text-amber-700' },
  appointment_24h: { label: 'Reminder · 24h', icon: CalendarClock, badge: 'bg-blue-100 text-blue-700' },
  appointment_2h: { label: 'Reminder · 2h', icon: CalendarClock, badge: 'bg-sky-100 text-sky-700' },
  booking_confirmation: { label: 'Booking confirmation', icon: CalendarClock, badge: 'bg-emerald-100 text-emerald-700' },
  appointment_cancelled: { label: 'Cancellation notice', icon: CalendarClock, badge: 'bg-rose-100 text-rose-700' },
  appointment_rescheduled: { label: 'Reschedule notice', icon: CalendarClock, badge: 'bg-teal-100 text-teal-700' },
  review_request: { label: 'Review request', icon: Handshake, badge: 'bg-indigo-100 text-indigo-700' },
  recall: { label: 'Treatment recall', icon: CalendarClock, badge: 'bg-cyan-100 text-cyan-700' },
  waitlist: { label: 'Waitlist alert', icon: Megaphone, badge: 'bg-orange-100 text-orange-700' },
  payment_link: { label: 'Payment link', icon: Megaphone, badge: 'bg-green-100 text-green-700' },
  document: { label: 'Shared document', icon: Mail, badge: 'bg-slate-100 text-slate-700' },
  custom: { label: 'Message', icon: Megaphone, badge: 'bg-slate-100 text-slate-700' },
};
const CHANNEL_ICON = { email: Mail, whatsapp: MessageCircle, sms: MessageCircle };

export default function CommunicationsPage() {
  const summary = useCommsSummary();
  const [filter, setFilter] = useState(null); // null = all templates
  const list = useCommsList({ template: filter });
  const rows = list.data?.items || [];
  const s = summary.data || { total: 0, failed: 0, byTemplate: [] };

  const columns = [
    {
      key: 'patient',
      header: 'Recipient',
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar name={m.patientName || m.to} />
          <div className="min-w-0 max-w-[180px]">
            <span className="block truncate font-semibold text-foreground">{m.patientName || '—'}</span>
            <span className="block truncate text-xs text-muted-foreground">{m.to}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'template',
      header: 'Template',
      className: 'whitespace-nowrap',
      render: (m) => {
        const meta = TEMPLATE_META[m.template] || TEMPLATE_META.custom;
        return (
          <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', meta.badge)}>
            <meta.icon className="h-3.5 w-3.5 shrink-0" /> {m.templateLabel || meta.label}
          </span>
        );
      },
    },
    {
      // Flexible column: absorbs the leftover width and truncates, so the table always
      // fits the container (max-w-0 + w-full is the standard truncating-table-cell trick).
      key: 'subject',
      header: 'Subject',
      className: 'w-full max-w-0',
      render: (m) => (
        <span className="block truncate text-muted-foreground" title={m.subject || ''}>
          {m.subject || '—'}
        </span>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      className: 'whitespace-nowrap',
      render: (m) => {
        const Icon = CHANNEL_ICON[m.channel] || Mail;
        return <span className="inline-flex items-center gap-1.5 capitalize"><Icon className="h-4 w-4 shrink-0 text-muted-foreground" /> {m.channel}</span>;
      },
    },
    { key: 'sentBy', header: 'Sent by', className: 'whitespace-nowrap', render: (m) => <span className="capitalize text-muted-foreground">{m.sentBy === 'system' ? 'Automated' : m.sentByRole || 'Staff'}</span> },
    { key: 'when', header: 'When', align: 'right', className: 'whitespace-nowrap tabular text-muted-foreground', render: (m) => fmtDateTime(m.createdAt) },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (m) => (
        <Badge variant={m.status === 'failed' ? 'destructive' : 'secondary'} className={m.status === 'sent' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : undefined}>
          {m.status === 'sent' ? 'Sent' : 'Failed'}
        </Badge>
      ),
    },
  ];

  // Tighten the default cell padding (px-5 → px-3) so all seven columns fit without scrolling.
  const compactColumns = columns.map((c) => ({
    ...c,
    className: cn('px-3', c.className),
    headClassName: cn('px-3', c.headClassName),
  }));

  // Cards: Total sent + one per template that has any sends.
  const cards = [
    { key: null, label: 'Total sent', value: s.total, icon: Send, hint: s.failed ? `${s.failed} failed` : 'All delivered' },
    ...s.byTemplate.map((t) => ({
      key: t.template,
      label: (TEMPLATE_META[t.template] || TEMPLATE_META.custom).label,
      value: t.count,
      icon: (TEMPLATE_META[t.template] || TEMPLATE_META.custom).icon,
      hint: t.lastSentAt ? `Last: ${fmtDateTime(t.lastSentAt)}` : undefined,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Communications" description="Every message your clinic has sent — who received it, which template, and how many times." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <button key={c.key ?? 'total'} type="button" onClick={() => setFilter(c.key)} className="text-left">
            <StatCard
              label={c.label}
              value={c.value ?? 0}
              icon={c.icon}
              hint={c.hint}
              loading={summary.isLoading}
              className={cn('transition-shadow hover:border-primary/40', filter === c.key && 'border-primary ring-1 ring-primary/30')}
            />
          </button>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filter ? (TEMPLATE_META[filter] || TEMPLATE_META.custom).label : 'All messages'}
          </h2>
          {filter && (
            <button type="button" onClick={() => setFilter(null)} className="text-sm font-medium text-primary hover:underline">
              Show all
            </button>
          )}
        </div>
        <DataTable
          columns={compactColumns}
          data={rows}
          isLoading={list.isLoading}
          isError={list.isError}
          error={list.error}
          onRetry={list.refetch}
          empty={{ icon: Send, title: 'No messages sent yet', description: 'Re-engagement emails and appointment reminders you send will appear here.' }}
        />
      </div>
    </div>
  );
}
