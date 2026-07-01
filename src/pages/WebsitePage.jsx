import { useEffect, useState } from 'react';
import { Globe, Plus, Trash2, ExternalLink, Save, Eye, EyeOff } from 'lucide-react';
import { PageHeader, LoadingSkeleton, FormField } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWebsiteContent, useSaveWebsite } from '@/hooks/useWebsite';
import { useMe } from '@/hooks/useMe';
import { useFeature } from '@/hooks/usePlan';
import { CustomDomainCard } from '@/components/website/CustomDomainCard';
import { toast, toastApiError } from '@/lib/toast';

export default function WebsitePage() {
  return (
    <FeatureGate feature="WEBSITE_BUILDER">
      <WebsiteInner />
    </FeatureGate>
  );
}

const EMPTY = { published: false, headline: '', about: '', services: [], gallery: [], reviews: [], hours: '', contact: { phone: '', email: '', whatsapp: '', mapUrl: '' } };

function WebsiteInner() {
  const { data, isLoading } = useWebsiteContent();
  const save = useSaveWebsite();
  const slug = useMe().data?.clinic?.slug;
  const hasCustomDomain = useFeature('CUSTOM_DOMAIN');
  const [c, setC] = useState(EMPTY);

  useEffect(() => {
    if (data?.content) setC({ ...EMPTY, ...data.content, contact: { ...EMPTY.contact, ...(data.content.contact || {}) } });
  }, [data]);

  const set = (patch) => setC((prev) => ({ ...prev, ...patch }));
  const setContact = (patch) => setC((prev) => ({ ...prev, contact: { ...prev.contact, ...patch } }));

  const doSave = async () => {
    try {
      await save.mutateAsync(c);
      toast.success('Website saved');
    } catch (e) {
      toastApiError(e);
    }
  };

  if (isLoading) return <LoadingSkeleton lines={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website builder"
        description="Your public clinic site, generated from this content. Publish it to go live."
        actions={
          <div className="flex gap-2">
            {slug && (
              <Button variant="outline" onClick={() => window.open(`/site/${slug}`, '_blank', 'noopener')}>
                <ExternalLink className="h-4 w-4" /> Preview
              </Button>
            )}
            <Button onClick={doSave} disabled={save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save'}</Button>
          </div>
        }
      />

      <Card className="flex items-center justify-between p-4">
        <div>
          <div className="font-medium">{c.published ? 'Published' : 'Draft (not visible to patients)'}</div>
          <div className="text-caption text-muted-foreground">{c.published ? 'Your site is live at /site/' + (slug || '…') : 'Only you can see it until you publish.'}</div>
        </div>
        <Button variant={c.published ? 'outline' : 'default'} onClick={() => set({ published: !c.published })}>
          {c.published ? <><EyeOff className="h-4 w-4" /> Unpublish</> : <><Eye className="h-4 w-4" /> Publish</>}
        </Button>
      </Card>

      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Hero</h3>
        <FormField label="Headline"><Input value={c.headline} onChange={(e) => set({ headline: e.target.value })} placeholder="Compassionate dental care in Salt Lake" /></FormField>
        <FormField label="About"><Textarea value={c.about} onChange={(e) => set({ about: e.target.value })} rows={4} placeholder="A short introduction to the clinic and the doctor(s)…" /></FormField>
        <FormField label="Opening hours"><Input value={c.hours} onChange={(e) => set({ hours: e.target.value })} placeholder="Mon–Sat 10am–7pm" /></FormField>
      </Card>

      <ListEditor
        title="Services"
        items={c.services}
        onChange={(services) => set({ services })}
        blank={{ name: '', description: '' }}
        render={(item, upd) => (
          <>
            <Input value={item.name} onChange={(e) => upd({ name: e.target.value })} placeholder="Service name" />
            <Input value={item.description} onChange={(e) => upd({ description: e.target.value })} placeholder="Short description" />
          </>
        )}
      />

      <ListEditor
        title="Gallery (image URLs)"
        items={c.gallery.map((url) => ({ url }))}
        onChange={(rows) => set({ gallery: rows.map((r) => r.url) })}
        blank={{ url: '' }}
        render={(item, upd) => <Input value={item.url} onChange={(e) => upd({ url: e.target.value })} placeholder="https://…/photo.jpg" />}
      />

      <ListEditor
        title="Reviews"
        items={c.reviews}
        onChange={(reviews) => set({ reviews })}
        blank={{ author: '', rating: 5, text: '' }}
        render={(item, upd) => (
          <>
            <Input value={item.author} onChange={(e) => upd({ author: e.target.value })} placeholder="Patient name" />
            <Input type="number" min={1} max={5} value={item.rating} onChange={(e) => upd({ rating: Number(e.target.value) })} placeholder="Rating 1–5" />
            <Input value={item.text} onChange={(e) => upd({ text: e.target.value })} placeholder="What they said" />
          </>
        )}
      />

      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone"><Input value={c.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} /></FormField>
          <FormField label="Email"><Input value={c.contact.email} onChange={(e) => setContact({ email: e.target.value })} /></FormField>
          <FormField label="WhatsApp"><Input value={c.contact.whatsapp} onChange={(e) => setContact({ whatsapp: e.target.value })} /></FormField>
          <FormField label="Map embed URL" description="Google Maps 'embed' link"><Input value={c.contact.mapUrl} onChange={(e) => setContact({ mapUrl: e.target.value })} /></FormField>
        </div>
      </Card>

      {hasCustomDomain && <CustomDomainCard />}
    </div>
  );
}

let rowKeySeq = 0;
const nextRowKey = () => `row-${(rowKeySeq += 1)}`;

function ListEditor({ title, items, onChange, blank, render }) {
  // New rows get a stable client key so React never remounts inputs on add/remove (the key is
  // client-only; the server sanitizer drops unknown fields on save). Server-loaded rows keep a
  // stable order, so index is a safe fallback for them.
  const add = () => onChange([...(items || []), { ...blank, _key: nextRowKey() }]);
  const upd = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      {(!items || items.length === 0) && <p className="text-sm text-muted-foreground">None yet.</p>}
      <div className="space-y-2">
        {(items || []).map((item, i) => (
          <div key={item._key || `idx-${i}`} className="flex items-center gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">{render(item, (patch) => upd(i, patch))}</div>
            <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
