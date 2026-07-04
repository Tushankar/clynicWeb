import { useEffect, useMemo, useState } from 'react';
import { CalendarX2, Plus, Trash2, TreePalm, Building2, Ban, Moon, Sun, Sunrise, Loader2 } from 'lucide-react';
import { PageHeader, DataTable, Avatar } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useBlocks, useCreateBlock, useRemoveBlock, useCancelImpacted } from '@/hooks/useSchedule';
import { useDoctors } from '@/hooks/useDoctors';
import { useSlots } from '@/hooks/useAppointments';
import { useHasRole } from '@/hooks/useRole';
import { fmtDate, fmtTime, todayISODate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';

/**
 * Time off & slot blocking (§5.20, Standard+): doctor leave, clinic holidays, ad-hoc
 * blocks. Anything listed here disappears from every booking surface (public, staff,
 * manage links) and is re-checked at booking time server-side.
 */

const TYPE_META = {
  leave: { label: 'Doctor leave', icon: TreePalm, cls: 'bg-info/10 text-info' },
  holiday: { label: 'Clinic holiday', icon: Building2, cls: 'bg-warning/15 text-warning' },
  block: { label: 'Slot block', icon: Ban, cls: 'bg-secondary text-secondary-foreground' },
};

export default function TimeOffPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Time off"
        description="Doctor leave, clinic holidays, and blocked hours — blocked windows are never offered for booking."
      />
      <FeatureGate feature="AVAILABILITY_BLOCKS">
        <TimeOffInner />
      </FeatureGate>
    </div>
  );
}

function TimeOffInner() {
  const canManage = useHasRole('owner', 'receptionist');
  const [formOpen, setFormOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const { data, isLoading, isError, error, refetch } = useBlocks({});
  const remove = useRemoveBlock();
  const blocks = data?.items || [];

  const doRemove = async () => {
    try {
      await remove.mutateAsync(removing._id);
      toast.success('Time off removed — those slots are open again');
      setRemoving(null);
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    {
      key: 'who',
      header: 'Applies to',
      render: (b) => (
        <span className="flex items-center gap-3">
          <Avatar name={b.doctorName || 'All'} />
          <span className="font-semibold text-foreground">{b.doctorId ? b.doctorName : 'Whole clinic'}</span>
        </span>
      ),
    },
    {
      key: 'from',
      header: 'From',
      render: (b) => (
        <span className="whitespace-nowrap">{fmtDate(b.startAt)} <span className="text-muted-foreground">· {fmtTime(b.startAt)}</span></span>
      ),
    },
    {
      key: 'to',
      header: 'To',
      render: (b) => (
        <span className="whitespace-nowrap">{fmtDate(b.endAt)} <span className="text-muted-foreground">· {fmtTime(b.endAt)}</span></span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (b) => {
        const t = TYPE_META[b.type] || TYPE_META.block;
        return (
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', t.cls)}>
            <t.icon className="h-3 w-3" /> {t.label}
          </span>
        );
      },
    },
    { key: 'reason', header: 'Reason', render: (b) => b.reason || <span className="text-muted-foreground">—</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) =>
        canManage ? (
          <Button variant="ghost" size="icon" aria-label="Remove" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoving(b); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Add time off
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={blocks}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        empty={{
          icon: CalendarX2,
          title: 'No upcoming time off',
          description: 'Add doctor leave or a clinic holiday and those slots stop being bookable instantly.',
          action: canManage ? <Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add time off</Button> : null,
        }}
      />

      <TimeOffFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove this time off?</DialogTitle>
            <DialogDescription>
              {removing?.doctorId ? removing?.doctorName : 'Whole clinic'} · {removing && fmtDate(removing.startAt)} → {removing && fmtDate(removing.endAt)}. The blocked slots become bookable again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doRemove} disabled={remove.isPending}>
              {remove.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Multi-select slot grid (booking-page look) — pick which of a doctor's slots to block. */
function BlockSlotGrid({ slots, selected, onToggle }) {
  const hourOf = (iso) => new Date(iso).getHours();
  const groups = [
    { label: 'Morning', icon: Sunrise, slots: slots.filter((s) => hourOf(s.start) < 12) },
    { label: 'Afternoon', icon: Sun, slots: slots.filter((s) => hourOf(s.start) >= 12 && hourOf(s.start) < 17) },
    { label: 'Evening', icon: Moon, slots: slots.filter((s) => hourOf(s.start) >= 17) },
  ].filter((g) => g.slots.length);

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <g.icon className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" /> {g.label}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {g.slots.map((s) => {
              const isSel = selected.has(s.start);
              const disabled = !s.available; // already booked or already blocked
              return (
                <button
                  key={s.start}
                  type="button"
                  disabled={disabled}
                  aria-pressed={isSel}
                  onClick={() => onToggle(s.start)}
                  className={cn(
                    'h-10 rounded-lg border text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    disabled
                      ? 'cursor-not-allowed border-dashed border-border bg-muted/40 text-muted-foreground/50 line-through'
                      : isSel
                        ? 'border-transparent bg-destructive text-destructive-foreground shadow-sm'
                        : 'border-input bg-background text-foreground hover:border-destructive/40'
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimeOffFormDialog({ open, onOpenChange }) {
  const doctors = useDoctors().data?.items || [];
  const create = useCreateBlock();
  const cancelImpacted = useCancelImpacted();
  const [mode, setMode] = useState('range'); // 'range' | 'slots'
  const [who, setWho] = useState('clinic');
  const [startDate, setStartDate] = useState(todayISODate());
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(todayISODate());
  const [endTime, setEndTime] = useState('23:59');
  const [reason, setReason] = useState('');

  // Specific-slots mode
  const [slotDoctor, setSlotDoctor] = useState('');
  const [slotDate, setSlotDate] = useState(todayISODate());
  const [selected, setSelected] = useState(() => new Set());

  useEffect(() => {
    if (open) {
      setMode('range');
      setSelected(new Set());
      if (doctors[0] && !slotDoctor) setSlotDoctor(doctors[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const slotsQ = useSlots(mode === 'slots' ? slotDoctor : null, mode === 'slots' ? slotDate : null);
  const slots = slotsQ.data?.slots || [];
  const toggleSlot = (start) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(start)) next.delete(start);
      else next.add(start);
      return next;
    });

  const rangeValid = useMemo(() => {
    const s = new Date(`${startDate}T${startTime}`);
    const e = new Date(`${endDate}T${endTime}`);
    return !Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e > s;
  }, [startDate, startTime, endDate, endTime]);

  const canSubmit = mode === 'range' ? rangeValid : slotDoctor && selected.size > 0;

  // Merge consecutive selected slots into clean [start,end) windows for tidy blocks.
  function selectedRanges() {
    const stepMin = slots.length >= 2 ? Math.round((new Date(slots[1].start) - new Date(slots[0].start)) / 60000) : 15;
    const stepMs = Math.max(5, stepMin) * 60000;
    const starts = [...selected].map((s) => new Date(s).getTime()).sort((a, b) => a - b);
    const ranges = [];
    for (const st of starts) {
      const last = ranges[ranges.length - 1];
      if (last && st === last.endMs) last.endMs = st + stepMs;
      else ranges.push({ startMs: st, endMs: st + stepMs });
    }
    return ranges;
  }

  const submitRange = async () => {
    const res = await create.mutateAsync({
      doctorId: who === 'clinic' ? null : who,
      startAt: new Date(`${startDate}T${startTime}`).toISOString(),
      endAt: new Date(`${endDate}T${endTime}`).toISOString(),
      reason,
      type: who === 'clinic' ? 'holiday' : 'leave',
    });
    if (res.impactedAppointments > 0) {
      const n = res.impactedAppointments;
      const blockId = res.block?._id;
      toast.warning(`Time off added — ${n} booked appointment${n > 1 ? 's' : ''} fall${n > 1 ? '' : 's'} inside it.`, {
        description: 'Their reminders are paused. Cancel & notify those patients, or reschedule them.',
        duration: 12000,
        action: blockId
          ? {
              label: `Cancel & notify ${n}`,
              onClick: () =>
                cancelImpacted
                  .mutateAsync(blockId)
                  .then((r) => toast.success(`Cancelled & notified ${r.cancelled} patient${r.cancelled === 1 ? '' : 's'}`))
                  .catch(toastApiError),
            }
          : undefined,
      });
    } else {
      toast.success('Time off added — those slots are no longer bookable');
    }
  };

  const submitSlots = async () => {
    const ranges = selectedRanges();
    const doctorName = doctors.find((d) => d._id === slotDoctor)?.name || 'the doctor';
    let impacted = 0;
    for (const r of ranges) {
      // eslint-disable-next-line no-await-in-loop
      const res = await create.mutateAsync({
        doctorId: slotDoctor,
        startAt: new Date(r.startMs).toISOString(),
        endAt: new Date(r.endMs).toISOString(),
        reason,
        type: 'block',
      });
      impacted += res.impactedAppointments || 0;
    }
    toast.success(`Blocked ${selected.size} slot${selected.size > 1 ? 's' : ''} for ${doctorName}${impacted > 0 ? ` — ${impacted} existing appointment(s) affected, please reschedule` : ''}.`);
  };

  const submit = async () => {
    try {
      if (mode === 'range') await submitRange();
      else await submitSlots();
      onOpenChange(false);
      setReason('');
      setSelected(new Set());
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add time off</DialogTitle>
          <DialogDescription>Blocked slots disappear from booking immediately — existing appointments are never auto-cancelled.</DialogDescription>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {[['range', 'Date range'], ['slots', 'Specific slots']].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setMode(v)}
              className={cn('rounded-lg py-1.5 text-sm font-medium transition-colors', mode === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {mode === 'range' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Applies to</label>
                <Select value={who} onValueChange={setWho}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic">Whole clinic (holiday)</SelectItem>
                    {doctors.map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">From</label>
                  <Input type="date" value={startDate} min={todayISODate()} onChange={(e) => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate(e.target.value); }} />
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">To</label>
                  <Input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Doctor</label>
                  <Select value={slotDoctor} onValueChange={(v) => { setSlotDoctor(v); setSelected(new Set()); }}>
                    <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={slotDate} min={todayISODate()} onChange={(e) => { setSlotDate(e.target.value); setSelected(new Set()); }} />
                </div>
              </div>

              <div className="rounded-xl border p-3">
                {!slotDoctor ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Select a doctor to see their slots.</p>
                ) : slotsQ.isLoading ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
                ) : slots.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No working slots that day — the doctor isn’t scheduled.</p>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-muted-foreground">Tap the slots to block. Greyed-out slots are already booked or blocked.</p>
                    <BlockSlotGrid slots={slots} selected={selected} onToggle={toggleSlot} />
                  </>
                )}
              </div>
              {selected.size > 0 && (
                <p className="text-sm font-medium text-foreground">{selected.size} slot{selected.size > 1 ? 's' : ''} selected to block</p>
              )}
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Reason <span className="font-normal text-muted-foreground">(optional — shown if a booking is attempted)</span></label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Surgery, personal, lunch break…" maxLength={200} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || create.isPending}>
            {create.isPending ? 'Adding…' : mode === 'slots' ? `Block ${selected.size || ''} slot${selected.size === 1 ? '' : 's'}`.trim() : 'Add time off'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
