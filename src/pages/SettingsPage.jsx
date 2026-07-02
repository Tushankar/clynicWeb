import { Link } from 'react-router-dom';
import { CreditCard, Buildings, Globe, Users, CaretRight, MapPin, Phone } from '@phosphor-icons/react';
import { PageHeader } from '@/components/primitives';
import { Card } from '@/components/ui/card';
import { useMe } from '@/hooks/useMe';

const LINKS = [
  { to: '/dashboard/plan', icon: CreditCard, title: 'Plan & Billing', desc: 'Manage your subscription, invoices, and payment method.' },
  { to: '/dashboard/branches', icon: Buildings, title: 'Branches', desc: 'Add and manage your clinic locations.' },
  { to: '/dashboard/website', icon: Globe, title: 'Public website', desc: 'Edit your clinic’s public site and booking page.' },
  { to: '/dashboard/doctors', icon: Users, title: 'Doctors', desc: 'Manage practitioners and consultation fees.' },
];

export default function SettingsPage() {
  const clinic = useMe().data?.clinic;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your clinic profile and configuration." />

      <Card className="card-lift p-6">
        <h3 className="text-[15px] font-semibold">Clinic profile</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Clinic name" value={clinic?.name} />
          <Field label="Address" value={clinic?.address} icon={MapPin} />
          <Field label="Phone" value={clinic?.phone} icon={Phone} />
        </div>
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
    </div>
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
