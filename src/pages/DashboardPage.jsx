import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Users, CalendarCheck, CurrencyInr, Clock, UserMinus, Sparkle, ArrowRight, CaretRight,
  Play, SkipForward, Broadcast, ClockCountdown, UserPlus, Plus, ChartLineUp,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/primitives';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MiniArea } from '@/components/charts/MiniArea';
import { Bars } from '@/components/charts/Bars';
import { Donut } from '@/components/charts/Donut';
import { useDashboard } from '@/hooks/useDashboard';
import { useMe } from '@/hooks/useMe';
import { useHasRole } from '@/hooks/useRole';
import { fmtTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import { WalkInDialog } from '@/components/appointments/WalkInDialog';

/* ---------- small local helpers ---------- */

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const AVATAR_TINTS = ['bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '—';
}
function Avatar({ name, className }) {
  const tint = AVATAR_TINTS[(name?.length || 0) % AVATAR_TINTS.length];
  return <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', tint, className)}>{initials(name)}</span>;
}

function SectionCard({ title, icon: Icon, action, className, bodyClassName, children }) {
  return (
    // h-full: cards in a grid row share one bottom edge — ragged card bottoms read as broken.
    <Card className={cn('card-lift flex h-full flex-col', className)}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon weight="duotone" className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />}
          <h3 className="truncate text-[15px] font-semibold text-foreground">{title}</h3>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
    </Card>
  );
}

/** Quiet period metadata for analytics cards — same position on every card, so it's learnable. */
function PeriodPill({ children }) {
  return (
    <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function ViewAll({ to, label = 'View all' }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
      {label} <ArrowRight weight="bold" className="h-3.5 w-3.5" />
    </Link>
  );
}

function kpiTrend(key, k) {
  if (!k) return null;
  const text = key === 'avgWait'
    ? `${Math.abs(k.deltaAbs)} min${Math.abs(k.deltaAbs) === 1 ? '' : 's'} from yesterday`
    : `${Math.abs(k.deltaPct)}% from yesterday`;
  return { dir: k.dir, good: k.good, text };
}

/* ---------- page ---------- */

export default function DashboardPage() {
  const canManage = useHasRole('owner', 'receptionist');
  const clinicName = useMe().data?.clinic?.name;
  const { user } = useUser();
  const { data, isLoading } = useDashboard();

  const [bookOpen, setBookOpen] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);

  const k = data?.kpis;
  const appts = data?.appointments || [];
  const queue = data?.queue || { nowServing: [], waiting: [], counts: { waiting: 0, serving: 0 } };
  const doctors = data?.doctors || [];
  const activity = data?.activity || [];
  const suggestions = data?.ai?.suggestions || [];
  const demo = data?.demographics || { total: 0, male: 0, female: 0, other: 0 };
  const weekly = data?.weekly || { revenue: [], appointments: [] };

  const now = new Date();
  const nextAppt = useMemo(
    () => appts.find((a) => new Date(a.scheduledAt) > now && ['booked', 'confirmed'].includes(a.status)),
    [appts]
  );
  const minutesTo = nextAppt ? Math.max(0, Math.round((new Date(nextAppt.scheduledAt) - now) / 60000)) : null;
  const revenueTotal = weekly.revenue.reduce((s, d) => s + d.value, 0);
  const apptTotal = weekly.appointments.reduce((s, d) => s + d.value, 0);

  const KPI = [
    { key: 'patients', label: "Today's Patients", icon: Users, tint: 'blue', fmt: (v) => v },
    { key: 'appointments', label: 'Appointments', icon: CalendarCheck, tint: 'teal', fmt: (v) => v },
    { key: 'revenue', label: 'Revenue', icon: CurrencyInr, tint: 'green', fmt: (v) => `₹${(v || 0).toLocaleString('en-IN')}` },
    { key: 'avgWait', label: 'Avg Wait', icon: Clock, tint: 'amber', fmt: (v) => `${v} min` },
    { key: 'noShows', label: 'No Shows', icon: UserMinus, tint: 'rose', fmt: (v) => v },
  ];

  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* ---------- Hero ---------- */}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr] xl:items-center">
        <div className="flex flex-col justify-center">
          <p className="text-sm text-muted-foreground">{greeting()},</p>
          <h1 className="mt-0.5 text-[32px] font-bold leading-tight tracking-tight text-foreground">
            {user?.fullName || clinicName || 'Welcome back'} <span className="align-middle">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything looks healthy today.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip icon={CalendarCheck} tint="blue" label={`${k?.appointments.value ?? '—'} appointments`} />
            <Chip icon={Users} tint="teal" label={`${queue.counts.waiting} patients waiting`} />
            <Chip icon={CurrencyInr} tint="green" label={`₹${(k?.revenue.value ?? 0).toLocaleString('en-IN')} revenue`} />
            {canManage && (
              <>
                <Button size="sm" onClick={() => setBookOpen(true)}><Plus weight="bold" className="h-4 w-4" /> New appointment</Button>
                <Button size="sm" variant="outline" onClick={() => setWalkOpen(true)}><UserPlus weight="bold" className="h-4 w-4" /> Walk-in</Button>
              </>
            )}
          </div>
        </div>

        <Card className="card-lift grid grid-cols-1 divide-y divide-border p-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col py-3 first:pt-0 sm:py-0 sm:pr-4">
            <div className="flex h-5 items-center gap-1.5 text-xs font-medium text-muted-foreground"><CalendarCheck weight="duotone" className="h-4 w-4 shrink-0" /> <span className="truncate">Today</span></div>
            <p className="mt-2 text-sm font-semibold leading-snug text-foreground">{dateLabel}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">Kolkata, India</p>
          </div>
          <div className="flex flex-col py-3 sm:py-0 sm:px-4">
            <div className="flex h-5 items-center gap-1.5 text-xs font-medium text-muted-foreground"><Broadcast weight="duotone" className="h-4 w-4 shrink-0" /> <span className="truncate">Status</span></div>
            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational
            </span>
            <p className="mt-1 truncate text-xs text-muted-foreground">All systems normal</p>
          </div>
          <div className="flex flex-col py-3 last:pb-0 sm:py-0 sm:pl-4">
            <div className="flex h-5 items-center gap-1.5 text-xs font-medium text-muted-foreground"><ClockCountdown weight="duotone" className="h-4 w-4 shrink-0" /> <span className="truncate">Next visit</span></div>
            {nextAppt ? (
              <>
                <p className="mt-2 text-lg font-bold leading-none tabular text-foreground">{fmtTime(nextAppt.scheduledAt)}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{nextAppt.patientName}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary"><ClockCountdown weight="duotone" className="h-3.5 w-3.5 shrink-0" /> in {minutesTo} min</span>
              </>
            ) : (
              <p className="mt-2 text-sm font-medium text-foreground">Nothing yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* ---------- KPI row ---------- */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {KPI.map((c) => (
          <KpiCard
            key={c.key}
            label={c.label}
            icon={c.icon}
            tint={c.tint}
            loading={isLoading}
            value={k ? c.fmt(k[c.key].value) : '—'}
            trend={kpiTrend(c.key, k?.[c.key])}
            spark={k?.[c.key].spark || []}
          />
        ))}
      </div>

      {/* ---------- Queue + Appointments + AI ---------- */}
      <div className="grid gap-5 xl:grid-cols-12">
        {/* Live queue */}
        <SectionCard
          className="xl:col-span-4"
          title="Live Queue"
          action={<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span> Live</span>}
          bodyClassName="flex flex-col p-0"
        >
          <div className="flex-1">
            {queue.waiting.length === 0 && queue.nowServing.length === 0 ? (
              <EmptyRow icon={Broadcast} text="Queue is empty right now." />
            ) : (
              <div className="divide-y">
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Token</span><span>Patient</span><span>Wait</span>
                </div>
                {queue.waiting.slice(0, 4).map((e) => (
                  <div key={e.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/50">
                    <span className="flex h-8 w-11 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold font-mono text-primary">{e.token}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.doctorName || '—'}</p>
                    </div>
                    <span className="tabular text-xs text-muted-foreground">{e.waitMinutes}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3">
            {canManage && <Button size="sm" asChild><Link to="/dashboard/queue"><Play weight="fill" className="h-4 w-4" /> Call next</Link></Button>}
            {canManage && <Button size="sm" variant="outline" asChild><Link to="/dashboard/queue"><SkipForward weight="fill" className="h-4 w-4" /> Skip</Link></Button>}
            <span className="ml-auto"><ViewAll to="/dashboard/queue" label="View all queue" /></span>
          </div>
        </SectionCard>

        {/* Today's appointments */}
        <SectionCard className="xl:col-span-5" title="Today's Appointments" action={<ViewAll to="/dashboard/appointments" />} bodyClassName="flex flex-col p-0">
          <div className="flex-1">
            {appts.length === 0 ? (
              <EmptyRow icon={CalendarCheck} text="Nothing booked yet today." />
            ) : (
              <div className="max-h-[320px] divide-y overflow-y-auto">
                {appts.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/50">
                    <span className="w-14 shrink-0 tabular text-xs font-medium text-muted-foreground">{fmtTime(a.scheduledAt)}</span>
                    <Avatar name={a.patientName} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" title={a.patientName}>{a.patientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.doctorName}{a.department ? ` · ${a.department}` : ''}</p>
                    </div>
                    <div className="shrink-0"><StatusBadge status={a.status} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t px-5 py-3">
            <span className="text-xs text-muted-foreground">{appts.length} scheduled today</span>
            {canManage && (
              <Button size="sm" variant="outline" onClick={() => setBookOpen(true)}>
                <Plus weight="bold" className="h-4 w-4" /> New appointment
              </Button>
            )}
          </div>
        </SectionCard>

        {/* AI assistant */}
        <SectionCard className="xl:col-span-3" title="AI Assistant" icon={Sparkle} bodyClassName="flex flex-col p-5">
          <p className="-mt-1 mb-3 text-xs font-medium text-muted-foreground">Today's suggestions</p>
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">All clear — nothing needs your attention right now.</p>
          ) : (
            <ul className="space-y-2.5">
              {suggestions.map((s) => (
                <li key={s.key}>
                  <Link to={s.link} className="group flex items-start gap-2.5 rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/60">
                    <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                      s.tone === 'warning' ? 'bg-amber-50 text-amber-600' : s.tone === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')}>
                      <Sparkle weight="fill" className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] leading-snug text-foreground">{s.text}</span>
                      <span className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">{s.cta} <CaretRight weight="bold" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Button variant="secondary" className="mt-auto w-full" asChild>
            <Link to="/dashboard/ai"><Sparkle weight="fill" className="h-4 w-4" /> Ask AI Assistant</Link>
          </Button>
        </SectionCard>
      </div>

      {/* ---------- Charts + Activity ----------
          Shared card anatomy: header (title + quiet period pill) → stat on a common
          baseline → visualization pinned to the bottom edge at one height. The grid
          stretches (no items-start), so all four cards share top and bottom edges. */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
        <SectionCard
          className="xl:col-span-3"
          title="Revenue Overview"
          icon={ChartLineUp}
          action={<PeriodPill>Last 7 days</PeriodPill>}
          bodyClassName="flex flex-1 flex-col p-5"
        >
          <p className="text-[26px] font-semibold leading-none tracking-tight tabular text-foreground">
            ₹{revenueTotal.toLocaleString('en-IN')}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">collected this week</p>
          <MiniArea data={weekly.revenue} color="hsl(var(--primary))" height={102} className="mt-auto pt-4" />
        </SectionCard>

        <SectionCard
          className="xl:col-span-3"
          title="Appointments"
          icon={CalendarCheck}
          action={<PeriodPill>Last 7 days</PeriodPill>}
          bodyClassName="flex flex-1 flex-col p-5"
        >
          <p className="text-[26px] font-semibold leading-none tracking-tight tabular text-foreground">{apptTotal}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">visits booked this week</p>
          <Bars className="mt-auto h-[131px] pt-4" data={weekly.appointments.map((d) => ({ ...d, short: d.label }))} />
        </SectionCard>

        <SectionCard
          className="xl:col-span-3"
          title="Patient Demographics"
          icon={Users}
          action={<PeriodPill>All patients</PeriodPill>}
          bodyClassName="flex flex-1 flex-col p-5"
        >
          {demo.total === 0 ? (
            <EmptyRow icon={Users} text="No patients yet." />
          ) : (
            <div className="flex flex-1 items-center gap-6">
              <Donut
                size={124}
                thickness={13}
                centerValue={demo.total}
                centerLabel="patients"
                className="shrink-0"
                segments={[
                  { label: 'Male', value: demo.male, color: '#2563eb' },
                  { label: 'Female', value: demo.female, color: '#f43f5e' },
                  { label: 'Other', value: demo.other, color: '#f59e0b' },
                ]}
              />
              {/* legend as a tiny table: label left, % strong, count in a fixed muted column */}
              <ul className="min-w-0 flex-1 space-y-3">
                {[{ l: 'Male', v: demo.male, c: 'bg-blue-600' }, { l: 'Female', v: demo.female, c: 'bg-rose-500' }, { l: 'Other', v: demo.other, c: 'bg-amber-500' }].map((r) => (
                  <li key={r.l} className="flex items-center gap-2.5 text-sm">
                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', r.c)} />
                    <span className="truncate text-muted-foreground">{r.l}</span>
                    <span className="ml-auto shrink-0 font-semibold tabular text-foreground">
                      {demo.total ? Math.round((r.v / demo.total) * 100) : 0}%
                    </span>
                    <span className="w-8 shrink-0 text-right tabular text-xs text-muted-foreground">{r.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        <SectionCard
          className="xl:col-span-3"
          title="Activity Feed"
          icon={Broadcast}
          action={<ViewAll to="/dashboard/appointments" label="View all" />}
          bodyClassName="flex-1 p-5"
        >
          {activity.length === 0 ? (
            <EmptyRow icon={Broadcast} text="No recent activity." />
          ) : (
            <ul className="max-h-[240px] space-y-3 overflow-y-auto pr-1">
              {activity.map((ev, i) => (
                <li key={i} className="flex gap-3">
                  <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', ACTIVITY_DOT[ev.type] || 'bg-muted-foreground')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-foreground">{ev.message}</p>
                    {ev.subject && <p className="truncate text-xs text-muted-foreground">{ev.subject}</p>}
                  </div>
                  <span className="shrink-0 tabular text-[11px] text-muted-foreground">{fmtTime(ev.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* ---------- Doctor availability ---------- */}
      <SectionCard title="Doctor Availability" icon={Users} action={<ViewAll to="/dashboard/doctors" label="Manage" />} bodyClassName="p-4">
        {doctors.length === 0 ? (
          <EmptyRow icon={Users} text="No doctors added yet." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {doctors.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-white/50 bg-card/50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="relative">
                  <Avatar name={d.name} className="h-11 w-11 text-sm" />
                  <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card', d.status === 'in_consultation' ? 'bg-amber-500' : 'bg-emerald-500')} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.specialization}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className={cn('font-medium', d.status === 'in_consultation' ? 'text-amber-600' : 'text-emerald-600')}>{d.status === 'in_consultation' ? 'In consultation' : 'Available'}</span>
                    <span>·</span>
                    <span className="tabular">{d.patientsToday} today</span>
                  </div>
                  {d.hours && <p className="truncate text-[11px] text-muted-foreground">{d.hours}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} />
      <WalkInDialog open={walkOpen} onOpenChange={setWalkOpen} />
    </div>
  );
}

const ACTIVITY_DOT = {
  payment_received: 'bg-emerald-500',
  checked_in: 'bg-blue-500',
  completed: 'bg-violet-500',
  confirmed: 'bg-teal-500',
  patient_registered: 'bg-amber-500',
};

function Chip({ icon: Icon, label, tint = 'blue' }) {
  const t = { blue: 'text-blue-600', teal: 'text-teal-600', green: 'text-emerald-600' }[tint];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/[0.06]"
      style={{ backdropFilter: 'blur(10px) saturate(1.5)', WebkitBackdropFilter: 'blur(10px) saturate(1.5)' }}
    >
      <Icon weight="duotone" className={cn('h-4 w-4', t)} /> {label}
    </span>
  );
}

function EmptyRow({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon weight="duotone" className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
