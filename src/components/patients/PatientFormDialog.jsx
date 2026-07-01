import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/primitives';
import { useCreatePatient, useUpdatePatient } from '@/hooks/usePatients';
import { toast, toastApiError } from '@/lib/toast';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  dob: z.string().optional(),
  gender: z.enum(['unspecified', 'male', 'female', 'other']).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  notes: z.string().optional(),
});

const empty = {
  name: '', phone: '', email: '', dob: '', gender: 'unspecified',
  bloodGroup: '', allergies: '', currentMedications: '', medicalHistory: '', notes: '',
};

const toList = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);
const toCsv = (a) => (Array.isArray(a) ? a.join(', ') : '');

export function PatientFormDialog({ open, onOpenChange, patient }) {
  const isEdit = !!patient;
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (open) {
      reset(
        patient
          ? {
              name: patient.name || '',
              phone: patient.phone || '',
              email: patient.email || '',
              dob: patient.dob ? patient.dob.slice(0, 10) : '',
              gender: patient.gender || 'unspecified',
              bloodGroup: patient.bloodGroup || '',
              allergies: toCsv(patient.allergies),
              currentMedications: toCsv(patient.currentMedications),
              medicalHistory: patient.medicalHistory || '',
              notes: patient.notes || '',
            }
          : empty
      );
    }
  }, [open, patient, reset]);

  const onSubmit = async (values) => {
    const body = {
      ...values,
      email: values.email || undefined,
      dob: values.dob || undefined,
      allergies: toList(values.allergies),
      currentMedications: toList(values.currentMedications),
    };
    try {
      if (isEdit) await update.mutateAsync({ id: patient._id, ...body });
      else await create.mutateAsync(body);
      toast.success(isEdit ? 'Patient updated' : 'Patient created');
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit patient' : 'New patient'}</DialogTitle>
          <DialogDescription>Search first to avoid creating a duplicate record.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" {...register('name')} placeholder="e.g. Rahul Sharma" />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" {...register('phone')} placeholder="+91 98300 00000" />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" {...register('email')} placeholder="patient@email.com" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Date of birth" htmlFor="dob" error={errors.dob?.message}>
              <Input id="dob" type="date" {...register('dob')} />
            </FormField>
            <FormField label="Gender" error={errors.gender?.message}>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unspecified">Unspecified</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <p className="mb-3 text-sm font-medium">Medical details</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Blood group" htmlFor="bloodGroup" error={errors.bloodGroup?.message}>
                  <Input id="bloodGroup" {...register('bloodGroup')} placeholder="e.g. O+" />
                </FormField>
                <FormField label="Allergies" htmlFor="allergies" description="Comma-separated" error={errors.allergies?.message}>
                  <Input id="allergies" {...register('allergies')} placeholder="Penicillin, dust" />
                </FormField>
              </div>
              <FormField label="Current medications" htmlFor="meds" description="Comma-separated" error={errors.currentMedications?.message}>
                <Input id="meds" {...register('currentMedications')} placeholder="Metformin 500mg, …" />
              </FormField>
              <FormField label="Medical history" htmlFor="history" error={errors.medicalHistory?.message}>
                <Textarea id="history" {...register('medicalHistory')} placeholder="Past conditions, surgeries, family history…" />
              </FormField>
            </div>
          </div>

          <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
            <Textarea id="notes" {...register('notes')} placeholder="Reception/clinical context…" />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
