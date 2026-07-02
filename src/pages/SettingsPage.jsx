import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Buildings, Globe, Users, CaretRight, MapPin, Phone, PencilSimple } from '@phosphor-icons/react';
import { PageHeader, FormField } from '@/components/primitives';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useMe, useUpdateClinic } from '@/hooks/useMe';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';

const LINKS = [
  { to: '/dashboard/plan', icon: CreditCard, title: 'Plan & Billing', desc: 'Manage your subscription, invoices, and payment method.' },
  { to: '/dashboard/branches', icon: Buildings, title: 'Branches', desc: 'Add and manage your clinic locations.' },
  { to: '/dashboard/website', icon: Globe, title: 'Public website', desc: 'Edit your clinic’s public site and booking page.' },
  { to: '/dashboard/doctors', icon: Users, title: 'Doctors', desc: 'Manage practitioners and consultation fees.' },
];

export default function SettingsPage() {
  const clinic = useMe().data?.clinic;
  const isOwner = useHasRole('owner');
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your clinic profile and configuration." />

      <Card className="card-lift p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold">Clinic profile</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Your name, address, and phone show on your public website and invoices.</p>
          </div>
          {isOwner && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <PencilSimple weight="bold" className="h-4 w-4" /> Edit profile
            </Button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Clinic name" value={clinic?.name} />
          <Field label="Address" value={clinic?.address} icon={MapPin} />
          <Field label="Phone" value={clinic?.phone} icon={Phone} />
        </div>
        {isOwner && !clinic?.address && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Add your clinic address so patients can find you — it appears on your public website’s contact section.
          </p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="group">
            <Card className="card-lift flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <l.icon weight="duotone" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{l.title}</p>
                <p className="truncate text-xs text-muted-foreground">{l.desc}</p>
              </div>
              <CaretRight weight="bold" className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Card>
          </Link>
        ))}
      </div>

      <ClinicProfileDialog open={editOpen} onOpenChange={setEditOpen} clinic={clinic} />
    </div>
  );
}

const schema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
});

function ClinicProfileDialog({ open, onOpenChange, clinic }) {
  const update = useUpdateClinic();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '', phone: '', gstNumber: '' },
  });

  useEffect(() => {
    if (open) reset({ name: clinic?.name || '', address: clinic?.address || '', phone: clinic?.phone || '', gstNumber: clinic?.gstNumber || '' });
  }, [open, clinic, reset]);

  const onSubmit = async (values) => {
    try {
      await update.mutateAsync(values);
      toast.success('Clinic profile updated');
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit clinic profile</DialogTitle>
          <DialogDescription>This information appears on your public website and printed invoices.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Clinic name" htmlFor="c-name" required error={errors.name?.message}>
            <Input id="c-name" {...register('name')} placeholder="e.g. Clynic Dental Care" />
          </FormField>
          <FormField label="Address" htmlFor="c-address" description="Shown on your public website’s contact section." error={errors.address?.message}>
            <Input id="c-address" {...register('address')} placeholder="12 Park Street, Kolkata 700016" />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Phone" htmlFor="c-phone" error={errors.phone?.message}>
              <Input id="c-phone" {...register('phone')} placeholder="+91 98300 00000" />
            </FormField>
            <FormField label="GST number" htmlFor="c-gst" error={errors.gstNumber?.message}>
              <Input id="c-gst" {...register('gstNumber')} placeholder="Optional" />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save profile'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon && <Icon weight="regular" className="h-4 w-4 text-muted-foreground" />}
        {value || '—'}
      </p>
    </div>
  );
}
