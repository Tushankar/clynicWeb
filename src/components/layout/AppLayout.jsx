import { useEffect, useState } from 'react';
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

  // Liquid-glass specular tracking: one delegated, rAF-throttled listener moves the
  // sheen (--gx/--gy consumed by .glass-card::after) across whichever pane the pointer
  // is over — this is what makes the glass feel liquid rather than frosted.
  useEffect(() => {
    let raf = 0;
    const onMove = (e) => {
      if (!(e.target instanceof Element)) return;
      const el = e.target.closest('.glass-card');
      if (!el || raf) return;
      const { clientX, clientY } = e;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--gx', `${(((clientX - r.left) / r.width) * 100).toFixed(2)}%`);
        el.style.setProperty('--gy', `${(((clientY - r.top) / r.height) * 100).toFixed(2)}%`);
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <BranchProvider>
        <div className="flex min-h-screen bg-background">
          {/* Desktop sidebar */}
          <aside className="hidden w-[260px] shrink-0 border-r bg-card lg:block">
            <div className="sticky top-0 h-screen">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile slide-over */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-[260px] border-r bg-card shadow-xl">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <div className="relative flex min-w-0 flex-1 flex-col">
            {/* Ambient wave artwork behind the content area — sheer in light, faint in dark. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[url('/dashboard-waves.svg')] bg-cover bg-fixed bg-center opacity-80 dark:opacity-[0.22]"
            />
            <TopBar onMenu={() => setMobileOpen(true)} />
            <main className="relative mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>
        </BranchProvider>
      </SignedIn>
    </>
  );
}
