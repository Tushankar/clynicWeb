import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, UserMinus, Repeat, Gem, Cake, CalendarClock, UserPlus, Send,
  Mail, MessageCircle, Sparkles, Lock, PencilLine, PlayCircle, QrCode, LogOut,
  CheckCircle2, Clock3, ArrowRight, Eye, Palette, Upload, RotateCcw, ImageIcon,
} from 'lucide-react';
import { PageHeader, StatCard, DataTable, Avatar } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useHasRole } from '@/hooks/useRole';
import {
  useCrmSummary, useCrmSegment, useReengage, useCrmSettings, useUpdateCrmSettings,
  useUpdateTemplate, useTestTemplate, useTemplatePreview, useRunCampaign,
  useUpdateEmailTheme, useUploadTemplateImage,
  useWhatsappStatus, useWhatsappConnect, useWhatsappLogout,
} from '@/hooks/useCrm';
import { toast, toastApiError } from '@/lib/toast';

// Each retention segment: card metadata + how to render its drill-down rows.
const SEGMENTS = [
  { key: 'lapsed', label: 'Lapsed (6m+)', icon: UserMinus, hint: 'Not seen in 6 months', reengage: true },
  { key: 'repeat', label: 'Repeat patients', icon: Repeat, hint: '2+ completed visits' },
  { key: 'high_value', label: 'High-value', icon: Gem, hint: 'By lifetime revenue' },
  { key: 'birthdays', label: 'Birthdays (30d)', icon: Cake, hint: 'Upcoming' },
  { key: 'followups_due', label: 'Follow-ups due', icon: CalendarClock, hint: 'Within 7 days', reengage: true },
  { key: 'new_this_month', label: 'New this month', icon: UserPlus, hint: 'Newly registered' },
];
const countKey = { lapsed: 'lapsed', repeat: 'repeat', high_value: 'highValue', birthdays: 'birthdays', followups_due: 'followupsDue', new_this_month: 'newThisMonth' };

export default function CrmPage() {
  return (
    <FeatureGate feature="CRM">
      <CrmInner />
    </FeatureGate>
  );
}

function CrmInner() {
  const isOwner = useHasRole('owner');
  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM & retention"
        description="Re-engage lapsed patients, reward regulars, and let automations send birthday wishes and follow-up reminders for you."
      />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><HeartHandshake className="mr-1.5 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="automations"><Clock3 className="mr-1.5 h-4 w-4" /> Automations</TabsTrigger>
          <TabsTrigger value="templates"><PencilLine className="mr-1.5 h-4 w-4" /> Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="automations"><Automations isOwner={isOwner} /></TabsContent>
        <TabsContent value="templates"><TemplatesPanel isOwner={isOwner} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============================== Overview (segments) ==============================

function Overview() {
  const { data, isLoading } = useCrmSummary();
  const counts = data?.counts || {};
  const [active, setActive] = useState('lapsed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {SEGMENTS.map((s) => (
          <button key={s.key} type="button" onClick={() => setActive(s.key)} className="text-left">
            <StatCard
              label={s.label}
              value={counts[countKey[s.key]] ?? 0}
              icon={s.icon}
              hint={s.hint}
              loading={isLoading}
              className={cn('transition-shadow hover:border-primary/40', active === s.key && 'border-primary ring-1 ring-primary/30')}
            />
          </button>
        ))}
      </div>
      <SegmentTable segment={SEGMENTS.find((s) => s.key === active)} />
      <p className="text-xs text-muted-foreground">
        Every message sent from here is recorded — see{' '}
        <Link to="/dashboard/communications" className="font-medium text-primary hover:underline">Communications</Link> for the full log.
      </p>
    </div>
  );
}

function SegmentTable({ segment }) {
  const q = useCrmSegment(segment.key);
  const reengage = useReengage();
  const rows = q.data?.items || [];

  const doReengage = async (p) => {
    try {
      const res = await reengage.mutateAsync(p._id);
      const via = res.channels?.length > 1 ? 'email + WhatsApp' : res.channel;
      toast.success(`Re-engagement sent to ${p.name} via ${via}`);
    } catch (err) {
      toastApiError(err);
    }
  };

  const columns = [
    { key: 'name', header: 'Patient', render: (p) => (
      <span className="flex items-center gap-3">
        <Avatar name={p.name} />
        <span className="font-semibold text-foreground">{p.name}</span>
      </span>
    ) },
    { key: 'phone', header: 'Phone', className: 'tabular', render: (p) => p.phone || '—' },
    segment.key === 'high_value'
      ? { key: 'revenue', header: 'Lifetime revenue', align: 'right', className: 'tabular', render: (p) => `₹${(p.revenue ?? 0).toLocaleString('en-IN')}` }
      : segment.key === 'birthdays'
      ? { key: 'bday', header: 'Birthday in', align: 'right', render: (p) => `${p.daysToBirthday} day(s)` }
      : { key: 'last', header: 'Last visit', align: 'right', render: (p) => (p.lastVisitAt ? fmtDate(p.lastVisitAt) : '—') },
  ];
  if (segment.reengage) {
    columns.push({
      key: 'action',
      header: '',
      align: 'right',
      render: (p) => (
        <Button variant="outline" size="sm" onClick={() => doReengage(p)} disabled={reengage.isPending || !p.email} title={p.email ? 'Send a re-engagement message' : 'No email on file'}>
          <Send className="h-3.5 w-3.5" /> Re-engage
        </Button>
      ),
    });
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{segment.label}</h2>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={q.isLoading}
        isError={q.isError}
        error={q.error}
        onRetry={q.refetch}
        empty={{ icon: HeartHandshake, title: 'No patients in this segment', description: 'As your clinic sees more patients, retention segments fill in here.' }}
      />
    </div>
  );
}

// ============================== Automations ==============================

function Automations({ isOwner }) {
  const { data, isLoading } = useCrmSettings();
  const update = useUpdateCrmSettings();
  const run = useRunCampaign();
  const s = data?.settings || {};
  const ent = data?.entitlements || {};
  const channels = data?.channels || {};

  const patch = async (change) => {
    try {
      await update.mutateAsync(change);
      toast.success('Automation settings saved');
    } catch (err) {
      toastApiError(err);
    }
  };

  const runNow = async (campaign) => {
    try {
      const res = await run.mutateAsync(campaign);
      toast.success(`${campaign === 'birthday' ? 'Birthday' : 'Follow-up'} campaign ran — ${res.sent} sent, ${res.skipped} skipped`);
    } catch (err) {
      toastApiError(err);
    }
  };

  if (isLoading) return <Card className="p-6 text-sm text-muted-foreground">Loading automations…</Card>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <AutomationCard
          icon={Cake}
          title="Birthday wishes"
          description="Every day, patients whose birthday it is receive a warm greeting from your clinic — automatically."
          enabled={Boolean(s.birthdayEnabled)}
          onToggle={(v) => patch({ birthdayEnabled: v })}
          onRunNow={() => runNow('birthday')}
          disabled={!isOwner || update.isPending}
          running={run.isPending}
        />
        <AutomationCard
          icon={CalendarClock}
          title="Follow-up reminders"
          description="Patients whose follow-up date arrives get a gentle reminder to book — no front-desk effort."
          enabled={Boolean(s.followupEnabled)}
          onToggle={(v) => patch({ followupEnabled: v })}
          onRunNow={() => runNow('followup')}
          disabled={!isOwner || update.isPending}
          running={run.isPending}
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Clock3 className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-foreground">Daily send time</p>
              <p className="text-xs text-muted-foreground">Campaigns go out after this hour each day.</p>
            </div>
          </div>
          <select
            value={s.sendHour ?? 9}
            disabled={!isOwner}
            onChange={(e) => patch({ sendHour: Number(e.target.value) })}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Sparkles className="h-5 w-5" /></span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                AI-personalized messages
                {!ent.ai && <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700"><Lock className="h-3 w-3" /> Premium</Badge>}
              </p>
              <p className="max-w-xl text-xs text-muted-foreground">
                The AI rewrites each campaign message to feel personal and warm — marketing copy only, never medical content.
                {!ent.ai && ' Upgrade to Premium to enable.'}
              </p>
            </div>
          </div>
          <Switch
            checked={Boolean(s.aiPersonalize)}
            onCheckedChange={(v) => patch({ aiPersonalize: v })}
            disabled={!isOwner || !ent.ai || update.isPending}
            aria-label="AI personalization"
          />
        </div>
      </Card>

      <ChannelsCard channels={channels} isOwner={isOwner} />
    </div>
  );
}

function AutomationCard({ icon: Icon, title, description, enabled, onToggle, onRunNow, disabled, running }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {title}
              {enabled ? (
                <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
              ) : (
                <Badge variant="secondary">Off</Badge>
              )}
            </p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} disabled={disabled} aria-label={title} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <p className="text-xs text-muted-foreground">Sends on email — and WhatsApp too once connected.</p>
        <Button variant="outline" size="sm" onClick={onRunNow} disabled={disabled || running || !enabled} title={enabled ? 'Run this campaign now' : 'Turn the automation on first'}>
          <PlayCircle className="h-3.5 w-3.5" /> Run now
        </Button>
      </div>
    </Card>
  );
}

// ============================== Channels (email + WhatsApp/Baileys) ==============================

const WA_STATUS = {
  disabled: { label: 'Not enabled', tone: 'bg-slate-100 text-slate-600' },
  disconnected: { label: 'Not connected', tone: 'bg-slate-100 text-slate-600' },
  connecting: { label: 'Connecting…', tone: 'bg-amber-100 text-amber-700' },
  qr: { label: 'Scan the QR', tone: 'bg-amber-100 text-amber-700' },
  connected: { label: 'Connected', tone: 'bg-emerald-100 text-emerald-700' },
};

function ChannelsCard({ channels, isOwner }) {
  const [waOpen, setWaOpen] = useState(false);
  const wa = channels.whatsapp || {};
  const email = channels.email || {};
  const waMeta = WA_STATUS[wa.status] || WA_STATUS.disconnected;

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Delivery channels</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Mail className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-foreground">Email</p>
              <p className="text-xs text-muted-foreground">{email.configured ? `Sending as ${email.from}` : 'SMTP not configured — messages go to the dev log only.'}</p>
            </div>
          </div>
          <Badge className={cn('shrink-0', email.configured ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100')}>
            {email.configured ? 'Active' : 'Dev mode'}
          </Badge>
        </Card>

        <Card className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><MessageCircle className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-foreground">WhatsApp <span className="font-normal text-muted-foreground">(your number, via Baileys)</span></p>
              <p className="text-xs text-muted-foreground">
                {wa.status === 'connected'
                  ? `Linked as +${wa.connectedAs} — messages also go out on WhatsApp.`
                  : !wa.planAllowed
                  ? 'Available on Standard and Premium plans.'
                  : !wa.driverEnabled
                  ? 'Set WHATSAPP_DRIVER=baileys on the server to enable, then link your number.'
                  : 'Link your WhatsApp number to also send on WhatsApp — alongside email.'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge className={cn(waMeta.tone, 'hover:' + waMeta.tone)}>{waMeta.label}</Badge>
            {isOwner && wa.planAllowed && wa.driverEnabled && (
              <Button variant="outline" size="sm" onClick={() => setWaOpen(true)}>
                {wa.status === 'connected' ? 'Manage' : <><QrCode className="h-3.5 w-3.5" /> Connect</>}
              </Button>
            )}
          </div>
        </Card>
      </div>
      <WhatsappDialog open={waOpen} onOpenChange={setWaOpen} />
    </div>
  );
}

function WhatsappDialog({ open, onOpenChange }) {
  const status = useWhatsappStatus({ poll: open });
  const connect = useWhatsappConnect();
  const logout = useWhatsappLogout();
  const s = status.data || {};

  useEffect(() => {
    // Auto-start pairing when the dialog opens and nothing is connected yet.
    if (open && !status.isLoading && s.status && ['disconnected'].includes(s.status)) {
      connect.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status.isLoading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link WhatsApp</DialogTitle>
          <DialogDescription>
            Open WhatsApp on your phone → Settings → Linked devices → Link a device, then scan this QR.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 py-2">
          {s.status === 'connected' ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-sm font-semibold">Connected as +{s.connectedAs}</p>
              <p className="text-center text-xs text-muted-foreground">
                Campaigns, reminders, and re-engagement now go out on WhatsApp too — at the same time as email.
              </p>
            </>
          ) : s.qr ? (
            <>
              <img src={s.qr} alt="WhatsApp pairing QR" className="h-64 w-64 rounded-lg border" />
              <p className="text-xs text-muted-foreground">Waiting for scan… this refreshes automatically.</p>
            </>
          ) : (
            <>
              <div className="h-64 w-64 animate-pulse rounded-lg bg-muted" />
              <p className="text-xs text-muted-foreground">{s.lastError ? s.lastError : 'Preparing the QR…'}</p>
            </>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {s.status === 'connected' ? (
            <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
              <LogOut className="h-4 w-4" /> Unlink number
            </Button>
          ) : (
            <Button variant="outline" onClick={() => connect.mutate()} disabled={connect.isPending}>
              Restart pairing
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================== Templates ==============================

const TEMPLATE_ICON = { birthday: Cake, followup: CalendarClock, reengage: HeartHandshake };

function TemplatesPanel({ isOwner }) {
  const { data, isLoading } = useCrmSettings();
  const ent = data?.entitlements || {};
  const [editing, setEditing] = useState(null); // template object being edited
  const [testing, setTesting] = useState(null); // template kind being test-sent
  const [previewing, setPreviewing] = useState(null); // template being previewed

  if (isLoading) return <Card className="p-6 text-sm text-muted-foreground">Loading templates…</Card>;

  return (
    <div className="space-y-5">
      {!ent.templateEditing && (
        <Card className="flex items-center gap-3 border-amber-200 bg-amber-50 p-4">
          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            You're on the professional default design. <span className="font-semibold">Editing colours, images and wording is a Premium feature</span> — upgrade to make the emails your own.
          </p>
        </Card>
      )}

      <EmailThemePanel theme={data?.emailTheme} overrides={data?.emailThemeOverrides} canEdit={isOwner && ent.templateEditing} />

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Campaign templates</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {(data?.templates || []).map((t) => {
            const Icon = TEMPLATE_ICON[t.kind] || Send;
            return (
              <Card key={t.kind} className="flex flex-col overflow-hidden p-0">
                {t.imageSrc ? (
                  <img src={t.imageSrc} alt="" className="h-28 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-muted/60 text-xs text-muted-foreground">
                    <ImageIcon className="mr-1.5 h-4 w-4" /> No hero image
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">{t.label}</p>
                      {t.customized ? <Badge variant="secondary" className="mt-0.5">Customized</Badge> : <Badge variant="secondary" className="mt-0.5 bg-slate-100 text-slate-600">Default</Badge>}
                    </div>
                  </div>
                  <div className="mt-4 flex-1 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Subject</p>
                    <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-foreground">{t.subject}</p>
                    <p className="text-xs font-medium text-muted-foreground">Message</p>
                    <p className="line-clamp-4 whitespace-pre-wrap rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewing(t)}>
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                    {isOwner && (
                      <>
                        <Button
                          variant="outline" size="sm" className="flex-1"
                          disabled={!ent.templateEditing}
                          title={ent.templateEditing ? 'Edit this template' : 'Template editing is Premium'}
                          onClick={() => setEditing(t)}
                        >
                          {ent.templateEditing ? <PencilLine className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setTesting(t.kind)}>
                          <ArrowRight className="h-3.5 w-3.5" /> Send test
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Placeholders: <code className="rounded bg-muted px-1">{'{{patient_name}}'}</code>{' '}
        <code className="rounded bg-muted px-1">{'{{clinic_name}}'}</code>{' '}
        <code className="rounded bg-muted px-1">{'{{clinic_phone}}'}</code>{' '}
        <code className="rounded bg-muted px-1">{'{{clinic_address}}'}</code> — they fill in automatically for each patient.
      </p>
      <TemplateEditDialog template={editing} onClose={() => setEditing(null)} />
      <TestSendDialog kind={testing} onClose={() => setTesting(null)} />
      <TemplatePreviewDialog template={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}

// ---- Email colour theme (accent / background / heading / text) ----
const THEME_FIELDS = [
  { key: 'accent', label: 'Accent', hint: 'Hero & buttons' },
  { key: 'bg', label: 'Background', hint: 'Email canvas' },
  { key: 'heading', label: 'Headings', hint: 'Titles' },
  { key: 'text', label: 'Body text', hint: 'Paragraphs' },
];

function EmailThemePanel({ theme, overrides, canEdit }) {
  const update = useUpdateEmailTheme();
  const [draft, setDraft] = useState({});

  useEffect(() => {
    if (theme) setDraft({ accent: theme.accent, bg: theme.bg, heading: theme.heading, text: theme.text });
  }, [theme]);

  const dirty = theme && THEME_FIELDS.some((f) => (draft[f.key] || '').toLowerCase() !== (theme[f.key] || '').toLowerCase());
  const hasOverrides = overrides && Object.values(overrides).some(Boolean);

  const save = async () => {
    try {
      await update.mutateAsync(draft);
      toast.success('Email colours updated');
    } catch (err) {
      toastApiError(err);
    }
  };
  const reset = async () => {
    try {
      await update.mutateAsync({ accent: '', bg: '', heading: '', text: '' });
      toast.success('Reset to the default colours');
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Palette className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold text-foreground">Email colours</p>
            <p className="text-xs text-muted-foreground">Applies to every automated email — birthday, follow-up, re-engagement & reminders.</p>
          </div>
        </div>
        {canEdit && hasOverrides && (
          <Button variant="ghost" size="sm" onClick={reset} disabled={update.isPending}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset defaults
          </Button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {THEME_FIELDS.map((f) => (
          <div key={f.key}>
            <p className="mb-1.5 text-xs font-medium text-foreground">{f.label}</p>
            <div className={cn('flex items-center gap-2 rounded-lg border p-1.5', !canEdit && 'opacity-70')}>
              <label className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border" style={{ background: draft[f.key] || theme?.[f.key] }}>
                <input
                  type="color"
                  disabled={!canEdit}
                  value={draft[f.key] || theme?.[f.key] || '#000000'}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`${f.label} colour`}
                />
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={draft[f.key] || ''}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                className="w-full bg-transparent text-xs font-medium uppercase tabular-nums outline-none"
                placeholder="#hex"
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{f.hint}</p>
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={save} disabled={!dirty || update.isPending}>
            {update.isPending ? 'Saving…' : 'Save colours'}
          </Button>
        </div>
      )}
    </Card>
  );
}

function TemplatePreviewDialog({ template, onClose }) {
  const preview = useTemplatePreview(template?.kind);
  return (
    <Dialog open={!!template} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview — {template?.label}</DialogTitle>
          <DialogDescription>Exactly what the patient receives (sample data). WhatsApp gets the plain-text version.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="rounded-md bg-muted/60 px-3 py-2 text-xs">
            <span className="font-semibold text-foreground">Subject: </span>
            <span className="text-muted-foreground">{preview.data?.subject || '…'}</span>
          </p>
          <div className="overflow-hidden rounded-xl border bg-slate-100">
            {preview.isLoading ? (
              <div className="flex h-[460px] items-center justify-center text-sm text-muted-foreground">Rendering preview…</div>
            ) : (
              <iframe title="Email preview" srcDoc={preview.data?.html || ''} sandbox="" className="h-[460px] w-full border-0 bg-white" />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplateEditDialog({ template, onClose }) {
  const update = useUpdateTemplate();
  const uploadImg = useUploadTemplateImage();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (template) {
      setSubject(template.subject || '');
      setBody(template.body || '');
      setImageUrl(template.hasUpload ? '' : template.imageUrl || '');
    }
  }, [template]);

  const save = async () => {
    try {
      await update.mutateAsync({ kind: template.kind, subject, body, imageUrl });
      toast.success(`${template.label} template saved`);
      onClose();
    } catch (err) {
      toastApiError(err);
    }
  };

  const onFile = async (file) => {
    if (!file) return;
    try {
      await uploadImg.mutateAsync({ kind: template.kind, file });
      toast.success('Image uploaded');
      setImageUrl(''); // an upload supersedes any pasted URL
    } catch (err) {
      toastApiError(err);
    }
  };

  const pastePreview = /^https?:\/\//i.test(imageUrl.trim());
  const currentImage = pastePreview ? imageUrl.trim() : template?.imageSrc;

  return (
    <Dialog open={!!template} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit — {template?.label}</DialogTitle>
          <DialogDescription>Sent as a branded email (and WhatsApp when connected). Placeholders fill automatically per patient.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Hero image: upload OR paste a link */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-foreground">Hero image</p>
            {currentImage ? (
              <img src={currentImage} alt="" className="mb-2 h-32 w-full rounded-lg border object-cover" />
            ) : (
              <div className="mb-2 flex h-32 w-full items-center justify-center rounded-lg border border-dashed bg-muted/40 text-xs text-muted-foreground">
                <ImageIcon className="mr-1.5 h-4 w-4" /> No image
              </div>
            )}
            <div className="flex gap-2">
              <label className={cn('flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-background px-3 py-2 text-xs font-medium hover:bg-accent', uploadImg.isPending && 'pointer-events-none opacity-60')}>
                <Upload className="h-3.5 w-3.5" /> {uploadImg.isPending ? 'Uploading…' : template?.hasUpload ? 'Replace image' : 'Upload image'}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
              {(template?.hasUpload || pastePreview) && (
                <Button type="button" variant="outline" size="sm" onClick={() => { setImageUrl('none'); }}>
                  Remove
                </Button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Upload a JPG/PNG/WebP (auto-resized), or paste a hosted link below.</p>
            <Input className="mt-1.5" value={imageUrl === 'none' ? '' : imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/…" />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-foreground">Subject</p>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-foreground">Message</p>
            <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <p className="text-[11px] text-muted-foreground">Clearing the subject/message restores the professional defaults.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save template'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestSendDialog({ kind, onClose }) {
  const test = useTestTemplate();
  const [email, setEmail] = useState('');

  const send = async () => {
    try {
      const res = await test.mutateAsync({ kind, email: email.trim() });
      toast.success(`Test ${res.personalized ? '(AI-personalized) ' : ''}sent to ${res.to}`);
      onClose();
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Dialog open={!!kind} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Send a test message</DialogTitle>
          <DialogDescription>Delivers the real branded email to an address you choose, using sample patient data.</DialogDescription>
        </DialogHeader>
        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={send} disabled={test.isPending || !email.trim()}>{test.isPending ? 'Sending…' : 'Send test'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
