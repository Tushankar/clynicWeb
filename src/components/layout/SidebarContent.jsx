import { NavLink } from 'react-router-dom';
import {
  House, Stethoscope, CalendarCheck, ListChecks, Users, Receipt, Handshake,
  ChartLineUp, Sparkle, Globe, ChatCircle, Buildings, CreditCard, ShieldStar, LockSimple,
} from '@phosphor-icons/react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { usePlan } from '@/hooks/usePlan';
import { useIsSuperAdmin } from '@/hooks/useAdmin';

// Nav is filtered by role (8.5) and gated by plan feature. Locked items render
// disabled with a lock so staff can see what an upgrade unlocks (Rule 5 UI side).
// Icons are Phosphor: they render as a light `regular` outline when inactive and a
// solid `fill` in the brand color when active — the premium dashboard pattern (Stripe/iOS).
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: House, roles: ['owner', 'doctor', 'receptionist'], end: true },
  { to: '/dashboard/doctor', label: 'Doctor', icon: Stethoscope, roles: ['owner', 'doctor'], feature: 'DOCTOR_DASHBOARD' },
  { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarCheck, roles: ['owner', 'receptionist'] },
  { to: '/dashboard/queue', label: 'Live queue', icon: ListChecks, roles: ['owner', 'doctor', 'receptionist'] },
  { to: '/dashboard/patients', label: 'Patients', icon: Users, roles: ['owner', 'doctor', 'receptionist'] },
  { to: '/dashboard/billing', label: 'Billing', icon: Receipt, roles: ['owner', 'receptionist'], feature: 'BILLING' },
  { to: '/dashboard/crm', label: 'CRM', icon: Handshake, roles: ['owner', 'receptionist'], feature: 'CRM' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: ChartLineUp, roles: ['owner'], feature: 'ANALYTICS' },
  { to: '/dashboard/ai', label: 'AI assistant', icon: Sparkle, roles: ['owner', 'doctor', 'receptionist'], feature: 'AI_FEATURES' },
  { to: '/dashboard/website', label: 'Website', icon: Globe, roles: ['owner'], feature: 'WEBSITE_LIVE' },
  { to: '/dashboard/messages', label: 'Messages', icon: ChatCircle, roles: ['owner', 'doctor', 'receptionist'], feature: 'INTERNAL_CHAT' },
  { to: '/dashboard/branches', label: 'Branches', icon: Buildings, roles: ['owner'], feature: 'MULTI_BRANCH' },
  { to: '/dashboard/plan', label: 'Plan', icon: CreditCard, roles: ['owner'] },
];

const ITEM_BASE = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors';
const linkClass = ({ isActive }) =>
  cn(ITEM_BASE, isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground');

export function SidebarContent({ onNavigate }) {
  const { role } = useRole();
  const { data: plan, isLoading: planLoading } = usePlan();
  const features = plan?.features || {};
  const isSuperAdmin = useIsSuperAdmin().data?.isSuperAdmin;
  const items = NAV_ITEMS.filter((i) => !role || i.roles.includes(role));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Logo className="h-8" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          // While the plan is loading, don't flash entitled items as locked.
          const locked = !planLoading && item.feature && !features[item.feature];
          if (locked) {
            return (
              <div
                key={item.to}
                aria-disabled="true"
                title="Upgrade to unlock"
                className={cn(ITEM_BASE, 'cursor-not-allowed text-muted-foreground/60')}
              >
                <item.icon weight="regular" className="h-[18px] w-[18px] shrink-0" />
                {item.label}
                <LockSimple weight="fill" className="ml-auto h-3.5 w-3.5" />
              </div>
            );
          }
          return (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={linkClass}>
              {({ isActive }) => (
                <>
                  <item.icon weight={isActive ? 'fill' : 'regular'} className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
        {isSuperAdmin && (
          <NavLink to="/dashboard/admin" onClick={onNavigate} className={linkClass}>
            {({ isActive }) => (
              <>
                <ShieldStar weight={isActive ? 'fill' : 'regular'} className="h-[18px] w-[18px] shrink-0" />
                Platform
              </>
            )}
          </NavLink>
        )}
      </nav>
      <div className="border-t px-5 py-3 text-caption text-muted-foreground">
        {role ? <span className="capitalize">{role}</span> : 'No role'}
      </div>
    </div>
  );
}
