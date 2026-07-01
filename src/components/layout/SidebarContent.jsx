import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ListChecks, Users, Stethoscope, HeartPulse, MessageSquare, Receipt, CreditCard, ShieldAlert, Lock, Building2, HeartHandshake, BarChart3, Sparkles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { usePlan } from '@/hooks/usePlan';
import { useIsSuperAdmin } from '@/hooks/useAdmin';

// Nav is filtered by role (8.5) and gated by plan feature. Locked items render
// disabled with a lock so staff can see what an upgrade unlocks (Rule 5 UI side).
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'doctor', 'receptionist'], end: true },
  { to: '/doctor', label: 'Doctor', icon: HeartPulse, roles: ['owner', 'doctor'], feature: 'DOCTOR_DASHBOARD' },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, roles: ['owner', 'receptionist'] },
  { to: '/queue', label: 'Live queue', icon: ListChecks, roles: ['owner', 'doctor', 'receptionist'] },
  { to: '/patients', label: 'Patients', icon: Users, roles: ['owner', 'doctor', 'receptionist'] },
  { to: '/billing', label: 'Billing', icon: Receipt, roles: ['owner', 'receptionist'], feature: 'BILLING' },
  { to: '/crm', label: 'CRM', icon: HeartHandshake, roles: ['owner', 'receptionist'], feature: 'CRM' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['owner'], feature: 'ANALYTICS' },
  { to: '/ai', label: 'AI assistant', icon: Sparkles, roles: ['owner', 'doctor', 'receptionist'], feature: 'AI_FEATURES' },
  { to: '/website', label: 'Website', icon: Globe, roles: ['owner'], feature: 'WEBSITE_BUILDER' },
  { to: '/messages', label: 'Messages', icon: MessageSquare, roles: ['owner', 'doctor', 'receptionist'], feature: 'INTERNAL_CHAT' },
  { to: '/branches', label: 'Branches', icon: Building2, roles: ['owner'], feature: 'MULTI_BRANCH' },
  { to: '/plan', label: 'Plan', icon: CreditCard, roles: ['owner'] },
];

export function SidebarContent({ onNavigate }) {
  const { role } = useRole();
  const { data: plan, isLoading: planLoading } = usePlan();
  const features = plan?.features || {};
  const isSuperAdmin = useIsSuperAdmin().data?.isSuperAdmin;
  const items = NAV_ITEMS.filter((i) => !role || i.roles.includes(role));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Stethoscope className="h-5 w-5 text-primary" />
        <span className="font-semibold tracking-tight">Clinic OS</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          // While the plan is loading, don't flash entitled items as locked.
          const locked = !planLoading && item.feature && !features[item.feature];
          if (locked) {
            return (
              <div
                key={item.to}
                aria-disabled="true"
                title="Upgrade to unlock"
                className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                <Lock className="ml-auto h-3.5 w-3.5" />
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
        {isSuperAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors', isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')
            }
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Platform
          </NavLink>
        )}
      </nav>
      <div className="border-t px-5 py-3 text-caption text-muted-foreground">
        {role ? <span className="capitalize">{role}</span> : 'No role'}
      </div>
    </div>
  );
}
