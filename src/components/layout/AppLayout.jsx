import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { SidebarContent } from './SidebarContent';
import { TopBar } from './TopBar';
import { BranchProvider } from '@/context/BranchContext';

/**
 * Authenticated app shell: persistent sidebar (desktop) + slide-over (mobile),
 * top bar, and a max-width content area with consistent padding (section 8.5).
 */
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <BranchProvider>
        <div className="flex min-h-screen bg-background">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
            <div className="sticky top-0 h-screen">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile slide-over */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-64 border-r bg-card shadow-xl">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar onMenu={() => setMobileOpen(true)} />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>
        </BranchProvider>
      </SignedIn>
    </>
  );
}
