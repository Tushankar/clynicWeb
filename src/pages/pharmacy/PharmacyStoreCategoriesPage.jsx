import { useEffect, useRef, useState } from 'react';
import { SquaresFour, Plus, Trash, ImageSquare } from '@phosphor-icons/react';
import { PageHeader, DataTable } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  useStoreCategories, useCreateStoreCategory, useUpdateStoreCategory, useRemoveStoreCategory, useUploadStoreCategoryImage,
} from '@/hooks/usePharmacy';
import { useHasRole } from '@/hooks/useRole';
import { toast, toastApiError } from '@/lib/toast';
import { cn } from '@/lib/utils';

const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function Thumb({ url, name }) {
  if (url) return <img src={url} alt={name} className="h-10 w-10 shrink-0 rounded-lg border object-cover" />;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <SquaresFour weight="duotone" className="h-5 w-5" />
    </span>
  );
}

export default function PharmacyStoreCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Store Categories" description="Organise your online store — categories group medicines and appear as tiles on the storefront." />
      <FeatureGate feature="PHARMACY_STOREFRONT">
        <CategoriesBody />
      </FeatureGate>
    </div>
  );
}

function CategoriesBody() {
  const canManage = useHasRole('owner', 'pharmacy_owner', 'pharmacy_manager');
  const canDelete = useHasRole('owner', 'pharmacy_owner');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const { data, isLoading, isError, error, refetch } = useStoreCategories({});
  const remove = useRemoveStoreCategory();
  const items = data?.items || [];

  const filtered = items.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [c.name, c.slug, c.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });

  const doRemove = async () => {
    try {
      await remove.mutateAsync(removing._id || removing.id);
      toast.success('Category removed');
      setRemoving(null);
    } catch (e) {
      toastApiError(e);
    }
  };

  const columns = [
    {
      key: 'name', header: 'Category', render: (c) => (
        <span className="flex items-center gap-3">
          <Thumb url={c.imageUrl} name={c.name} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{c.name}</span>
            {c.description && <span className="block max-w-[280px] truncate text-xs text-muted-foreground">{c.description}</span>}
          </span>
        </span>
      ),
    },
    { key: 'slug', header: 'Slug', className: 'font-mono text-xs text-muted-foreground', render: (c) => c.slug || '—' },
    { key: 'sortOrder', header: 'Order', align: 'right', render: (c) => <span className="tabular text-muted-foreground">{c.sortOrder ?? 0}</span> },
    {
      key: 'active', header: 'Status', render: (c) => (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', c.active !== false ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" /> {c.active !== false ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions', header: '', align: 'right', render: (c) => canDelete ? (
        <Button variant="ghost" size="icon" aria-label="Delete" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoving(c); }}>
          <Trash className="h-4 w-4" />
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        onRowClick={canManage ? (c) => setEditing(c) : undefined}
        search={{ value: search, onChange: setSearch, placeholder: 'Search categories…' }}
        toolbar={canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add category</Button> : null}
        empty={{
          icon: SquaresFour,
          title: 'No categories yet',
          description: 'Create categories to group your store’s medicines into browsable tiles.',
          action: canManage ? <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add category</Button> : null,
        }}
      />

      {editing && <CategoryFormDialog category={editing} onClose={() => setEditing(null)} />}

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>The category is removed from your store. Medicines in it are not deleted — they just lose this grouping.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>Keep it</Button>
            <Button variant="destructive" onClick={doRemove} disabled={remove.isPending}>{remove.isPending ? 'Removing…' : 'Remove'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const BLANK = { name: '', slug: '', description: '', sortOrder: 0, active: true };

function CategoryFormDialog({ category, onClose }) {
  const id = category._id || category.id;
  const isEdit = !!id;
  const create = useCreateStoreCategory();
  const update = useUpdateStoreCategory();
  const uploadImage = useUploadStoreCategoryImage();
  const fileInput = useRef(null);
  const blobUrlRef = useRef(null);
  const [form, setForm] = useState(() => ({ ...BLANK, ...Object.fromEntries(Object.entries(category).map(([k, v]) => [k, v == null ? BLANK[k] ?? '' : v])) }));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(category.imageUrl || null);
  const [createdId, setCreatedId] = useState(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const busy = create.isPending || update.isPending || uploadImage.isPending;

  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  const onName = (v) => setForm((f) => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }));

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast.error('Please choose an image file.'); return; }
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(f);
    blobUrlRef.current = url;
    setFile(f);
    setPreview(url);
  };

  const submit = async () => {
    if (!form.name.trim()) { toast.error('A category name is required.'); return; }
    const payload = {
      name: form.name.trim(),
      slug: (form.slug && form.slug.trim()) || slugify(form.name),
      description: form.description,
      sortOrder: form.sortOrder === '' ? 0 : Number(form.sortOrder),
      active: !!form.active,
    };
    try {
      let cid = id || createdId;
      if (cid) {
        await update.mutateAsync({ id: cid, ...payload });
      } else {
        const saved = await create.mutateAsync(payload);
        cid = saved?._id || saved?.id;
        setCreatedId(cid);
      }
      if (file && cid) await uploadImage.mutateAsync({ id: cid, file });
      toast.success(isEdit ? 'Category updated' : 'Category added');
      onClose();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit category' : 'Add category'}</DialogTitle>
          <DialogDescription>Categories appear as tiles on your storefront. Upload a photo for a richer tile.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition-colors hover:border-primary/50"
              aria-label="Upload category image"
            >
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImageSquare weight="duotone" className="h-7 w-7 text-muted-foreground" />}
              <span className="absolute inset-x-0 bottom-0 bg-foreground/60 py-0.5 text-center text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                {preview ? 'Change' : 'Add photo'}
              </span>
            </button>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={pickFile} />
            <div className="grid flex-1 gap-3">
              <Field label="Name" required>
                <Input value={form.name} onChange={(e) => onName(e.target.value)} placeholder="Cold & Flu" maxLength={120} autoFocus />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug')(slugify(e.target.value)); }} placeholder="cold-flu" maxLength={120} className="font-mono text-xs" />
              </Field>
            </div>
          </div>

          <Field label="Description"><Textarea value={form.description} onChange={(e) => set('description')(e.target.value)} placeholder="Shown under the category tile" rows={2} maxLength={500} /></Field>

          <div className="flex items-center justify-between gap-4">
            <div className="w-32">
              <Field label="Sort order"><Input type="number" min="0" value={form.sortOrder} onChange={(e) => set('sortOrder')(e.target.value)} placeholder="0" /></Field>
            </div>
            <label className="flex items-center gap-2.5 pt-6 text-sm">
              <Switch checked={!!form.active} onCheckedChange={set('active')} aria-label="Active" />
              <span className="font-medium">Active</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !form.name.trim()}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add category'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
