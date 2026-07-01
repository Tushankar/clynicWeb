import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormField } from '@/components/primitives';
import { useDoctors } from '@/hooks/useDoctors';
import { useWalkIn } from '@/hooks/useAppointments';
import { toast, toastApiError } from '@/lib/toast';

/** Register a walk-in: creates/reuses the patient, books now, and checks them into the queue. */
export function WalkInDialog({ open, onOpenChange }) {
  const doctors = useDoctors().data?.items || [];
  const walkIn = useWalkIn();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setPhone('');
      setDoctorId('');
      setReason('');
    }
  }, [open]);

  const submit = async () => {
    try {
      const res = await walkIn.mutateAsync({ name, phone, doctorId, reason });
      toast.success(`Walk-in registered — token ${res.appointment?.tokenNumber ?? ''}`);
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register walk-in</DialogTitle>
          <DialogDescription>They’ll be added to today’s queue with a token straight away.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Patient name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Das" />
            </FormField>
            <FormField label="Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98300 00000" />
            </FormField>
          </div>
          <FormField label="Doctor" required>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                    {d.specialization ? ` · ${d.specialization}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Reason (optional)">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fever" />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!name.trim() || !doctorId || walkIn.isPending}>
            {walkIn.isPending ? 'Registering…' : 'Register & add to queue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
