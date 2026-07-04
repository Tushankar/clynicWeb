import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, UserMinus, Repeat, Gem, Cake, CalendarClock, UserPlus, Send,
  Mail, MessageCircle, Sparkles, Lock, PencilLine, PlayCircle, QrCode, LogOut,
  CheckCircle2, Clock3, Eye, Palette, Upload, RotateCcw, ImageIcon, Braces, Check,
} from 'lucide-react';
import { PageHeader, DataTable, Avatar } from '@/components/primitives';
import { Skeleton } from '@/components/ui/skeleton';
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

/**
 * SegmentCard — a selectable audience filter, styled with restraint: neutral surfaces,
 * one systematic dot-matrix texture shared by every card (token-driven, so it works in
 * dark mode), uniform quiet iconography, and the brand accent reserved for state.
 * Reference bar: Stripe / Linear / Attio metric cards — the data is the decoration.
 */
function SegmentCard({ segment, value, active, loading, onClick }) {
  const Icon = segment.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-3.5 text-left transition-all duration-200',
        'hover:border-primary/35 hover:shadow-[0_10px_30px_-14px_rgb(16_24_40/0.18)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-primary/50 bg-gradient-to-br from-primary/[0.045] to-transparent shadow-[0_10px_30px_-14px_rgb(16_24_40/0.18)]'
          : 'border-border'
      )}
    >
      {/* one shared texture: a fine dot matrix fading from the top-right — systematic, not thematic */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-300',
          active ? 'opacity-[0.10]' : 'opacity-[0.05] group-hover:opacity-[0.08]'
        )}
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1.3px)',
          backgroundSize: '13px 13px',
          maskImage: 'radial-gradient(140px 110px at 85% 0%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(140px 110px at 85% 0%, black 30%, transparent 100%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200',
              active
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-border/70 bg-muted/50 text-muted-foreground group-hover:text-foreground/80'
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          {/* radio-style check: these cards filter the table below, so say so */}
          <span
            className={cn(
              'mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200',
              active
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border/80 text-transparent group-hover:border-muted-foreground/40'
            )}
            aria-hidden="true"
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3.4} />
          </span>
        </div>

        {loading ? (
          <Skeleton className="mt-3 h-6 w-12" />
        ) : (
          <p className="mt-3 text-[22px] font-semibold leading-none tracking-tight tabular text-foreground">{value}</p>
        )}
        <p className="mt-1.5 truncate text-[12.5px] font-medium text-foreground">{segment.label}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{segment.hint}</p>
      </div>
    </button>
  );
}

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {SEGMENTS.map((s) => (
          <SegmentCard
            key={s.key}
            segment={s}
            value={counts[countKey[s.key]] ?? 0}
            active={active === s.key}
            loading={isLoading}
            onClick={() => setActive(s.key)}
          />
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

  const hourLabel = (h) => (h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`);
  const schedule = `Daily · after ${hourLabel(s.sendHour ?? 9)}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <AutomationCard
          icon={Cake}
          title="Birthday wishes"
          description="Every day, patients whose birthday it is receive a warm greeting from your clinic — automatically."
          enabled={Boolean(s.birthdayEnabled)}
          schedule={schedule}
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
          schedule={schedule}
          onToggle={(v) => patch({ followupEnabled: v })}
          onRunNow={() => runNow('followup')}
          disabled={!isOwner || update.isPending}
          running={run.isPending}
        />
      </div>

      {/* One cohesive delivery-settings surface instead of scattered cards. */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Campaign delivery</h3>
        <Card className="divide-y">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock3 className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-foreground">Daily send time</p>
                <p className="text-xs text-muted-foreground">Campaigns go out after this hour each day.</p>
              </div>
            </div>
            <select
              value={s.sendHour ?? 9}
              disabled={!isOwner}
              onChange={(e) => patch({ sendHour: Number(e.target.value) })}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium outline-none transition-colors hover:border-border focus:ring-2 focus:ring-ring/30"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><Sparkles className="h-5 w-5" /></span>
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
      </div>

      <ChannelsCard channels={channels} isOwner={isOwner} />
    </div>
  );
}

function AutomationCard({ icon: Icon, title, description, enabled, schedule, onToggle, onRunNow, disabled, running }) {
  return (
    <Card className={cn('flex flex-col p-5 transition-colors', enabled && 'border-primary/20')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
              enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              {title}
              {enabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Paused</span>
              )}
            </p>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} disabled={disabled} aria-label={title} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3.5">
        <span className={cn('inline-flex items-center gap-1.5 text-[11.5px] font-medium', enabled ? 'text-foreground/70' : 'text-muted-foreground/60')}>
          <Clock3 className="h-3.5 w-3.5" />
          {enabled ? schedule : 'Not scheduled'}
        </span>
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
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Delivery channels</h3>
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

  const accent = data?.emailTheme?.accent || 'hsl(var(--primary))';

  return (
    <div className="space-y-6">
      {!ent.templateEditing && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-200/70 bg-gradient-to-r from-amber-50/90 to-transparent p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Lock className="h-4 w-4" /></span>
            <p className="text-xs leading-relaxed text-amber-900">
              You're on the professional default design.{' '}
              <span className="font-semibold">Custom colours, imagery and wording are Premium.</span>
            </p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 border-amber-300 bg-card text-amber-800 hover:bg-amber-100" asChild>
            <Link to="/dashboard/plan">Upgrade</Link>
          </Button>
        </Card>
      )}

      <EmailThemePanel theme={data?.emailTheme} overrides={data?.emailThemeOverrides} canEdit={isOwner && ent.templateEditing} />

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Campaign templates</h3>
          {/* variables legend lives with the templates it serves */}
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <Braces className="h-3.5 w-3.5" />
            {['patient_name', 'clinic_name', 'clinic_phone', 'clinic_address'].map((v) => (
              <code key={v} className="rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-foreground/75">
                {`{{${v}}}`}
              </code>
            ))}
            <span className="ml-0.5">fill in per patient</span>
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {(data?.templates || []).map((t) => {
            const Icon = TEMPLATE_ICON[t.kind] || Send;
            return (
              <Card
                key={t.kind}
                className="group flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_16px_40px_-18px_rgb(16_24_40/0.25)]"
              >
                {/* card chrome: which automation this email belongs to */}
                <div className="flex items-center justify-between gap-2 border-b bg-muted/40 py-2.5 pl-3 pr-3.5">
                  <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{t.label}</span>
                  </span>
                  {t.customized ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">Customized</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">Default design</span>
                  )}
                </div>

                {/* the email itself, framed as the artifact it is */}
                <button
                  type="button"
                  onClick={() => setPreviewing(t)}
                  className="px-4 pt-4 text-left focus-visible:outline-none"
                  aria-label={`Preview ${t.label} email`}
                >
                  <div className="overflow-hidden rounded-lg border shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                    {t.imageSrc ? (
                      <img src={t.imageSrc} alt="" className="h-20 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-9 w-full" style={{ background: accent }} aria-hidden="true" />
                    )}
                    <div className="space-y-1.5 bg-card px-3.5 py-3">
                      <p className="truncate text-[13px] font-semibold leading-snug text-foreground">{t.subject}</p>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
                    </div>
                  </div>
                </button>

                {/* quiet action row — preview is the headline act, the rest stay ghosts */}
                <div className="mt-auto flex items-center gap-0.5 px-2.5 py-2">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewing(t)}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  {isOwner && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!ent.templateEditing}
                        title={ent.templateEditing ? 'Edit this template' : 'Template editing is Premium'}
                        onClick={() => setEditing(t)}
                      >
                        {ent.templateEditing ? <PencilLine className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-muted-foreground hover:text-foreground"
                        onClick={() => setTesting(t.kind)}
                      >
                        <Send className="h-3.5 w-3.5" /> Test
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

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

  // Resolved value per field — draft wins, then saved theme, then a sane fallback.
  const v = (key, fb = '#0f172a') => draft[key] || theme?.[key] || fb;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Palette className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold text-foreground">Email brand</p>
            <p className="text-xs text-muted-foreground">Colours apply to every automated email — birthday, follow-up, re-engagement &amp; reminders.</p>
          </div>
        </div>
        {canEdit && hasOverrides && (
          <Button variant="ghost" size="sm" onClick={reset} disabled={update.isPending}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset defaults
          </Button>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* controls */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            {THEME_FIELDS.map((f) => (
              <div key={f.key}>
                <p className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-foreground">
                  {f.label}
                  <span className="text-[10px] font-normal text-muted-foreground">{f.hint}</span>
                </p>
                <div
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border bg-card p-1.5 transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10',
                    !canEdit && 'opacity-70'
                  )}
                >
                  <label
                    className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border shadow-inner"
                    style={{ background: v(f.key) }}
                  >
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
                    className="w-full bg-transparent font-mono text-xs font-medium uppercase tracking-wide outline-none placeholder:normal-case placeholder:text-muted-foreground/60"
                    placeholder="#hex"
                  />
                </div>
              </div>
            ))}
          </div>
          {canEdit && (
            <div className="mt-5 flex justify-end">
              <Button size="sm" onClick={save} disabled={!dirty || update.isPending}>
                {update.isPending ? 'Saving…' : 'Save colours'}
              </Button>
            </div>
          )}
        </div>

        {/* live preview — repaints as you pick, so colour choices are never abstract */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-foreground">Live preview</p>
          <div className="rounded-2xl border p-3 transition-colors duration-300" style={{ background: v('bg', '#f1f5f9') }}>
            <div className="overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_-12px_rgb(16_24_40/0.25)]">
              <div className="h-10 transition-colors duration-300" style={{ background: v('accent', '#2563eb') }} />
              <div className="space-y-2 px-4 py-3.5">
                <p className="text-[13px] font-bold leading-snug transition-colors duration-300" style={{ color: v('heading') }}>
                  Happy birthday, Priya! 🎉
                </p>
                <p className="text-[10.5px] leading-relaxed transition-colors duration-300" style={{ color: v('text', '#475569') }}>
                  Everyone at your clinic wishes you a wonderful year ahead — this one's from all of us.
                </p>
                <span
                  className="inline-block rounded-lg px-3 py-1.5 text-[10px] font-bold text-white transition-colors duration-300"
                  style={{ background: v('accent', '#2563eb') }}
                >
                  Book a visit
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
