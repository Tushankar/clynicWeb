/**
 * Floating glass navigation — a rounded rectangle (square-ish, not a pill) that floats
 * at the top, matching the Maven Clinic mockup.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarPlus, Menu, Phone, X, ChevronDown, Fingerprint } from 'lucide-react';
import { cx, telHref } from '../lib';
import { EASE } from '../motion';
import { Button } from '../ui';

export default function Navbar({ m, basePath = '' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // On sibling pages, anchors route back to the site page; on the site page they scroll.
  const Anchor = ({ href, className, onClick, children }) =>
    basePath ? (
      <Link to={`${basePath}${href}`} className={className} onClick={onClick}>
        {children}
      </Link>
    ) : (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );

  return (
    <>
      <motion.header
        initial={reduced ? false : { y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={cx(
          "fixed inset-x-4 z-50 max-w-6xl mx-auto transition-all duration-300 select-none",
          scrolled ? "top-2" : "top-4"
        )}
      >
        {/* Slightly rounded rectangle ("like square") floating bar */}
        <div className="w-full h-16 rounded-xl bg-white/95 backdrop-blur-md shadow-[0_12px_40px_-12px_rgba(1,47,36,0.15)] border border-slate-200/50 px-6 sm:px-8 flex items-center justify-between">
          
          {/* Logo with double helix */}
          <Anchor href="#top" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#012F24] text-white shadow-sm shadow-[#012F24]/20 transition-transform group-hover:scale-105">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 10.5C7.5 13.5 11.5 16.5 15.5 16.5C19.5 16.5 21.5 13.5 22.5 10.5" />
                <path d="M4.5 13.5C7.5 10.5 11.5 7.5 15.5 7.5C19.5 7.5 21.5 10.5 22.5 13.5" />
                <line x1="9" y1="10.5" x2="9" y2="13.5" />
                <line x1="13.5" y1="9" x2="13.5" y2="15" />
                <line x1="18" y1="10.5" x2="18" y2="13.5" />
              </svg>
            </div>
            <span className="text-[16px] font-black tracking-[0.2em] text-[#012F24] font-sans">
              {m.name.toUpperCase()}
            </span>
          </Anchor>

          {/* Desktop links */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            
            {/* For You Dropdown */}
            <div className="relative group/nav-item py-4">
              <button className="flex items-center gap-1 text-[14px] font-semibold text-slate-700 hover:text-[#012F24] transition-colors focus:outline-none">
                For You
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover/nav-item:rotate-180 group-hover/nav-item:text-[#012F24]" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 origin-top rounded-xl border border-slate-100 bg-white p-3 shadow-[0_12px_32px_rgba(1,47,36,0.12)] opacity-0 scale-95 pointer-events-none group-hover/nav-item:opacity-100 group-hover/nav-item:scale-100 group-hover/nav-item:pointer-events-auto transition-all duration-200 z-50">
                <div className="grid gap-1">
                  <Anchor href="#services" className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Services</span>
                    <span className="text-[11px] text-slate-500">Expert care and diagnostic treatments</span>
                  </Anchor>
                  <Anchor href="#doctors" className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Doctors</span>
                    <span className="text-[11px] text-slate-500">Meet our experienced care specialists</span>
                  </Anchor>
                  <Anchor href="#stories" className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Patient Stories</span>
                    <span className="text-[11px] text-slate-500">Testimonials from our patient community</span>
                  </Anchor>
                  <Anchor href="#gallery" className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Gallery</span>
                    <span className="text-[11px] text-slate-500">Tour our modern premium clinic space</span>
                  </Anchor>
                </div>
              </div>
            </div>

            {/* Why Us Dropdown */}
            <div className="relative group/nav-item py-4">
              <button className="flex items-center gap-1 text-[14px] font-semibold text-slate-700 hover:text-[#012F24] transition-colors focus:outline-none">
                Why Us
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover/nav-item:rotate-180 group-hover/nav-item:text-[#012F24]" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 origin-top rounded-xl border border-slate-100 bg-white p-3 shadow-[0_12px_32px_rgba(1,47,36,0.12)] opacity-0 scale-95 pointer-events-none group-hover/nav-item:opacity-100 group-hover/nav-item:scale-100 group-hover/nav-item:pointer-events-auto transition-all duration-200 z-50">
                <div className="grid gap-1">
                  <Anchor href="#why-us" className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Our Promise</span>
                    <span className="text-[11px] text-slate-500">Same-day visits & zero waiting rooms</span>
                  </Anchor>
                  <Anchor href="#technology" className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Technology</span>
                    <span className="text-[11px] text-slate-500">Digital records & e-prescriptions</span>
                  </Anchor>
                  <Anchor href="#faq" className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">FAQs</span>
                    <span className="text-[11px] text-slate-500">Answers to common patient questions</span>
                  </Anchor>
                </div>
              </div>
            </div>

            {/* Direct Links */}
            <Anchor href="#why-us" className="text-[14px] font-semibold text-slate-700 hover:text-[#012F24] transition-colors">
              Employers
            </Anchor>
            <Anchor href="#faq" className="text-[14px] font-semibold text-slate-700 hover:text-[#012F24] transition-colors">
              Health Plans
            </Anchor>
            <Anchor href="#doctors" className="text-[14px] font-semibold text-slate-700 hover:text-[#012F24] transition-colors">
              Consultants
            </Anchor>

            {/* Resources Dropdown */}
            <div className="relative group/nav-item py-4">
              <button className="flex items-center gap-1 text-[14px] font-semibold text-slate-700 hover:text-[#012F24] transition-colors focus:outline-none">
                Resources
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover/nav-item:rotate-180 group-hover/nav-item:text-[#012F24]" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-60 origin-top rounded-xl border border-slate-100 bg-white p-3 shadow-[0_12px_32px_rgba(1,47,36,0.12)] opacity-0 scale-95 pointer-events-none group-hover/nav-item:opacity-100 group-hover/nav-item:scale-100 group-hover/nav-item:pointer-events-auto transition-all duration-200 z-50">
                <div className="grid gap-1">
                  <Link to={m.portalHref} className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                    <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Patient Portal</span>
                    <span className="text-[11px] text-slate-500">Access reports, receipts & history</span>
                  </Link>
                  {m.contact.phone && (
                    <a href={telHref(m.contact.phone)} className="group/drop flex flex-col rounded-lg p-2 hover:bg-slate-50 transition-colors">
                      <span className="text-[13px] font-bold text-slate-900 group-hover/drop:text-[#012F24]">Support Hotline</span>
                      <span className="text-[11px] text-slate-500">{m.contact.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to={m.portalHref} className="hidden sm:inline-flex h-9 items-center justify-center rounded-md border border-[#012F24] px-5 text-[13px] font-semibold text-[#012F24] hover:bg-[#012F24]/5 transition-colors">
              Login
            </Link>
            <Link to={m.bookHref} className="h-9 items-center justify-center rounded-md bg-[#012F24] px-5 text-[13px] font-semibold text-white hover:bg-[#001f18] transition-all hover:shadow-[0_4px_12px_rgba(1,47,36,0.25)] flex">
              Book a demo
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-50 lg:hidden shrink-0"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

        </div>
      </motion.header>

      {/* Mobile Drawer (Glass Sheet) */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] lg:hidden"
            style={{ background: 'rgba(6,14,34,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { y: -24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { y: -16, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mx-3 mt-3 overflow-hidden rounded-xl border border-white/60 bg-white/95 p-3 shadow-[0_32px_80px_-24px_rgba(10,27,58,0.35)]"
              style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#012F24]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4.5 10.5C7.5 13.5 11.5 16.5 15.5 16.5C19.5 16.5 21.5 13.5 22.5 10.5" />
                    <path d="M4.5 13.5C7.5 10.5 11.5 7.5 15.5 7.5C19.5 7.5 21.5 10.5 22.5 13.5" />
                  </svg>
                  <span className="text-[14px] font-black tracking-widest text-[#012F24] font-sans">
                    {m.name.toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-900/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <motion.nav
                className="mt-2 flex flex-col px-1 pb-1"
                aria-label="Mobile"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
              >
                {[
                  { label: 'Services', href: '#services' },
                  { label: 'Doctors', href: '#doctors' },
                  { label: 'Patient Stories', href: '#stories' },
                  { label: 'Why Us', href: '#why-us' },
                  { label: 'Technology', href: '#technology' },
                  { label: 'FAQs', href: '#faq' }
                ].map((l) => (
                  <motion.span
                    key={l.label}
                    variants={{
                      hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                    }}
                  >
                    <Anchor href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 hover:bg-slate-50 text-[16px] font-semibold text-[#0B1220]">
                      {l.label}
                    </Anchor>
                  </motion.span>
                ))}

                <motion.div
                  variants={{
                    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                  }}
                  className="mt-3 flex flex-col gap-2 border-t border-slate-100 px-1 pt-4"
                >
                  <Button to={m.bookHref} icon={CalendarPlus} magnetic={false} className="w-full" onClick={() => setOpen(false)}>
                    Book appointment
                  </Button>
                  <Button to={m.portalHref} icon={Fingerprint} variant="ghost" magnetic={false} className="w-full" onClick={() => setOpen(false)}>
                    Patient Portal (Login)
                  </Button>
                </motion.div>
              </motion.nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
