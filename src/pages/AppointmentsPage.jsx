import { useMemo, useState } from 'react';
import { addDays, parseISO, format } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, UserPlus, MoreHorizontal, LogIn, CalendarClock, XCircle, UsersRound, Download } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, Avatar } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAppointments, useCheckIn, useCancelAppointment } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import { useBranch } from '@/context/BranchContext';
import { useHasRole } from '@/hooks/useRole';
import { useFeature } from '@/hooks/usePlan';
import { useWaitlist } from '@/hooks/useSchedule';
import { useExportCsv } from '@/hooks/useExport';
import { fmtTime, todayISODate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import { WalkInDialog } from '@/components/appointments/WalkInDialog';
import { RescheduleDialog } from '@/components/appointments/RescheduleDialog';
import { WaitlistDialog } from '@/components/appointments/WaitlistDialog';
import { AppointmentDetailDialog } from '@/components/appointments/AppointmentDetailDialog';
import { PaymentBadge } from '@/components/appointments/PaymentBadge';

const ACTIVE_BOOKED = ['booked', 'confirmed'];
const inr = (v) => `₹${(Math.round((v ?? 0) * 100) / 100).toLocaleString('en-IN')}`;

const STATUS_FILTERS = [
  ['all', 'All statuses'],
  ['booked', 'Booked'],
  ['confirmed', 'Confirmed'],
  ['checked_in', 'Checked in'],
  ['in_consultation', 'In consultation'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
  ['no_show', 'No-show'],
];

export default function AppointmentsPage() {
  const [date, setDate] = useState(todayISODate());
  const [doctorId, setDoctorId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookOpen, setBookOpen] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [reschedule, setReschedule] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [selected, setSelected] = useState(null); // appointment detail drawer

  const canManage = useHasRole('owner', 'receptionist');
  const isOwner = useHasRole('owner');
  const hasWaitlist = useFeature('WAITLIST');
  const hasExport = useFeature('DATA_EXPORT');
  const exportCsv = useExportCsv();
  const doctors = useDoctors().data?.items || [];
  const { branchId } = useBranch(); // null = all branches (centralized view)
  const params = { date, ...(doctorId !== 'all' ? { doctorId } : {}), ...(branchId ? { branchId } : {}) };
  const { data, isLoading, isError, error, refetch } = useAppointments(params);
  const allAppts = data?.items || [];
  const appts = statusFilter === 'all' ? allAppts : allAppts.filter((a) => a.status === statusFilter);
  const waitlistCount = (useWaitlist({ date }, { enabled: hasWaitlist && canManage }).data?.items || []).length;

  // How many patients are waiting for the SAME doctor + day as the appointment being
  // cancelled — they get auto-notified of the freed slot, so we surface that to the desk.
  const cancelDate = cancelling ? format(new Date(cancelling.scheduledAt), 'yyyy-MM-dd') : null;
  const cancelWaiting = (
    useWaitlist({ date: cancelDate, doctorId: cancelling?.doctorId }, { enabled: !!cancelling && hasWaitlist }).data?.items || []
  ).filter((w) => w.status === 'waiting').length;

  // Day summary — counts + money, computed from the enriched (billing) list.
  const summary = useMemo(() => {
    const s = { total: allAppts.length, upcoming: 0, checkedIn: 0, completed: 0, noShow: 0, expected: 0, collected: 0, due: 0 };
    for (const a of allAppts) {
      if (ACTIVE_BOOKED.includes(a.status)) s.upcoming += 1;
      else if (a.status === 'checked_in' || a.status === 'in_consultation') s.checkedIn += 1;
      else if (a.status === 'completed') s.completed += 1;
      else if (a.status === 'no_show') s.noShow += 1;
      const b = a.billing;
      if (b && a.status !== 'cancelled' && a.status !== 'no_show') {
        s.expected += b.fee || 0;
        s.collected += b.paid || 0;
        s.due += b.due || 0;
      }
    }
    return s;
  }, [allAppts]);

  const doExport = async () => {
    try {
      await exportCsv.mutateAsync({ entity: 'appointments' });
      toast.success('Appointments exported');
    } catch (e) {
      toastApiError(e);
    }
  };

  const checkIn = useCheckIn();
  const cancel = useCancelAppointment();

  const shiftDay = (n) => setDate(format(addDays(parseISO(date), n), 'yyyy-MM-dd'));
  const dateLabel = format(parseISO(date), 'EEE, d MMM yyyy');

  const doCheckIn = async (a) => {
    setSelected(null);
    try {
      await checkIn.mutateAsync(a._id);
      toast.success(`${a.patientName} checked in`);
    } catch (err) {
      toastApiError(err);
    }
  };
  const doCancel = async () => {
    const waiting = cancelWaiting;
    const drName = cancelling?.doctorName;
    try {
      await cancel.mutateAsync({ id: cancelling._id });
      setCancelling(null);
      toast.success('Appointment cancelled');
      // Make the auto-notify visible: the freed slot was offered to waiting patients.
      if (waiting > 0) {
        toast('Waitlist notified', {
          description: `${waiting} waiting ${waiting === 1 ? 'patient was' : 'patients were'} offered this freed slot with ${drName || 'the doctor'}.`,
          action: { label: 'View waitlist', onClick: () => setWaitlistOpen(true) },
        });
      }
    } catch (err) {
      toastApiError(err);
    }
  };

  const columns = [
    { key: 'time', header: 'Time', className: 'tabular whitespace-nowrap', render: (a) => fmtTime(a.scheduledAt) },
    { key: 'token', header: 'Token', className: 'font-mono text-xs text-muted-foreground', render: (a) => (a.tokenNumber != null ? `#${a.tokenNumber}` : '—') },
    { key: 'patient', header: 'Patient', render: (a) => (
      <span className="flex items-center gap-3">
        <Avatar name={a.patientName || '?'} />
        <span className="font-semibold text-foreground">{a.patientName || '—'}</span>
      </span>
    ) },
    { key: 'doctor', header: 'Doctor', render: (a) => a.doctorName || '—' },
    { key: 'payment', header: 'Payment', render: (a) => <PaymentBadge billing={a.billing} /> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) =>
        canManage && ACTIVE_BOOKED.includes(a.status) ? (
          <span onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => doCheckIn(a)}>
                  <LogIn className="h-4 w-4" /> Check in
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReschedule(a)}>
                  <CalendarClock className="h-4 w-4" /> Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setCancelling(a)}>
                  <XCircle className="h-4 w-4" /> Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={dateLabel}
        actions={
          canManage && (
            <>
              {isOwner && hasExport && (
                <Button variant="ghost" onClick={doExport} disabled={exportCsv.isPending} aria-label="Export CSV">
                  <Download className="h-4 w-4" /> Export
                </Button>
              )}
              {hasWaitlist && (
                <Button variant="outline" onClick={() => setWaitlistOpen(true)}>
                  <UsersRound className="h-4 w-4" /> Waitlist
                  {waitlistCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary tabular">{waitlistCount}</span>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => setWalkOpen(true)}>
                <UserPlus className="h-4 w-4" /> Walk-in
              </Button>
              <Button onClick={() => setBookOpen(true)}>
                <Plus className="h-4 w-4" /> New appointment
              </Button>
            </>
          )
        }
      />

      {/* Day summary */}
      {!isLoading && summary.total > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          <SummaryChip label="Booked" value={summary.total} />
          <SummaryChip label="Upcoming" value={summary.upcoming} />
          <SummaryChip label="Checked in" value={summary.checkedIn} tone="info" />
          <SummaryChip label="Completed" value={summary.completed} tone="success" />
          <SummaryChip label="Expected" value={inr(summary.expected)} money />
          <SummaryChip label="Collected" value={inr(summary.collected)} money tone="success" />
          <SummaryChip label="Dues" value={inr(summary.due)} money tone={summary.due > 0 ? 'warning' : undefined} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => shiftDay(-1)} aria-label="Previous day">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setDate(todayISODate())}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => shiftDay(1)} aria-label="Next day">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={appts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={(a) => setSelected(a)}
        empty={{
          icon: CalendarDays,
          title: statusFilter === 'all' ? 'No appointments' : 'None match this filter',
          description: statusFilter === 'all' ? 'Nothing scheduled for this day yet.' : 'Try a different status.',
          action: canManage && statusFilter === 'all' ? <Button onClick={() => setBookOpen(true)}><Plus className="h-4 w-4" /> New appointment</Button> : null,
        }}
      />

      <AppointmentDetailDialog
        appointment={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        canManage={canManage}
        onCheckIn={doCheckIn}
        onReschedule={(a) => { setSelected(null); setReschedule(a); }}
        onCancel={(a) => { setSelected(null); setCancelling(a); }}
      />

      <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} defaultDate={date} />
      <WalkInDialog open={walkOpen} onOpenChange={setWalkOpen} />
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} date={date} />
      <RescheduleDialog open={!!reschedule} onOpenChange={(o) => !o && setReschedule(null)} appointment={reschedule} />

      <Dialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
            <DialogDescription>
              {cancelling?.patientName} · {fmtTime(cancelling?.scheduledAt)} with {cancelling?.doctorName}. This frees the slot and stops reminders.
            </DialogDescription>
          </DialogHeader>
          {hasWaitlist && cancelWaiting > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-info/20 bg-info/5 px-3.5 py-2.5 text-sm text-info">
              <UsersRound className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">{cancelWaiting} {cancelWaiting === 1 ? 'patient is' : 'patients are'} waiting</span> for {cancelling?.doctorName} that day — they’ll be notified of the freed slot automatically.
              </span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doCancel} disabled={cancel.isPending}>
              {cancel.isPending ? 'Cancelling…' : 'Cancel appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const TONE = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
};

function SummaryChip({ label, value, tone, money }) {
  return (
    <div className="glass-card rounded-xl border px-3.5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('mt-1 font-semibold tabular', money ? 'text-[15px]' : 'text-xl leading-none', tone && TONE[tone])}>{value}</p>
    </div>
  );
}
