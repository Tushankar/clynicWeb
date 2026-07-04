import { Loader2, Phone, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { PmxStyles } from '@/components/site/templates/premium-signature/styles';
import { cn } from '@/lib/utils';

/**
 * Shared chrome for patient link pages (§5.20+): manage / pay / review / document /
 * check-in. Premium-signature language — porcelain canvas, slim glass header with the
 * clinic identity, and a quiet trust footer. Deliberately focused: these pages exist
 * to complete ONE task, so no site navigation.
 */

export function LinkShell({ clinic, badge, children, wide = false }) {
  const tel = (clinic?.phone || '').replace(/[^+\d]/g, '');
  return (
    <div className="pmx min-h-screen bg-[#F8FAFC] text-[#0B1220]">
      <PmxStyles />
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {clinic?.logoUrl ? (
              <img src={clinic.logoUrl} alt="" className="h-8 w-auto object-contain" />
            ) : (
              <span className="pmx-display truncate text-[17px] font-semibold tracking-tight text-[#0A1B3A]">
                {clinic?.name || 'Clinic'}
              </span>
            )}
            {badge && (
              <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 sm:inline-block">
                {badge}
              </span>
            )}
          </div>
          {tel && (
            <a
              href={`tel:${tel}`}
              className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-emerald-500/40 hover:text-[#0A1B3A]"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span className="hidden sm:inline">{clinic.phone}</span>
              <span className="sm:hidden">Call</span>
            </a>
          )}
        </div>
      </header>

      <main className={cn('mx-auto px-4 pb-16 pt-8 sm:px-6 sm:pt-10', wide ? 'max-w-4xl' : 'max-w-2xl')}>{children}</main>

      <footer className="border-t border-slate-200/70 py-6">
        <p className="flex items-center justify-center gap-1.5 text-[12px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/70" aria-hidden="true" />
          Secure link · Powered by
          <Logo className="h-4 w-auto opacity-70 grayscale" />
        </p>
      </footer>
    </div>
  );
}

export function LinkSplash() {
  return (
    <div className="pmx flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <PmxStyles />
      <div className="flex flex-col items-center gap-3">
        <Logo className="h-10 animate-pulse" />
        <Loader2 className="h-5 w-5 animate-spin text-slate-300" aria-hidden="true" />
      </div>
    </div>
  );
}

export function LinkError({ title = 'This link is no longer valid', message }) {
  return (
    <div className="pmx flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <PmxStyles />
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-8 text-center shadow-[0_24px_60px_-24px_rgba(10,27,58,0.18)]">
        <Logo className="mx-auto h-8" />
        <h1 className="pmx-display mt-6 text-xl font-semibold tracking-tight text-[#0A1B3A]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {message || 'The link may have expired or already been used. Please contact the clinic if you need help.'}
        </p>
      </div>
    </div>
  );
}

/** Navy ticket panel used across manage/pay — the signature surface of these pages. */
export function TicketPanel({ children, className }) {
  return (
    <section
      className={cn(
        'pmx-dark relative overflow-hidden rounded-[28px] bg-[#0A1B3A] p-6 text-white shadow-[0_32px_80px_-28px_rgba(10,27,58,0.55)] sm:p-8',
        className
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}
