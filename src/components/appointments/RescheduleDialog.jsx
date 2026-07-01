import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/primitives';
import { SlotPicker } from './SlotPicker';
import { useReschedule } from '@/hooks/useAppointments';
import { todayISODate } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';

export function RescheduleDialog({ open, onOpenChange, appointment }) {
  const reschedule = useReschedule();
  const [date, setDate] = useState(todayISODate());
  const [slot, setSlot] = useState('');

  useEffect(() => {
    if (open && appointment) {
      setDate(appointment.scheduledAt ? appointment.scheduledAt.slice(0, 10) : todayISODate());
      setSlot('');
    }
  }, [open, appointment]);

  const submit = async () => {
    try {
      await reschedule.mutateAsync({ id: appointment._id, scheduledAt: slot });
      toast.success('Appointment rescheduled');
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            {appointment?.patientName} with {appointment?.doctorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField label="New date">
            <Input type="date" value={date} min={todayISODate()} onChange={(e) => { setDate(e.target.value); setSlot(''); }} />
          </FormField>
          <FormField label="New time" required>
            <SlotPicker doctorId={appointment?.doctorId} date={date} value={slot} onChange={setSlot} />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!slot || reschedule.isPending}>
            {reschedule.isPending ? 'Saving…' : 'Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
