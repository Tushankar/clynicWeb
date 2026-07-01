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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/"
          afterCreateOrganizationUrl="/"
          afterLeaveOrganizationUrl="/"
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
