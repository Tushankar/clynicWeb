import { useState } from 'react';
import { addDays, parseISO, format } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, UserPlus, MoreHorizontal, LogIn, CalendarClock, XCircle } from 'lucide-react';
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
import { fmtTime, todayISODate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';
import { BookAppointmentDialog } from '@/components/appointments/BookAppointmentDialog';
import { WalkInDialog } from '@/components/appointments/WalkInDialog';
import { RescheduleDialog } from '@/components/appointments/RescheduleDialog';

const ACTIVE_BOOKED = ['booked', 'confirmed'];

export default function AppointmentsPage() {
  const [date, setDate] = useState(todayISODate());
  const [doctorId, setDoctorId] = useState('all');
  const [bookOpen, setBookOpen] = useState(false);
  const [walkOpen, setWalkOpen] = useState(false);
  const [reschedule, setReschedule] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const canManage = useHasRole('owner', 'receptionist');
  const doctors = useDoctors().data?.items || [];
  const { branchId } = useBranch(); // null = all branches (centralized view)
  const params = { date, ...(doctorId !== 'all' ? { doctorId } : {}), ...(branchId ? { branchId } : {}) };
  const { data, isLoading, isError, error, refetch } = useAppointments(params);
  const appts = data?.items || [];

  const checkIn = useCheckIn();
  const cancel = useCancelAppointment();

  const shiftDay = (n) => setDate(format(addDays(parseISO(date), n), 'yyyy-MM-dd'));
  const dateLabel = format(parseISO(date), 'EEE, d MMM yyyy');

  const doCheckIn = async (a) => {
    try {
      await checkIn.mutateAsync(a._id);
      toast.success(`${a.patientName} checked in`);
    } catch (err) {
      toastApiError(err);
    }
  };
  const doCancel = async () => {
    try {
      await cancel.mutateAsync({ id: cancelling._id });
      toast.success('Appointment cancelled');
      setCancelling(null);
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
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) =>
        canManage && ACTIVE_BOOKED.includes(a.status) ? (
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

      <DataTable
        columns={columns}
        data={appts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        empty={{
          icon: CalendarDays,
          title: 'No appointments',
          description: 'Nothing scheduled for this day yet.',
          action: canManage ? <Button onClick={() => setBookOpen(true)}><Plus className="h-4 w-4" /> New appointment</Button> : null,
        }}
      />

      <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} defaultDate={date} />
      <WalkInDialog open={walkOpen} onOpenChange={setWalkOpen} />
      <RescheduleDialog open={!!reschedule} onOpenChange={(o) => !o && setReschedule(null)} appointment={reschedule} />

      <Dialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
            <DialogDescription>
              {cancelling?.patientName} · {fmtTime(cancelling?.scheduledAt)} with {cancelling?.doctorName}. This frees the slot and stops reminders.
            </DialogDescription>
          </DialogHeader>
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
