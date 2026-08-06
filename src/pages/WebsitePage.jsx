import { useRef, useState } from 'react';
import {
  Globe, Eye, EyeOff, ExternalLink, Save, Plus, Trash2, RefreshCw,
  Upload, ImagePlus, Link2, ArrowLeft, ArrowRight, Loader2, ImageOff,
} from 'lucide-react';
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
  useUploadWebsiteImage, useDeleteGalleryImage, useReorderGallery,
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
  const saveHeroImage = useUpdateContent(); // separate instance so its pending state is its own
  const c0 = cfg.content || {};
  const [c, setC] = useState({
    hero: { headline: c0.hero?.headline || '', tagline: c0.hero?.tagline || '', imageUrl: c0.hero?.imageUrl || '' },
    about: c0.about || '',
    services: (c0.services || []).map((s) => ({ ...s, _k: nextKey() })),
    contact: { phone: c0.contact?.phone || '', email: c0.contact?.email || '', whatsapp: c0.contact?.whatsapp || '', address: c0.contact?.address || '' },
    mapEmbed: c0.mapEmbed || '',
  });
  const set = (patch) => setC((p) => ({ ...p, ...patch }));

  const submit = async () => {
    try {
      // Images (gallery + hero) are managed by their own endpoints and are NOT part of this
      // form — echo the server's current values back so saving text can never clobber a photo
      // uploaded since the form mounted.
      await save.mutateAsync({
        hero: { ...c.hero, imageUrl: cfg.content?.hero?.imageUrl || '' },
        about: c.about,
        services: c.services.map(({ _k, ...s }) => s),
        gallery: cfg.content?.gallery || [],
        contact: c.contact, mapEmbed: c.mapEmbed,
      });
      toast.success('Content saved'); onSaved();
    } catch (e) { toastApiError(e); }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Hero</h3>
        <FormField label="Headline" description="Shown as the big line on your home page"><Input value={c.hero.headline} onChange={(e) => set({ hero: { ...c.hero, headline: e.target.value } })} placeholder="Compassionate dental care in Kolkata" /></FormField>
        <FormField label="Tagline"><Input value={c.hero.tagline} onChange={(e) => set({ hero: { ...c.hero, tagline: e.target.value } })} placeholder="Modern, gentle, and always on time" /></FormField>
        <FormField label="About" description="Used on the home page and in the footer"><Textarea rows={4} value={c.about} onChange={(e) => set({ about: e.target.value })} placeholder="Tell patients who you are, what you treat and what a visit feels like." /></FormField>
        <ImageSlot
          slot="hero"
          label="Hero image"
          description="Optional. Some templates use it as the hero photo and as the social share card."
          previewUrl={cfg.media?.heroUrl}
          value={cfg.content?.hero?.imageUrl || ''}
          onPersist={(next) => saveHeroImage.mutateAsync({ ...cfg.content, hero: { ...(cfg.content?.hero || {}), imageUrl: next } })}
          onSaved={onSaved}
        />
      </Card>

      <ListCard
        title="Services" items={c.services} onChange={(services) => set({ services })} blank={{ name: '', description: '', icon: '' }}
        description="These become the service cards on your home page. Leave empty to use the template's defaults."
        render={(item, upd) => (<><Input value={item.name} onChange={(e) => upd({ name: e.target.value })} placeholder="Service name" /><Input value={item.description} onChange={(e) => upd({ description: e.target.value })} placeholder="Short description" /></>)}
      />

      {/* Gallery is its own media manager — saved instantly, not with the form below. */}
      <GalleryCard cfg={cfg} onSaved={onSaved} />

      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
        <p className="-mt-2 text-caption text-muted-foreground">Shown in the contact section and the footer of every public page.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone"><Input value={c.contact.phone} onChange={(e) => set({ contact: { ...c.contact, phone: e.target.value } })} /></FormField>
          <FormField label="Email"><Input value={c.contact.email} onChange={(e) => set({ contact: { ...c.contact, email: e.target.value } })} /></FormField>
          <FormField label="WhatsApp" description="Digits only, with country code"><Input value={c.contact.whatsapp} onChange={(e) => set({ contact: { ...c.contact, whatsapp: e.target.value } })} placeholder="919876543210" /></FormField>
          <FormField label="Address"><Input value={c.contact.address} onChange={(e) => set({ contact: { ...c.contact, address: e.target.value } })} /></FormField>
        </div>
        <FormField label="Map embed URL" description="Google Maps 'embed' https link — renders a live map in your contact section"><Input value={c.mapEmbed} onChange={(e) => set({ mapEmbed: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=…" /></FormField>
      </Card>

      <div className="flex justify-end"><Button onClick={submit} disabled={save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save content'}</Button></div>
    </div>
  );
}

// ---- Gallery media manager (CMS_BASIC) ----
// Upload from the device or add a hosted URL; reorder and delete. Every action writes through
// to the server immediately and the card re-renders from the returned config, so what you see
// here is exactly what the public site renders.
function GalleryCard({ cfg, onSaved }) {
  const upload = useUploadWebsiteImage();
  const remove = useDeleteGalleryImage();
  const reorder = useReorderGallery();
  const saveContent = useUpdateContent();
  const fileRef = useRef(null);
  const [url, setUrl] = useState('');

  const items = cfg.media?.gallery || [];
  const busy = upload.isPending || remove.isPending || reorder.isPending || saveContent.isPending;

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be picked again after a failure
    if (!file) return;
    try { await upload.mutateAsync({ slot: 'gallery', file }); toast.success('Image added'); onSaved(); }
    catch (err) { toastApiError(err); }
  };

  const addUrl = async () => {
    const clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) { toast.error('Enter a full image URL starting with http:// or https://'); return; }
    try {
      await saveContent.mutateAsync({ ...cfg.content, gallery: [...(cfg.content?.gallery || []), clean] });
      setUrl(''); toast.success('Image added'); onSaved();
    } catch (err) { toastApiError(err); }
  };

  const del = async (index) => {
    try { await remove.mutateAsync(index); onSaved(); }
    catch (err) { toastApiError(err); }
  };

  const move = async (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const order = items.map((_, i) => i);
    [order[index], order[next]] = [order[next], order[index]];
    try { await reorder.mutateAsync(order); onSaved(); }
    catch (err) { toastApiError(err); }
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Gallery</h3>
          <p className="text-caption text-muted-foreground">
            {items.length ? `${items.length} of 24 images · shown in order on your site` : 'Add photos of your clinic — the gallery section is hidden until you do.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy || items.length >= 24}>
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ImagePlus className="h-7 w-7" />
          <span className="text-sm font-medium">Upload your first photo</span>
          <span className="text-caption">JPG, PNG or WebP — up to 24 images</span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((img, i) => (
            <li key={`${img.ref}-${i}`} className="group relative overflow-hidden rounded-lg border bg-muted">
              <div className="aspect-[4/3] w-full">
                {img.url ? (
                  <img src={img.url} alt={`Gallery image ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                    <ImageOff className="h-5 w-5" />
                    <span className="text-caption">Unavailable</span>
                  </div>
                )}
              </div>
              <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {img.uploaded ? 'Uploaded' : 'Link'}
              </span>
              <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                <div className="flex gap-1">
                  <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={busy || i === 0}><ArrowLeft className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={busy || i === items.length - 1}><ArrowRight className="h-3.5 w-3.5" /></IconBtn>
                </div>
                <IconBtn label="Remove image" onClick={() => del(i)} disabled={busy} destructive><Trash2 className="h-3.5 w-3.5" /></IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL (https://…)" onKeyDown={(e) => e.key === 'Enter' && addUrl()} />
        <Button variant="outline" onClick={addUrl} disabled={busy || !url.trim() || items.length >= 24} className="shrink-0">
          <Link2 className="h-4 w-4" /> Add link
        </Button>
      </div>
    </Card>
  );
}

function IconBtn({ label, onClick, disabled, destructive, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-white shadow-sm backdrop-blur transition-colors disabled:opacity-40',
        destructive ? 'bg-destructive/85 hover:bg-destructive' : 'bg-black/55 hover:bg-black/75'
      )}
    >
      {children}
    </button>
  );
}

/**
 * Single-image slot with an inline uploader — used for the hero image and the logo.
 *
 * Self-persisting on purpose: uploads go straight to `/api/website/media/:slot`, so the slot
 * must own the "paste a URL" and "clear" paths too (`onPersist`). If it shared the surrounding
 * form's state, saving that form would overwrite an image uploaded a moment earlier.
 */
function ImageSlot({ slot, label, description, previewUrl, value, onPersist, aspect = 'aspect-[16/9]', fit = 'object-cover', onSaved }) {
  const upload = useUploadWebsiteImage();
  const fileRef = useRef(null);
  const isUpload = typeof value === 'string' && value.startsWith('upload:');
  const [draft, setDraft] = useState(isUpload ? '' : value || '');
  const [saving, setSaving] = useState(false);
  const busy = upload.isPending || saving;

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try { await upload.mutateAsync({ slot, file }); setDraft(''); toast.success(`${label} updated`); onSaved?.(); }
    catch (err) { toastApiError(err); }
  };

  const persist = async (next) => {
    setSaving(true);
    try { await onPersist(next); onSaved?.(); }
    catch (err) { toastApiError(err); }
    finally { setSaving(false); }
  };

  const applyUrl = async () => {
    const clean = draft.trim();
    if (clean && !/^https?:\/\//i.test(clean)) { toast.error('Enter a full image URL starting with http:// or https://'); return; }
    await persist(clean);
    if (clean) toast.success(`${label} updated`);
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-caption text-muted-foreground">{description}</p> : null}
      </div>
      <div className={cn('relative overflow-hidden rounded-lg border bg-muted', aspect)}>
        {previewUrl ? (
          <img src={previewUrl} alt={label} className={cn('h-full w-full', fit)} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <span className="text-caption">No image yet</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
        </Button>
        {value ? (
          <Button variant="ghost" size="sm" onClick={() => { setDraft(''); persist(''); }} disabled={busy}>
            <Trash2 className="h-4 w-4 text-destructive" /> Remove
          </Button>
        ) : null}
      </div>
      {isUpload ? (
        <p className="text-caption text-muted-foreground">Using your uploaded image. Remove it to paste a link instead.</p>
      ) : (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyUrl()}
            placeholder="…or paste an image URL (https://…)"
          />
          <Button variant="outline" size="sm" onClick={applyUrl} disabled={busy || draft.trim() === (value || '')} className="shrink-0">
            <Link2 className="h-4 w-4" /> Apply
          </Button>
        </div>
      )}
    </div>
  );
}

// ---- Theme (CMS_BASIC) ----
// Brand green matches the app's --primary token, so a clinic that never touches these keeps
// the same palette as the dashboard.
const DEFAULT_PRIMARY = '#0E8C72';
const DEFAULT_ACCENT = '#0A6A56';

function ThemeTab({ cfg, onSaved }) {
  const save = useUpdateTheme();
  const saveLogo = useUpdateTheme();
  const [template, setTemplate] = useState(cfg.template);
  const [theme, setTheme] = useState({
    primaryColor: cfg.theme?.primaryColor || DEFAULT_PRIMARY,
    accentColor: cfg.theme?.accentColor || DEFAULT_ACCENT,
  });

  const submit = async () => {
    try {
      // Keep the logo the server currently holds — it is managed by the slot below.
      await save.mutateAsync({ template, theme: { ...theme, logoUrl: cfg.theme?.logoUrl || '' } });
      toast.success('Theme saved'); onSaved();
    } catch (e) { toastApiError(e); }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Template</h3>
        <p className="-mt-1 text-caption text-muted-foreground">All {TEMPLATE_META.length} templates render the same content — pick the look that suits your clinic.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATE_META.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              aria-pressed={template === t.id}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors hover:border-primary/50',
                template === t.id && 'border-primary ring-1 ring-primary/30'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{t.name}</div>
                {template === t.id ? <Badge variant="secondary">Selected</Badge> : null}
              </div>
              <div className="mt-1 text-caption text-muted-foreground">{t.blurb}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Colors</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Primary color"><div className="flex items-center gap-2"><input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="h-9 w-12 rounded border" aria-label="Primary color" /><Input value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} /></div></FormField>
          <FormField label="Accent color"><div className="flex items-center gap-2"><input type="color" value={theme.accentColor} onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })} className="h-9 w-12 rounded border" aria-label="Accent color" /><Input value={theme.accentColor} onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })} /></div></FormField>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => setTheme({ primaryColor: DEFAULT_PRIMARY, accentColor: DEFAULT_ACCENT })}
        >
          <RefreshCw className="h-4 w-4" /> Reset to Clynic green
        </Button>
      </Card>

      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Logo</h3>
        <ImageSlot
          slot="logo"
          label="Clinic logo"
          description="Shown in the navbar and footer of every public page. Falls back to your clinic name."
          previewUrl={cfg.media?.logoUrl}
          value={cfg.theme?.logoUrl || ''}
          aspect="aspect-[3/1]"
          fit="object-contain p-4"
          onPersist={(next) => saveLogo.mutateAsync({ template: cfg.template, theme: { ...(cfg.theme || {}), logoUrl: next } })}
          onSaved={onSaved}
        />
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
function ListCard({ title, description, items, onChange, blank, render }) {
  const add = () => onChange([...(items || []), { ...blank, _k: nextKey() }]);
  const upd = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {description ? <p className="text-caption text-muted-foreground">{description}</p> : null}
        </div>
        <Button variant="outline" size="sm" onClick={add} className="shrink-0"><Plus className="h-4 w-4" /> Add</Button>
      </div>
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
