import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormField } from '@/components/primitives';
import { useDoctors } from '@/hooks/useDoctors';
import { useCreatePrescription } from '@/hooks/useClinical';
import { toast, toastApiError } from '@/lib/toast';

const emptyItem = () => ({ drug: '', dose: '', frequency: '', duration: '' });

export function PrescriptionEditorDialog({ open, onOpenChange, patientId }) {
  const doctors = useDoctors().data?.items || [];
  const create = useCreatePrescription();
  const [doctorId, setDoctorId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([emptyItem()]);

  useEffect(() => {
    if (open) {
      setDoctorId(doctors[0]?._id || '');
      setDiagnosis('');
      setNotes('');
      setItems([emptyItem()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setItem = (i, k, v) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (i) => setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const canSubmit = doctorId && items.some((it) => it.drug.trim());

  const submit = async () => {
    try {
      await create.mutateAsync({ patientId, doctorId, diagnosis, notes, items: items.filter((it) => it.drug.trim()) });
      toast.success('Prescription saved');
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New prescription</DialogTitle>
          <DialogDescription>Add medicines with dose, frequency, and duration.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Doctor" required>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Diagnosis (optional)">
              <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Viral fever" />
            </FormField>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Medicines</span>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2">
                  <Input className="col-span-4" placeholder="Drug" value={it.drug} onChange={(e) => setItem(i, 'drug', e.target.value)} />
                  <Input className="col-span-2" placeholder="Dose" value={it.dose} onChange={(e) => setItem(i, 'dose', e.target.value)} />
                  <Input className="col-span-3" placeholder="Frequency" value={it.frequency} onChange={(e) => setItem(i, 'frequency', e.target.value)} />
                  <Input className="col-span-2" placeholder="Duration" value={it.duration} onChange={(e) => setItem(i, 'duration', e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" className="col-span-1 text-muted-foreground" onClick={() => removeItem(i)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <FormField label="Notes (optional)">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Advice, follow-up, etc." />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || create.isPending}>{create.isPending ? 'Saving…' : 'Save prescription'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
