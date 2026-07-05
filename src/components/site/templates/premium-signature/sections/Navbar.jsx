/**
 * Floating glass navigation — a rounded, blurred pill that hangs beneath the top edge,
 * tightens on scroll, and opens a staggered glass sheet on mobile.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarPlus, Menu, Phone, X } from 'lucide-react';
import { cx, telHref } from '../lib';
import { EASE } from '../motion';
import { BrandMark, Button } from '../ui';

/**
 * `basePath` renders the nav on pages OTHER than the site itself (e.g. /c/:slug/book):
 * section anchors become router links back to the site page (`${basePath}#services`),
 * and the brand mark navigates home instead of scrolling to #top.
 */
export default function Navbar({ m, basePath = '' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = [
    { label: 'About', href: '#about' },
    ...(m.services.length ? [{ label: 'Services', href: '#services' }] : []),
    ...(m.doctors.length ? [{ label: 'Doctors', href: '#doctors' }] : []),
    ...(m.reviews.length ? [{ label: 'Stories', href: '#stories' }] : []),
    ...(m.gallery.length ? [{ label: 'Gallery', href: '#gallery' }] : []),
    { label: 'FAQ', href: '#faq' },
  ];
  const pageLinks = (m.pages || []).slice(0, 2);

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
          "fixed inset-x-0 top-0 z-50 w-full border-b bg-white/95 transition-all duration-300",
          scrolled ? "h-16 border-slate-200/80 shadow-xs" : "h-20 border-slate-200/50"
        )}
      >
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          {basePath ? (
            <Link to={basePath} className="min-w-0 shrink-0" aria-label={`${m.name} — home`}>
              <BrandMark logoUrl={m.theme.logoUrl} name={m.name} />
            </Link>
          ) : (
            <a href="#top" className="min-w-0 shrink-0" aria-label={`${m.name} — home`}>
              <BrandMark logoUrl={m.theme.logoUrl} name={m.name} />
            </a>
          )}

          {/* Desktop links - centered absolute for symmetry */}
          <nav className="hidden items-center gap-1 lg:flex absolute left-1/2 -translate-x-1/2" aria-label="Primary">
            {links.map((l) => (
              <Anchor
                key={l.href}
                href={l.href}
                className="group relative rounded-full px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:text-[#005A36]"
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 -bottom-px h-[2px] origin-left scale-x-0 rounded-full bg-[#005A36] transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
              </Anchor>
            ))}
            {pageLinks.map((p) => (
              <Link
                key={p.slug}
                to={`/c/${m.clinic.slug}/p/${p.slug}`}
                className="group relative rounded-full px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:text-[#005A36]"
              >
                {p.title}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-4 -bottom-px h-[2px] origin-left scale-x-0 rounded-full bg-[#005A36] transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {m.contact.phone ? (
              <a
                href={telHref(m.contact.phone)}
                className="hidden h-9 items-center justify-center rounded-full px-4 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#005A36] md:inline-flex"
                aria-label={`Call ${m.name} on ${m.contact.phone}`}
              >
                <Phone className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {m.contact.phone}
              </a>
            ) : null}
            <span className="hidden sm:block">
              <Button to={m.bookHref} size="sm" magnetic={false}>
                Book appointment
              </Button>
            </span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile glass sheet */}
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
              className="mx-3 mt-3 overflow-hidden rounded-[28px] border border-white/60 bg-white/95 p-3 shadow-[0_32px_80px_-24px_rgba(10,27,58,0.35)]"
              style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between pl-2">
                <BrandMark logoUrl={m.theme.logoUrl} name={m.name} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-900/5"
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
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
              >
                {[...links, ...pageLinks.map((p) => ({ label: p.title, to: `/c/${m.clinic.slug}/p/${p.slug}` }))].map(
                  (l) => {
                    const inner = (
                      <span className="pmx-display text-[19px] font-medium tracking-[-0.01em] text-[#0B1220]">
                        {l.label}
                      </span>
                    );
                    return (
                      <motion.span
                        key={l.label}
                        variants={{
                          hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                        }}
                      >
                        {l.to ? (
                          <Link to={l.to} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 hover:bg-slate-50">
                            {inner}
                          </Link>
                        ) : (
                          <Anchor href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 hover:bg-slate-50">
                            {inner}
                          </Anchor>
                        )}
                      </motion.span>
                    );
                  }
                )}
                <motion.div
                  variants={{
                    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                  }}
                  className="mt-3 flex flex-col gap-2 border-t border-slate-100 px-1 pt-4"
                >
                  <Button to={m.bookHref} icon={CalendarPlus} magnetic={false} className="w-full" onClick={() => setOpen(false)}>
                    Book appointment
                  </Button>
                  {m.contact.phone ? (
                    <Button href={telHref(m.contact.phone)} icon={Phone} variant="ghost" magnetic={false} className="w-full">
                      Call {m.contact.phone}
                    </Button>
                  ) : null}
                </motion.div>
              </motion.nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
