import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/primitives';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/useBranches';
import { toast, toastApiError } from '@/lib/toast';

const schema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export default function BranchesPage() {
  return (
    <FeatureGate feature="MULTI_BRANCH">
      <BranchesInner />
    </FeatureGate>
  );
}

function BranchesInner() {
  const q = useBranches();
  const branches = q.data?.items || [];
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, obj = edit
  const del = useDeleteBranch();

  const remove = async (b) => {
    if (!window.confirm(`Remove branch "${b.name}"? Its history is preserved.`)) return; // eslint-disable-line no-alert
    try {
      await del.mutateAsync(b._id);
      toast.success('Branch removed');
    } catch (err) {
      toastApiError(err);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Branch',
      render: (b) => (
        <span className="flex items-center gap-2 font-medium">
          {b.name}
          {b.isPrimary && <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" /> Primary</Badge>}
        </span>
      ),
    },
    { key: 'address', header: 'Address', render: (b) => b.address || '—' },
    { key: 'phone', header: 'Phone', className: 'tabular', render: (b) => b.phone || '—' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(b)} aria-label="Edit branch"><Pencil className="h-4 w-4" /></Button>
          {!b.isPrimary && (
            <Button variant="ghost" size="icon" onClick={() => remove(b)} aria-label="Remove branch"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Manage your clinic's locations. Data stays branch-scoped; the owner sees a centralized view across all branches."
        actions={<Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Add branch</Button>}
      />
      <DataTable
        columns={columns}
        data={branches}
        isLoading={q.isLoading}
        isError={q.isError}
        error={q.error}
        onRetry={q.refetch}
        empty={{ icon: Building2, title: 'No branches yet', description: 'Add a second location to enable branch-scoped operations.' }}
      />
      <BranchDialog open={editing !== undefined} branch={editing} onOpenChange={(v) => !v && setEditing(undefined)} />
    </div>
  );
}

function BranchDialog({ open, branch, onOpenChange }) {
  const isEdit = !!branch;
  const create = useCreateBranch();
  const update = useUpdateBranch();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', address: '', phone: '' } });

  useEffect(() => {
    if (open) reset(branch ? { name: branch.name || '', address: branch.address || '', phone: branch.phone || '' } : { name: '', address: '', phone: '' });
  }, [open, branch, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) await update.mutateAsync({ id: branch._id, ...values });
      else await create.mutateAsync(values);
      toast.success(isEdit ? 'Branch updated' : 'Branch added');
      onOpenChange(false);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit branch' : 'Add branch'}</DialogTitle>
          <DialogDescription>Locations share one patient record but keep separate appointments, queue, and billing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Branch name" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" {...register('name')} placeholder="e.g. Salt Lake branch" />
          </FormField>
          <FormField label="Address" htmlFor="address" error={errors.address?.message}>
            <Input id="address" {...register('address')} placeholder="Street, area, city" />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" {...register('phone')} placeholder="+91 …" />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add branch'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
