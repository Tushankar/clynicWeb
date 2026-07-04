import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  House, CalendarCheck, Stethoscope, Users, ListChecks, UserPlus, Receipt, Handshake,
  ChartLineUp, Sparkle, Globe, ChatCircle, Buildings, Gear, ShieldStar, LockSimple,
  CaretUpDown, Sun, Moon, PaperPlaneTilt, CalendarSlash,
} from '@phosphor-icons/react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { usePlan } from '@/hooks/usePlan';
import { useMe } from '@/hooks/useMe';
import { useIsSuperAdmin } from '@/hooks/useAdmin';

// Grouped, role-filtered, plan-gated navigation (Stripe/Linear-style). Icons are Phosphor:
// light `regular` outline when inactive, solid `fill` + a tiny left accent bar when active.
export const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: House, roles: ['owner', 'doctor', 'receptionist'], end: true },
      { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarCheck, roles: ['owner', 'receptionist'] },
      { to: '/dashboard/time-off', label: 'Time Off', icon: CalendarSlash, roles: ['owner', 'receptionist'], feature: 'AVAILABILITY_BLOCKS' },
      { to: '/dashboard/doctors', label: 'Doctors', icon: Stethoscope, roles: ['owner', 'doctor', 'receptionist'] },
      { to: '/dashboard/patients', label: 'Patients', icon: Users, roles: ['owner', 'doctor', 'receptionist'] },
    ],
  },
  {
    label: 'Queue',
    items: [
      { to: '/dashboard/queue', label: 'Live Queue', icon: ListChecks, roles: ['owner', 'doctor', 'receptionist'] },
      { to: '/dashboard/walk-ins', label: 'Walk-ins', icon: UserPlus, roles: ['owner', 'receptionist'] },
      { to: '/dashboard/billing', label: 'Billing', icon: Receipt, roles: ['owner', 'receptionist'], feature: 'BILLING' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/dashboard/crm', label: 'CRM', icon: Handshake, roles: ['owner', 'receptionist'], feature: 'CRM' },
      { to: '/dashboard/communications', label: 'Communications', icon: PaperPlaneTilt, roles: ['owner', 'receptionist'] },
      { to: '/dashboard/analytics', label: 'Analytics', icon: ChartLineUp, roles: ['owner'], feature: 'ANALYTICS' },
      { to: '/dashboard/ai', label: 'AI Assistant', icon: Sparkle, roles: ['owner', 'doctor', 'receptionist'], feature: 'AI_FEATURES' },
      { to: '/dashboard/website', label: 'Website', icon: Globe, roles: ['owner'], feature: 'WEBSITE_LIVE' },
      { to: '/dashboard/messages', label: 'Messages', icon: ChatCircle, roles: ['owner', 'doctor', 'receptionist'], feature: 'INTERNAL_CHAT' },
      { to: '/dashboard/branches', label: 'Branches', icon: Buildings, roles: ['owner'], feature: 'MULTI_BRANCH' },
      { to: '/dashboard/settings', label: 'Settings', icon: Gear, roles: ['owner'] },
    ],
  },
];

// Flat list (used by e.g. the command palette / search).
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const APP_VERSION = 'v4.0';

function ThemeToggle() {
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
    setDark(next);
  };
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
      {dark ? <Sun weight="fill" className="h-4 w-4" /> : <Moon weight="regular" className="h-4 w-4" />}
    </button>
  );
}

function NavItem({ item, locked, onNavigate }) {
  if (locked) {
    return (
      <div aria-disabled="true" title="Upgrade to unlock" className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50">
        <item.icon weight="regular" className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1">{item.label}</span>
        <LockSimple weight="fill" className="h-3.5 w-3.5" />
      </div>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive ? 'bg-accent font-semibold text-accent-foreground' : 'font-medium text-foreground hover:bg-muted'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
          <item.icon weight={isActive ? 'fill' : 'regular'} className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }) {
  const { role } = useRole();
  const { data: plan, isLoading: planLoading } = usePlan();
  const features = plan?.features || {};
  const isSuperAdmin = useIsSuperAdmin().data?.isSuperAdmin;
  const clinic = useMe().data?.clinic;
  const planTier = clinic?.subscriptionPlan ? `${clinic.subscriptionPlan[0].toUpperCase()}${clinic.subscriptionPlan.slice(1)}` : null;

  const groups = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !role || i.roles.includes(role)) })).filter((g) => g.items.length);

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-5">
        <Logo className="h-8" />
      </div>

      {/* Clinic switcher */}
      <div className="px-3 pt-3">
        <div className="flex items-center gap-2.5 rounded-xl border bg-background px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Buildings weight="duotone" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{clinic?.name || 'Your clinic'}</p>
            <p className="truncate text-xs text-muted-foreground">{clinic?.address || 'Set clinic address'}</p>
          </div>
          <CaretUpDown weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>

      {/* Grouped navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} onNavigate={onNavigate} locked={!planLoading && item.feature && !features[item.feature]} />
              ))}
              {group.label === 'Management' && isSuperAdmin && (
                <NavLink
                  to="/dashboard/admin"
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn('group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors', isActive ? 'bg-accent font-semibold text-accent-foreground' : 'font-medium text-foreground hover:bg-muted')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
                      <ShieldStar weight={isActive ? 'fill' : 'regular'} className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 truncate">Platform</span>
                    </>
                  )}
                </NavLink>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Subscription card */}
      {role === 'owner' && (
        <div className="px-3 pb-2">
          <Link to="/dashboard/plan" onClick={onNavigate} className="block rounded-xl border bg-background p-3 transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Current plan</span>
              <span className="text-[11px] font-medium text-primary">Manage</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{planTier ? `${planTier} plan` : 'Free plan'}</p>
          </Link>
        </div>
      )}

      {/* Footer: role, version, theme */}
      <div className="flex items-center justify-between border-t px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          Clynic <span className="tabular">{APP_VERSION}</span>
          {role && <span className="ml-2 capitalize text-muted-foreground/70">· {role}</span>}
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
