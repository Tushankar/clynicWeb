import { OrganizationSwitcher, UserButton } from '@clerk/clerk-react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/GlobalSearch';
import { NotificationBell } from '@/components/NotificationBell';
import { BranchSwitcher } from './BranchSwitcher';

/**
 * Top bar — mobile menu, Clerk OrganizationSwitcher (active org = active clinic),
 * universal search (plan-gated), notification bell (plan-gated), and the user menu.
 */
export function TopBar({ onMenu }) {
  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/50 bg-card/60 px-4 dark:border-white/10 dark:bg-card/50 sm:px-6"
      style={{ backdropFilter: 'blur(22px) saturate(1.9) brightness(1.03)', WebkitBackdropFilter: 'blur(22px) saturate(1.9) brightness(1.03)' }}
    >
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
          afterLeaveOrganizationUrl="/dashboard"
          appearance={{ elements: { rootBox: 'flex items-center' } }}
        />
        <BranchSwitcher />
      </div>

      <div className="hidden flex-1 justify-center sm:flex">
        <GlobalSearch />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <NotificationBell />
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
