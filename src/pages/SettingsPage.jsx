import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganizationProfile } from '@clerk/clerk-react';
import {
  Buildings, Image as ImageIcon, UsersThree, SquaresFour, ClockCounterClockwise, DownloadSimple,
  CreditCard, Globe, Stethoscope, MapPin, Phone, Check, ShieldCheck, ArrowSquareOut, FloppyDisk,
  Info, CaretRight, IdentificationBadge, Warning,
} from '@phosphor-icons/react';
import { PageHeader, DataTable } from '@/components/primitives';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useMe, useUpdateClinic, useActivityLog } from '@/hooks/useMe';
import { useHasRole } from '@/hooks/useRole';
import { useFeature } from '@/hooks/usePlan';
import { useExportCsv } from '@/hooks/useExport';
import { fmtDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast, toastApiError } from '@/lib/toast';

/**
 * Settings — a professional, sectioned workspace-settings surface (Stripe/Linear pattern):
 * a sticky section rail on desktop, horizontal pills on mobile. The owner (clinic admin)
 * gets real controls here — profile, branding, team & roles, activity log, and data export;
 * other staff see a read-only subset.
 */

const SECTIONS = [
  { id: 'general', label: 'General', icon: Buildings, desc: 'Clinic profile' },
  { id: 'branding', label: 'Branding', icon: ImageIcon, desc: 'Logo & identity' },
  { id: 'team', label: 'Team & roles', icon: UsersThree, desc: 'Staff and access' },
  { id: 'workspace', label: 'Workspace', icon: SquaresFour, desc: 'Plan, branches, site' },
  { id: 'activity', label: 'Activity log', icon: ClockCounterClockwise, desc: 'Who changed what', ownerOnly: true },
  { id: 'data', label: 'Data & export', icon: DownloadSimple, desc: 'Export your records', ownerOnly: true },
];

export default function SettingsPage() {
  const me = useMe().data;
  const clinic = me?.clinic;
  const isOwner = useHasRole('owner');
  const [active, setActive] = useState('general');

  const sections = useMemo(() => SECTIONS.filter((s) => !s.ownerOnly || isOwner), [isOwner]);
  const planTier = clinic?.subscriptionPlan
    ? `${clinic.subscriptionPlan[0].toUpperCase()}${clinic.subscriptionPlan.slice(1)}`
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your clinic profile, team, and workspace configuration."
        actions={
          <div className="flex items-center gap-2">
            {planTier && (
              <Link to="/dashboard/plan">
                <Badge variant="secondary" className="gap-1.5">
                  <CreditCard weight="fill" className="h-3.5 w-3.5" /> {planTier} plan
                </Badge>
              </Link>
            )}
            {clinic?.slug && (
              <Button variant="outline" size="sm" onClick={() => window.open(`/c/${clinic.slug}`, '_blank', 'noopener')}>
                <ArrowSquareOut weight="bold" className="h-4 w-4" /> View site
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[224px_1fr]">
        {/* Section rail (desktop) / pills (mobile) */}
        <nav className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {sections.map((s) => {
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={cn(
                    'group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors lg:w-full',
                    on ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'
                  )}
                >
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', on ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground group-hover:text-foreground')}>
                    <s.icon weight={on ? 'fill' : 'regular'} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">{s.label}</span>
                    <span className="hidden truncate text-[11.5px] text-muted-foreground lg:block">{s.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Panel */}
        <div className="min-w-0">
          {active === 'general' && <GeneralSection clinic={clinic} isOwner={isOwner} />}
          {active === 'branding' && <BrandingSection clinic={clinic} isOwner={isOwner} />}
          {active === 'team' && <TeamSection isOwner={isOwner} />}
          {active === 'workspace' && <WorkspaceSection />}
          {active === 'activity' && isOwner && <ActivitySection currentUserId={me?.userId} />}
          {active === 'data' && isOwner && <DataSection />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ shared bits ------------------------------ */

function SectionHead({ icon: Icon, title, desc, right }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon weight="duotone" className="h-5 w-5" />
          </span>
        )}
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {desc && <p className="mt-0.5 max-w-lg text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function LabeledInput({ label, hint, ...props }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input {...props} />
      {hint && <span className="block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

/* ------------------------------ General ------------------------------ */

function GeneralSection({ clinic, isOwner }) {
  const update = useUpdateClinic();
  const [form, setForm] = useState({ name: '', address: '', phone: '', gstNumber: '' });

  useEffect(() => {
    setForm({ name: clinic?.name || '', address: clinic?.address || '', phone: clinic?.phone || '', gstNumber: clinic?.gstNumber || '' });
  }, [clinic]);

  const dirty =
    form.name !== (clinic?.name || '') ||
    form.address !== (clinic?.address || '') ||
    form.phone !== (clinic?.phone || '') ||
    form.gstNumber !== (clinic?.gstNumber || '');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return toast.error('Clinic name is required');
    try {
      await update.mutateAsync(form);
      toast.success('Clinic profile updated');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Card className="p-6">
      <SectionHead icon={Buildings} title="Clinic profile" desc="Your name, address, and phone appear on your public website, reminders, and printed invoices." />
      {!isOwner ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ReadField label="Clinic name" value={clinic?.name} />
          <ReadField label="Phone" value={clinic?.phone} icon={Phone} />
          <ReadField label="Address" value={clinic?.address} icon={MapPin} />
          <ReadField label="GST number" value={clinic?.gstNumber} />
          <p className="sm:col-span-2 text-xs text-muted-foreground">Only the clinic owner can edit these details.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <LabeledInput label="Clinic name" value={form.name} onChange={set('name')} placeholder="e.g. Clynic Dental Care" />
            <LabeledInput label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 98300 00000" />
            <div className="sm:col-span-2">
              <LabeledInput label="Address" value={form.address} onChange={set('address')} placeholder="12 Park Street, Kolkata 700016" hint="Shown on your public website’s contact section and on invoices." />
            </div>
            <LabeledInput label="GST number" value={form.gstNumber} onChange={set('gstNumber')} placeholder="Optional — shown on tax invoices" />
          </div>
          {!clinic?.address && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <Info weight="fill" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Add your clinic address so patients can find you — it appears on your public website’s contact section.
            </p>
          )}
          <div className="mt-5 flex items-center justify-end gap-3 border-t pt-4">
            {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            <Button onClick={save} disabled={!dirty || update.isPending}>
              <FloppyDisk weight="bold" className="h-4 w-4" /> {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function ReadField({ label, value, icon: Icon }) {
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

/* ------------------------------ Branding ------------------------------ */

function BrandingSection({ clinic, isOwner }) {
  const update = useUpdateClinic();
  const [logoUrl, setLogoUrl] = useState('');
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setLogoUrl(clinic?.logoUrl || '');
    setBroken(false);
  }, [clinic]);

  const dirty = logoUrl.trim() !== (clinic?.logoUrl || '');
  const valid = !logoUrl.trim() || /^https?:\/\//i.test(logoUrl.trim());

  const save = async () => {
    if (!valid) return toast.error('Logo must be a hosted http(s) image URL');
    try {
      await update.mutateAsync({ logoUrl: logoUrl.trim() });
      toast.success(logoUrl.trim() ? 'Logo updated' : 'Logo removed');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Card className="p-6">
      <SectionHead icon={ImageIcon} title="Logo & branding" desc="Your logo appears on your public website, patient emails, and shared documents. Use a hosted image URL (PNG or SVG on a transparent background works best)." />

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_260px]">
        {isOwner ? (
          <div className="space-y-4">
            <LabeledInput
              label="Logo image URL"
              value={logoUrl}
              onChange={(e) => { setLogoUrl(e.target.value); setBroken(false); }}
              placeholder="https://…/logo.png"
              hint="Leave empty to use the Clynic wordmark. Host the image anywhere public (e.g. your website, an S3 bucket)."
            />
            {!valid && <p className="text-xs text-destructive">Enter a full http(s) URL.</p>}
            <div className="flex items-center justify-end gap-3 border-t pt-4">
              {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
              <Button onClick={save} disabled={!dirty || !valid || update.isPending}>
                <FloppyDisk weight="bold" className="h-4 w-4" /> {update.isPending ? 'Saving…' : 'Save logo'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Only the clinic owner can change the logo.</p>
        )}

        {/* Live preview */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Preview</p>
          <div className="flex h-32 items-center justify-center rounded-xl border bg-muted/30 p-4">
            {logoUrl.trim() && !broken ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img src={logoUrl.trim()} alt="Clinic logo preview" className="max-h-full max-w-full object-contain" onError={() => setBroken(true)} />
            ) : broken ? (
              <span className="flex flex-col items-center gap-1 text-center text-xs text-destructive">
                <Warning weight="fill" className="h-5 w-5" /> Couldn’t load that image
              </span>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{clinic?.name || 'Your clinic'}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/80">Shown on the website header, emails, and documents.</p>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------ Team & roles ------------------------------ */

const ROLE_LEGEND = [
  { role: 'Owner', tone: 'bg-primary/10 text-primary', desc: 'Full access — settings, billing, analytics, team, and all clinical & front-desk tools.' },
  { role: 'Doctor', tone: 'bg-info/10 text-info', desc: 'Clinical tools — dashboard, patient charts, prescriptions, notes, and the live queue.' },
  { role: 'Receptionist', tone: 'bg-success/10 text-success', desc: 'Front desk — appointments, walk-ins, time off, billing, queue, and CRM.' },
];

function TeamSection({ isOwner }) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionHead icon={IdentificationBadge} title="Roles & access" desc="Every staff member has one role. Assign roles when you invite them below." />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {ROLE_LEGEND.map((r) => (
            <div key={r.role} className="rounded-xl border bg-card/60 p-4">
              <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', r.tone)}>{r.role}</span>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b p-6 pb-4">
          <SectionHead
            icon={UsersThree}
            title="Team members"
            desc={isOwner ? 'Invite staff, assign or change their role, and remove access. Invited members receive a secure email to set up their login.' : 'Your clinic’s team. Only the owner can invite or change roles.'}
          />
        </div>
        <div className="clerk-org-embed p-2 sm:p-4">
          <OrganizationProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'w-full shadow-none border-0 bg-transparent',
                navbar: 'hidden',
                navbarMobileMenuRow: 'hidden',
                pageScrollBox: 'p-0',
                scrollBox: 'bg-transparent',
              },
            }}
          />
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------ Workspace ------------------------------ */

const WORKSPACE_LINKS = [
  { to: '/dashboard/plan', icon: CreditCard, title: 'Plan & billing', desc: 'Subscription, invoices, and payment method.' },
  { to: '/dashboard/branches', icon: Buildings, title: 'Branches', desc: 'Add and manage clinic locations.' },
  { to: '/dashboard/doctors', icon: Stethoscope, title: 'Doctors', desc: 'Practitioners, availability, and fees.' },
  { to: '/dashboard/website', icon: Globe, title: 'Public website', desc: 'Edit your site and booking page.' },
  { to: '/dashboard/time-off', icon: ClockCounterClockwise, title: 'Time off', desc: 'Doctor leave and clinic holidays.' },
  { to: '/dashboard/communications', icon: IdentificationBadge, title: 'Communications', desc: 'The full outbound message log.' },
];

function WorkspaceSection() {
  return (
    <Card className="p-6">
      <SectionHead icon={SquaresFour} title="Workspace" desc="Jump to the areas that configure how your clinic runs." />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {WORKSPACE_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="group">
            <div className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <l.icon weight="duotone" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{l.title}</p>
                <p className="truncate text-xs text-muted-foreground">{l.desc}</p>
              </div>
              <CaretRight weight="bold" className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------ Activity log ------------------------------ */

const ACTION_META = {
  create: { label: 'Created', cls: 'bg-success/10 text-success' },
  update: { label: 'Updated', cls: 'bg-info/10 text-info' },
  delete: { label: 'Deleted', cls: 'bg-destructive/10 text-destructive' },
  read: { label: 'Viewed', cls: 'bg-muted text-muted-foreground' },
};

function ActivitySection({ currentUserId }) {
  const { data, isLoading, isError, error, refetch } = useActivityLog({ limit: 80 });
  const items = data?.items || [];

  const columns = [
    { key: 'action', header: 'Action', render: (r) => {
      const m = ACTION_META[r.action] || ACTION_META.read;
      return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', m.cls)}>{m.label}</span>;
    } },
    { key: 'entity', header: 'Record', render: (r) => <span className="font-medium text-foreground">{r.entityType}</span> },
    { key: 'who', header: 'By', render: (r) => (
      <span className="flex items-center gap-2">
        <span className={cn('font-medium', r.actorKind === 'system' ? 'text-muted-foreground' : 'text-foreground')}>{r.actorName}</span>
        {r.actorId && currentUserId && r.actorId === currentUserId && (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">You</span>
        )}
      </span>
    ) },
    { key: 'when', header: 'When', align: 'right', render: (r) => <span className="whitespace-nowrap text-muted-foreground">{fmtDateTime(r.at)}</span> },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <SectionHead
          icon={ClockCounterClockwise}
          title="Activity log"
          desc="An append-only record of every change across your clinic — who did what, and when. Owner-only, and it never shows patient details."
        />
      </Card>
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        defaultPageSize={25}
        empty={{ icon: ClockCounterClockwise, title: 'No activity yet', description: 'Changes to patients, appointments, invoices and settings will appear here.' }}
      />
    </div>
  );
}

/* ------------------------------ Data & export ------------------------------ */

const EXPORTS = [
  { entity: 'patients', title: 'Patients', desc: 'Every patient record with visit history.' },
  { entity: 'appointments', title: 'Appointments', desc: 'All appointments with status and source.' },
  { entity: 'invoices', title: 'Invoices', desc: 'Billing with totals, payments, and dues.' },
  { entity: 'expenses', title: 'Expenses', desc: 'Recorded clinic expenses.', feature: 'EXPENSES' },
];

function DataSection() {
  const hasExport = useFeature('DATA_EXPORT');
  const hasExpenses = useFeature('EXPENSES');
  const exportCsv = useExportCsv();
  const [pending, setPending] = useState(null);

  const run = async (entity) => {
    setPending(entity);
    try {
      await exportCsv.mutateAsync({ entity });
      toast.success(`${entity[0].toUpperCase()}${entity.slice(1)} exported`);
    } catch (e) {
      toastApiError(e);
    } finally {
      setPending(null);
    }
  };

  return (
    <Card className="p-6">
      <SectionHead icon={DownloadSimple} title="Data & export" desc="Your data is yours. Download it any time as CSV — opens cleanly in Excel or Google Sheets." />

      {!hasExport ? (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-dashed p-5">
          <p className="text-sm text-muted-foreground">CSV export is available on the Standard and Premium plans.</p>
          <Link to="/dashboard/plan"><Button size="sm">Upgrade</Button></Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {EXPORTS.filter((x) => !x.feature || (x.feature === 'EXPENSES' && hasExpenses)).map((x) => (
            <div key={x.entity} className="flex items-center gap-4 rounded-xl border p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DownloadSimple weight="duotone" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{x.title}</p>
                <p className="truncate text-xs text-muted-foreground">{x.desc}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => run(x.entity)} disabled={pending === x.entity}>
                {pending === x.entity ? 'Exporting…' : 'CSV'}
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck weight="fill" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
        Exports are owner-only and clinic-scoped. Deleted records are excluded. Handle downloaded files per your local patient-data rules.
      </p>
    </Card>
  );
}
