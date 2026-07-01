import { useState, useEffect } from 'react';
import { Check, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormField } from '@/components/primitives';
import { SlotPicker } from './SlotPicker';
import { useDoctors } from '@/hooks/useDoctors';
import { usePatients, useCreatePatient } from '@/hooks/usePatients';
import { useBookAppointment } from '@/hooks/useAppointments';
import { todayISODate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast, toastApiError } from '@/lib/toast';

export function BookAppointmentDialog({ open, onOpenChange, defaultDate }) {
  const doctors = useDoctors().data?.items || [];
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(defaultDate || todayISODate());
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');

  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [patient, setPatient] = useState(null);
  const [psearch, setPsearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const matches = usePatients(mode === 'existing' && psearch ? psearch : '').data?.items || [];
  const createPatient = useCreatePatient();
  const book = useBookAppointment();

  useEffect(() => {
    if (open) {
      setDoctorId('');
      setDate(defaultDate || todayISODate());
      setSlot('');
      setReason('');
      setMode('existing');
      setPatient(null);
      setPsearch('');
      setNewName('');
      setNewPhone('');
      setNewEmail('');
    }
  }, [open, defaultDate]);

  const canSubmit = doctorId && slot && (mode === 'existing' ? patient : newName.trim());

  const submit = async () => {
    try {
      let patientId = patient?._id;
      if (mode === 'new') {
        const created = await createPatient.mutateAsync({ name: newName, phone: newPhone, email: newEmail || undefined });
        patientId = created._id;
      }
      await book.mutateAsync({ doctorId, patientId, scheduledAt: slot, reason, source: 'phone' });
      toast.success('Appointment booked');
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
          <DialogDescription>Pick a doctor and time, then choose or add the patient.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Doctor" required>
              <Select value={doctorId} onValueChange={(v) => { setDoctorId(v); setSlot(''); }}>
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
            <FormField label="Date" required>
              <Input type="date" value={date} min={todayISODate()} onChange={(e) => { setDate(e.target.value); setSlot(''); }} />
            </FormField>
          </div>

          <FormField label="Time slot" required>
            <SlotPicker doctorId={doctorId} date={date} value={slot} onChange={setSlot} />
          </FormField>

          {/* Patient picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Patient</span>
              <div className="flex gap-1 text-xs">
                <TabBtn active={mode === 'existing'} onClick={() => setMode('existing')}>Existing</TabBtn>
                <TabBtn active={mode === 'new'} onClick={() => setMode('new')}>New</TabBtn>
              </div>
            </div>

            {mode === 'existing' ? (
              patient ? (
                <div className="flex items-center justify-between rounded-md border bg-accent/50 px-3 py-2 text-sm">
                  <span>
                    <span className="font-medium">{patient.name}</span> · {patient.phone || 'no phone'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setPatient(null)}>Change</Button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={psearch} onChange={(e) => setPsearch(e.target.value)} placeholder="Search patient by name or phone…" className="pl-9" />
                  </div>
                  {psearch && (
                    <div className="mt-1 max-h-40 overflow-y-auto rounded-md border">
                      {matches.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">No matches. Use “New” to add.</p>
                      ) : (
                        matches.map((m) => (
                          <button
                            key={m._id}
                            type="button"
                            onClick={() => { setPatient(m); setPsearch(''); }}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                          >
                            <span>{m.name} · {m.phone || '—'}</span>
                            <Check className="h-4 w-4 opacity-0" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                <Input placeholder="Email (optional)" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
            )}
          </div>

          <FormField label="Reason (optional)">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Follow-up" />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || book.isPending || createPatient.isPending}>
            {book.isPending ? 'Booking…' : 'Book appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('rounded px-2 py-1', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
    >
      {children}
    </button>
  );
}
