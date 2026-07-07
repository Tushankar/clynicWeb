/**
 * Navbar — Clean healthcare nav matching the reference exactly.
 * White background, full link set, glassmorphic Book Appointment button.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarPlus, Menu, X, Fingerprint } from 'lucide-react';
import { cx } from '../lib';
import { EASE } from '../motion';

const TEAL = '#0A6A56';
const TEAL_DARK = '#074C3D';

export default function Navbar({ m, basePath = '', solid = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const Anchor = ({ href, className, onClick, children }) =>
    basePath ? (
      <Link to={`${basePath}${href}`} className={className} onClick={onClick}>{children}</Link>
    ) : (
      <a href={href} className={className} onClick={onClick}>{children}</a>
    );

  const NAV_LINKS = [
    { label: 'Home', href: '#top', active: true },
    { label: 'Services', href: '#services' },
    { label: 'Doctors', href: '#doctors' },
    { label: 'Pharmacy', href: '#pharmacy' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#stories' },
    { label: 'Contact', href: '#contact' },
  ];

  const showSolid = solid || scrolled;

  return (
    <>
      <motion.header
        initial={reduced ? false : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300 select-none"
      >
        <div className={cx(
          "w-full border-b transition-all duration-500",
          showSolid 
            ? "bg-white/45 border-slate-200/30 shadow-[0_10px_30px_-10px_rgba(14,140,114,0.08),inset_0_1px_0_0_rgba(255,255,255,0.8)]" 
            : "bg-transparent border-transparent shadow-none"
        )}
        style={showSolid ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}}
        >
          <div className="mx-auto max-w-7xl h-16 px-5 sm:px-8 flex items-center justify-between">

            {/* Logo */}
            <Anchor href="#top" className="flex items-center gap-2 shrink-0 group">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` }}>
                {/* Liquid glass specular highlight overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                
                {/* Premium abstract medical cross/spark icon */}
                <svg className="relative h-5 w-5 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[19px] font-extrabold tracking-tight text-[#1A1A2E] leading-none">
                  Clynic<span style={{ color: TEAL }}>.</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#718096] uppercase leading-none mt-1">Care</span>
              </div>
            </Anchor>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <Anchor
                  key={link.label}
                  href={link.href}
                  className={cx(
                    "px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200",
                    link.active
                      ? "text-[#0E8C72] font-semibold"
                      : "text-[#4A5568] hover:text-[#0E8C72]"
                  )}
                >
                  {link.label}
                </Anchor>
              ))}
              <Link to={m.portalHref} className="px-3 py-1.5 text-[13px] font-medium text-[#4A5568] hover:text-[#0E8C72] rounded-md transition-all duration-200">
                Login
              </Link>
            </nav>

            {/* CTA + burger */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={m.bookHref}
                className="hidden sm:inline-flex h-10 items-center justify-center rounded-full px-5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] gap-1.5 overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`,
                  boxShadow: `0 6px 16px -4px rgba(14, 140, 114, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.45)`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL_DARK}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%), ${TEAL}`; }}
              >
                Book Appointment
              </Link>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4A5568] transition-colors hover:bg-slate-100 xl:hidden shrink-0"
                aria-label="Open menu"
                aria-expanded={open}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] xl:hidden"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: -10, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mx-3 mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog" aria-modal="true" aria-label="Menu"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md text-white" style={{ background: TEAL }}>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16" /><path d="M4 12h16" /></svg>
                  </div>
                  <span className="text-[14px] font-bold text-[#1A1A2E]">{m.name}</span>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-1 flex flex-col" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <Anchor key={l.label} href={l.href} onClick={() => setOpen(false)}
                    className={cx("block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors", l.active ? "text-[#0E8C72] font-semibold" : "text-[#1A1A2E] hover:bg-slate-50")}
                  >{l.label}</Anchor>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <Link to={m.bookHref} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[14px] font-semibold" style={{ background: TEAL }}>
                    <CalendarPlus className="h-4 w-4" /> Book Appointment
                  </Link>
                  <Link to={m.portalHref} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 text-[#4A5568] text-[14px] font-semibold hover:bg-slate-50">
                    <Fingerprint className="h-4 w-4" /> Login
                  </Link>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
