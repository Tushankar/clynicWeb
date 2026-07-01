import { useEffect, useState } from 'react';
import { Globe, Eye, EyeOff, ExternalLink, Save, Plus, Trash2, RefreshCw, Star } from 'lucide-react';
import { PageHeader, LoadingSkeleton, FormField } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { UpgradeNotice } from '@/components/UpgradeNotice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TEMPLATE_META } from '@/components/site/registry';
import { useFeature } from '@/hooks/usePlan';
import {
  useWebsiteConfig, usePublishWebsite, useUpdateContent, useUpdateTheme,
  useUpdateReviews, useUpdateSeo, useCreatePage, useUpdatePage, useDeletePage,
} from '@/hooks/useWebsite';
import { cn } from '@/lib/utils';
import { toast, toastApiError } from '@/lib/toast';

let rowKeySeq = 0;
const nextKey = () => `r${(rowKeySeq += 1)}`;

export default function WebsitePage() {
  return (
    <FeatureGate feature="WEBSITE_LIVE">
      <WebsiteInner />
    </FeatureGate>
  );
}

function WebsiteInner() {
  const { data: cfg, isLoading } = useWebsiteConfig();
  const publish = usePublishWebsite();
  const canBasic = useFeature('CMS_BASIC');
  const canAdvanced = useFeature('CMS_ADVANCED');
  const [previewKey, setPreviewKey] = useState(0);
  const bumpPreview = () => setPreviewKey((k) => k + 1);

  if (isLoading || !cfg) return <LoadingSkeleton lines={8} />;

  const doPublish = async () => {
    try { await publish.mutateAsync(!cfg.published); toast.success(cfg.published ? 'Site unpublished' : 'Site published'); bumpPreview(); }
    catch (e) { toastApiError(e); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website"
        description="Your clinic's public website. Every plan gets a live site; Standard unlocks editing, Premium adds pages, reviews & SEO."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open(`/c/${cfg.slug}`, '_blank', 'noopener')}><ExternalLink className="h-4 w-4" /> Open site</Button>
            <Button onClick={doPublish} disabled={publish.isPending} variant={cfg.published ? 'outline' : 'default'}>
              {cfg.published ? <><EyeOff className="h-4 w-4" /> Unpublish</> : <><Eye className="h-4 w-4" /> Publish</>}
            </Button>
          </div>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', cfg.published ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}><Globe className="h-5 w-5" /></span>
          <div>
            <div className="font-medium">{cfg.published ? 'Live' : 'Unpublished (draft)'}</div>
            <a href={`/c/${cfg.slug}`} target="_blank" rel="noopener" className="text-caption text-primary hover:underline">{cfg.publicUrl}</a>
          </div>
        </div>
        <Badge variant="secondary" className="capitalize">Template: {cfg.template.replace('-', ' ')}</Badge>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <Tabs defaultValue="content">
          <TabsList className="flex-wrap">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="content">{canBasic ? <ContentTab cfg={cfg} onSaved={bumpPreview} /> : <UpgradeNotice feature="CMS_BASIC" />}</TabsContent>
          <TabsContent value="theme">{canBasic ? <ThemeTab cfg={cfg} onSaved={bumpPreview} /> : <UpgradeNotice feature="CMS_BASIC" />}</TabsContent>
          <TabsContent value="pages">{canAdvanced ? <PagesTab cfg={cfg} onSaved={bumpPreview} /> : <UpgradeNotice feature="CMS_ADVANCED" />}</TabsContent>
          <TabsContent value="reviews">{canAdvanced ? <ReviewsTab cfg={cfg} onSaved={bumpPreview} /> : <UpgradeNotice feature="CMS_ADVANCED" />}</TabsContent>
          <TabsContent value="seo">{canAdvanced ? <SeoTab cfg={cfg} onSaved={bumpPreview} /> : <UpgradeNotice feature="CMS_ADVANCED" />}</TabsContent>
        </Tabs>

        {/* Live preview */}
        <div className="hidden xl:block">
          <div className="sticky top-20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Live preview</span>
              <Button variant="ghost" size="icon" onClick={bumpPreview} aria-label="Refresh preview"><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
              <iframe key={previewKey} title="Website preview" src={`/c/${cfg.slug}`} className="h-[70vh] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Content (CMS_BASIC) ----
function ContentTab({ cfg, onSaved }) {
  const save = useUpdateContent();
  const c0 = cfg.content || {};
  const [c, setC] = useState({
    hero: { headline: c0.hero?.headline || '', tagline: c0.hero?.tagline || '', imageUrl: c0.hero?.imageUrl || '' },
    about: c0.about || '',
    services: (c0.services || []).map((s) => ({ ...s, _k: nextKey() })),
    gallery: (c0.gallery || []).map((url) => ({ url, _k: nextKey() })),
    contact: { phone: c0.contact?.phone || '', email: c0.contact?.email || '', whatsapp: c0.contact?.whatsapp || '', address: c0.contact?.address || '' },
    mapEmbed: c0.mapEmbed || '',
  });
  const set = (patch) => setC((p) => ({ ...p, ...patch }));

  const submit = async () => {
    try {
      await save.mutateAsync({
        hero: c.hero, about: c.about,
        services: c.services.map(({ _k, ...s }) => s),
        gallery: c.gallery.map((g) => g.url),
        contact: c.contact, mapEmbed: c.mapEmbed,
      });
      toast.success('Content saved'); onSaved();
    } catch (e) { toastApiError(e); }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Hero</h3>
        <FormField label="Headline"><Input value={c.hero.headline} onChange={(e) => set({ hero: { ...c.hero, headline: e.target.value } })} placeholder="Compassionate dental care in Kolkata" /></FormField>
        <FormField label="Tagline"><Input value={c.hero.tagline} onChange={(e) => set({ hero: { ...c.hero, tagline: e.target.value } })} placeholder="Modern, gentle, and always on time" /></FormField>
        <FormField label="Hero image URL" description="Optional — a tasteful gradient shows if empty"><Input value={c.hero.imageUrl} onChange={(e) => set({ hero: { ...c.hero, imageUrl: e.target.value } })} placeholder="https://…/hero.jpg" /></FormField>
        <FormField label="About"><Textarea rows={4} value={c.about} onChange={(e) => set({ about: e.target.value })} /></FormField>
      </Card>

      <ListCard
        title="Services" items={c.services} onChange={(services) => set({ services })} blank={{ name: '', description: '', icon: '' }}
        render={(item, upd) => (<><Input value={item.name} onChange={(e) => upd({ name: e.target.value })} placeholder="Service name" /><Input value={item.description} onChange={(e) => upd({ description: e.target.value })} placeholder="Short description" /></>)}
      />
      <ListCard
        title="Gallery (image URLs)" items={c.gallery} onChange={(gallery) => set({ gallery })} blank={{ url: '' }}
        render={(item, upd) => <Input value={item.url} onChange={(e) => upd({ url: e.target.value })} placeholder="https://…/photo.jpg" />}
      />

      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone"><Input value={c.contact.phone} onChange={(e) => set({ contact: { ...c.contact, phone: e.target.value } })} /></FormField>
          <FormField label="Email"><Input value={c.contact.email} onChange={(e) => set({ contact: { ...c.contact, email: e.target.value } })} /></FormField>
          <FormField label="WhatsApp"><Input value={c.contact.whatsapp} onChange={(e) => set({ contact: { ...c.contact, whatsapp: e.target.value } })} /></FormField>
          <FormField label="Address"><Input value={c.contact.address} onChange={(e) => set({ contact: { ...c.contact, address: e.target.value } })} /></FormField>
        </div>
        <FormField label="Map embed URL" description="Google Maps 'embed' https link (optional)"><Input value={c.mapEmbed} onChange={(e) => set({ mapEmbed: e.target.value })} /></FormField>
      </Card>

      <div className="flex justify-end"><Button onClick={submit} disabled={save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save content'}</Button></div>
    </div>
  );
}

// ---- Theme (CMS_BASIC) ----
function ThemeTab({ cfg, onSaved }) {
  const save = useUpdateTheme();
  const [template, setTemplate] = useState(cfg.template);
  const [theme, setTheme] = useState({ primaryColor: cfg.theme?.primaryColor || '#0d9488', accentColor: cfg.theme?.accentColor || '#0f766e', logoUrl: cfg.theme?.logoUrl || '' });

  const submit = async () => {
    try { await save.mutateAsync({ template, theme }); toast.success('Theme saved'); onSaved(); }
    catch (e) { toastApiError(e); }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Template</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {TEMPLATE_META.map((t) => (
            <button key={t.id} type="button" onClick={() => setTemplate(t.id)} className={cn('rounded-lg border p-4 text-left transition-colors hover:border-primary/50', template === t.id && 'border-primary ring-1 ring-primary/30')}>
              <div className="font-medium">{t.name}</div>
              <div className="mt-1 text-caption text-muted-foreground">{t.blurb}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Colors &amp; logo</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Primary color"><div className="flex items-center gap-2"><input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="h-9 w-12 rounded border" /><Input value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} /></div></FormField>
          <FormField label="Accent color"><div className="flex items-center gap-2"><input type="color" value={theme.accentColor} onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })} className="h-9 w-12 rounded border" /><Input value={theme.accentColor} onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })} /></div></FormField>
        </div>
        <FormField label="Logo URL" description="Optional; falls back to your clinic name"><Input value={theme.logoUrl} onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value })} placeholder="https://…/logo.png" /></FormField>
      </Card>
      <div className="flex justify-end"><Button onClick={submit} disabled={save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save theme'}</Button></div>
    </div>
  );
}

// ---- Pages (CMS_ADVANCED) ----
function PagesTab({ cfg, onSaved }) {
  const create = useCreatePage();
  const update = useUpdatePage();
  const del = useDeletePage();
  const [draft, setDraft] = useState({ title: '', body: '', published: true });
  const pages = cfg.pages || [];

  const add = async () => {
    if (!draft.title.trim()) return;
    try { await create.mutateAsync(draft); setDraft({ title: '', body: '', published: true }); toast.success('Page added'); onSaved(); }
    catch (e) { toastApiError(e); }
  };
  const toggle = async (p) => { try { await update.mutateAsync({ slug: p.slug, published: !p.published }); onSaved(); } catch (e) { toastApiError(e); } };
  const remove = async (p) => { if (!window.confirm(`Delete page "${p.title}"?`)) return; try { await del.mutateAsync(p.slug); toast.success('Page deleted'); onSaved(); } catch (e) { toastApiError(e); } }; // eslint-disable-line no-alert

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">New page</h3>
        <FormField label="Title"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Insurance & FAQs" /></FormField>
        <FormField label="Body"><Textarea rows={4} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></FormField>
        <div className="flex justify-end"><Button onClick={add} disabled={create.isPending}><Plus className="h-4 w-4" /> Add page</Button></div>
      </Card>
      {pages.length === 0 ? <p className="text-sm text-muted-foreground">No custom pages yet.</p> : pages.map((p) => (
        <Card key={p.slug} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0"><div className="truncate font-medium">{p.title}</div><a href={`/c/${cfg.slug}/p/${p.slug}`} target="_blank" rel="noopener" className="text-caption text-primary hover:underline">/p/{p.slug}</a></div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toggle(p)}>{p.published ? 'Published' : 'Draft'}</Button>
            <Button variant="ghost" size="icon" onClick={() => remove(p)} aria-label="Delete page"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---- Reviews (CMS_ADVANCED) ----
function ReviewsTab({ cfg, onSaved }) {
  const save = useUpdateReviews();
  const [reviews, setReviews] = useState((cfg.reviews || []).map((r) => ({ ...r, _k: nextKey() })));
  const submit = async () => {
    try { await save.mutateAsync(reviews.map(({ _k, ...r }) => r)); toast.success('Reviews saved'); onSaved(); }
    catch (e) { toastApiError(e); }
  };
  const upd = (k, patch) => setReviews((rs) => rs.map((r) => (r._k === k ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Only <strong>approved</strong> reviews appear on the public site.</p><Button variant="outline" size="sm" onClick={() => setReviews([...reviews, { name: '', text: '', rating: 5, approved: true, _k: nextKey() }])}><Plus className="h-4 w-4" /> Add</Button></div>
      {reviews.map((r) => (
        <Card key={r._k} className="space-y-2 p-4">
          <div className="flex gap-2">
            <Input value={r.name} onChange={(e) => upd(r._k, { name: e.target.value })} placeholder="Patient name" className="max-w-[12rem]" />
            <select value={r.rating} onChange={(e) => upd(r._k, { rating: Number(e.target.value) })} className="rounded-md border bg-background px-2 text-sm">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}★</option>)}</select>
            <label className="ml-auto flex items-center gap-1.5 text-sm"><input type="checkbox" checked={r.approved} onChange={(e) => upd(r._k, { approved: e.target.checked })} /> Approved</label>
            <Button variant="ghost" size="icon" onClick={() => setReviews((rs) => rs.filter((x) => x._k !== r._k))} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
          <Textarea rows={2} value={r.text} onChange={(e) => upd(r._k, { text: e.target.value })} placeholder="What the patient said" />
        </Card>
      ))}
      <div className="flex justify-end"><Button onClick={submit} disabled={save.isPending}><Save className="h-4 w-4" /> Save reviews</Button></div>
    </div>
  );
}

// ---- SEO (CMS_ADVANCED) ----
function SeoTab({ cfg, onSaved }) {
  const save = useUpdateSeo();
  const [seo, setSeo] = useState({ title: cfg.seo?.title || '', description: cfg.seo?.description || '', keywords: cfg.seo?.keywords || '' });
  const submit = async () => { try { await save.mutateAsync(seo); toast.success('SEO saved'); onSaved(); } catch (e) { toastApiError(e); } };
  return (
    <Card className="space-y-4 p-5">
      <FormField label="Page title"><Input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} placeholder="Dr Sen Clinic — Book an appointment" /></FormField>
      <FormField label="Meta description"><Textarea rows={2} value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} /></FormField>
      <FormField label="Keywords" description="Comma-separated"><Input value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} /></FormField>
      <div className="flex justify-end"><Button onClick={submit} disabled={save.isPending}><Save className="h-4 w-4" /> Save SEO</Button></div>
    </Card>
  );
}

// ---- reusable list editor (services / gallery) ----
function ListCard({ title, items, onChange, blank, render }) {
  const add = () => onChange([...(items || []), { ...blank, _k: nextKey() }]);
  const upd = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-medium text-muted-foreground">{title}</h3><Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4" /> Add</Button></div>
      {(!items || items.length === 0) && <p className="text-sm text-muted-foreground">None yet.</p>}
      {(items || []).map((item, i) => (
        <div key={item._k || i} className="flex items-center gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">{render(item, (patch) => upd(i, patch))}</div>
          <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ))}
    </Card>
  );
}
