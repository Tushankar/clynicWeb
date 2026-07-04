import { useMemo, useState } from 'react';
import { addMonths, format } from 'date-fns';
import { BellRing, Check, Plus, Search, Send, XCircle } from 'lucide-react';
import { DataTable, Avatar } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRecalls, useCreateRecall, useCancelRecall } from '@/hooks/useSchedule';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { fmtDate, todayISODate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';

/**
 * Treatment recalls (§5.22, Premium) — "cleaning due in 6 months". Schedule a recall
 * against a patient; when it falls due, the automation sends a booking nudge on every
 * available channel. Any new booking for the patient auto-closes their open recalls.
 */

const STATUS_CLS = {
  scheduled: 'bg-info/10 text-info',
  sent: 'bg-warning/15 text-warning',
  booked: 'bg-success/10 text-success',
  cancelled: 'bg-muted text-muted-foreground',
};

const PRESETS = [
  { label: '6-month cleaning', months: 6 },
  { label: 'Annual check-up', months: 12 },
  { label: '3-month review', months: 3 },
];

export function RecallsPanel() {
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useRecalls({});
  const cancelRecall = useCancelRecall();
  const items = data?.items || [];

  const doCancel = async (r) => {
    try {
      await cancelRecall.mutateAsync(r._id);
      toast.success('Recall cancelled');
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    { key: 'patient', header: 'Patient', render: (r) => (
      <span className="flex items-center gap-3">
        <Avatar name={r.patientName || '?'} />
        <span className="font-semibold text-foreground">{r.patientName}</span>
      </span>
    ) },
    { key: 'label', header: 'Recall', render: (r) => r.label },
    { key: 'doctor', header: 'Doctor', className: 'text-muted-foreground', render: (r) => r.doctorName || 'Any' },
    { key: 'due', header: 'Due', render: (r) => fmtDate(r.dueDate) },
    { key: 'status', header: 'Status', render: (r) => (
      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_CLS[r.status] || 'bg-muted')}>
        {r.status === 'sent' && <Send className="h-3 w-3" />}
        {r.status === 'booked' && <Check className="h-3 w-3" />}
        {r.status}
      </span>
    ) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) =>
        ['scheduled', 'sent'].includes(r.status) ? (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); doCancel(r); }} disabled={cancelRecall.isPending}>
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          When a recall falls due, the patient gets a booking nudge automatically (email + WhatsApp when connected).
          Booking any appointment closes their open recalls.
        </p>
        <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New recall</Button>
      </div>
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        empty={{
          icon: BellRing,
          title: 'No recalls scheduled',
          description: 'Schedule "6-month cleaning" or "annual check-up" recalls and the reminders send themselves.',
          action: <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New recall</Button>,
        }}
      />
      <RecallFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function RecallFormDialog({ open, onOpenChange }) {
  const [search, setSearch] = useState('');
  const [patient, setPatient] = useState(null);
  const [label, setLabel] = useState(PRESETS[0].label);
  const [dueDate, setDueDate] = useState(format(addMonths(new Date(), 6), 'yyyy-MM-dd'));
  const [doctorId, setDoctorId] = useState('any');
  const patientsQ = usePatients(search);
  const doctors = useDoctors().data?.items || [];
  const create = useCreateRecall();

  const results = useMemo(() => (patientsQ.data?.items || []).slice(0, 6), [patientsQ.data]);

  const applyPreset = (p) => {
    setLabel(p.label);
    setDueDate(format(addMonths(new Date(), p.months), 'yyyy-MM-dd'));
  };

  const submit = async () => {
    try {
      await create.mutateAsync({
        patientId: patient._id,
        label,
        dueDate,
        doctorId: doctorId === 'any' ? null : doctorId,
      });
      toast.success(`Recall scheduled for ${patient.name} — due ${fmtDate(dueDate)}`);
      onOpenChange(false);
      setPatient(null);
      setSearch('');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a recall</DialogTitle>
          <DialogDescription>The reminder goes out automatically on the due date with a booking link.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Patient picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Patient</label>
            {patient ? (
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                <span className="flex items-center gap-2.5">
                  <Avatar name={patient.name} />
                  <span className="text-sm font-semibold">{patient.name}</span>
                  <span className="text-xs text-muted-foreground">{patient.phone}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => setPatient(null)}>Change</Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
                </div>
                {search.trim() && (
                  <div className="overflow-hidden rounded-lg border">
                    {results.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-muted-foreground">No matching patients.</p>
                    ) : (
                      results.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => setPatient(p)}
                          className="flex w-full items-center gap-2.5 border-b px-3 py-2 text-left transition-colors last:border-0 hover:bg-muted/50"
                        >
                          <Avatar name={p.name} />
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{p.phone || p.email || ''}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  label === p.label ? 'border-primary/40 bg-primary/10 text-primary' : 'text-muted-foreground hover:border-primary/30 hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">What for</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Due date</label>
              <Input type="date" min={todayISODate()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Doctor <span className="font-normal text-muted-foreground">(optional)</span></label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any doctor</SelectItem>
                {doctors.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={create.isPending || !patient || !label.trim() || !dueDate}>
            {create.isPending ? 'Scheduling…' : 'Schedule recall'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
