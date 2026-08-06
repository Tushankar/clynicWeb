/**
 * Navbar — Clean healthcare nav matching the reference exactly.
 * White background, full link set, glassmorphic Book Appointment button.
 *
 * Everything shown here comes from the clinic's CMS config: the brand is the clinic's logo
 * (or its name), the section links are built from the sections that will actually render
 * (buildNavLinks), and any published custom pages are appended so they are reachable.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarPlus, Menu, X, Fingerprint, ShoppingBag, ChevronDown, FileText } from 'lucide-react';
import { buildNavLinks, cx } from '../lib';
import { EASE } from '../motion';

const TEAL = '#0A6A56';
const TEAL_DARK = '#074C3D';

/**
 * Split a clinic name into the two-line wordmark the lockup was designed for
 * ("Sunrise Dental Care" → "Sunrise Dental" / "CARE"). Single-word names get no sub-line.
 */
function splitBrand(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [words[0] || 'Clinic', ''];
  return [words.slice(0, -1).join(' '), words[words.length - 1]];
}

/**
 * @param tone 'light' (default) for pages whose top is a light canvas, 'dark' for pages that
 *   open on a dark surface (custom pages). Dark tone only applies while the bar is still
 *   transparent — once scrolled it turns to white glass and the light styling takes over again.
 */
export default function Navbar({ m, basePath = '', solid = false, tone = 'light' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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

  const NAV_LINKS = buildNavLinks(m);
  const pages = m.pages || [];
  const showSolid = solid || scrolled;
  // Over a dark page header the bar is transparent, so its text must go light for contrast.
  const onDark = tone === 'dark' && !showSolid;
  const linkCls = onDark
    ? 'text-white/75 hover:text-white'
    : 'text-[#4A5568] hover:text-[#0E8C72]';
  // Brand: the clinic's uploaded logo wins; otherwise its name renders in the same lockup.
  const logoUrl = m.theme?.logoUrl || '';
  const [brandTop, brandSub] = splitBrand(m.name);

  return (
    <>
      <motion.header
        initial={reduced ? false : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300 select-none"
      >
        {/* The bar must stay legible over EVERY section it floats above — the porcelain hero,
            photography on the portal, and the dark forest footer. A translucent pane turns
            muddy over dark green and the ink-grey links disappear, so once it is showing at
            all it goes near-opaque white and its contrast becomes independent of the backdrop.
            Only the untouched top-of-page state is transparent. */}
        <div className={cx(
          "w-full border-b transition-all duration-500",
          showSolid
            ? "bg-white/95 border-slate-200/70 shadow-[0_8px_28px_-12px_rgba(1,47,36,0.22)]"
            : "bg-transparent border-transparent shadow-none"
        )}
        style={showSolid ? { backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)' } : {}}
        >
          <div className="mx-auto max-w-7xl h-16 px-5 sm:px-8 flex items-center justify-between">

            {/* Logo — the clinic's own mark, or its name in the signature lockup */}
            <Anchor href="#top" className="flex items-center gap-2 shrink-0 group" aria-label={`${m.name} — home`}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${m.name} logo`}
                  className={cx('h-10 w-auto max-w-[180px] object-contain transition-transform group-hover:scale-105', onDark && 'brightness-0 invert')}
                />
              ) : (
                <>
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105" style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` }}>
                    {/* Liquid glass specular highlight overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

                    {/* Premium abstract medical cross/spark icon */}
                    <svg className="relative h-5 w-5 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cx('text-[19px] font-extrabold tracking-tight leading-none truncate max-w-[220px]', onDark ? 'text-white' : 'text-[#1A1A2E]')}>
                      {brandTop}<span style={{ color: onDark ? '#34D399' : TEAL }}>.</span>
                    </span>
                    {brandSub ? (
                      <span className={cx('text-[10px] font-bold tracking-widest uppercase leading-none mt-1 truncate max-w-[220px]', onDark ? 'text-white/55' : 'text-[#718096]')}>{brandSub}</span>
                    ) : null}
                  </div>
                </>
              )}
            </Anchor>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <Anchor
                  key={link.label}
                  href={link.href}
                  className={cx('px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200', linkCls)}
                >
                  {link.label}
                </Anchor>
              ))}

              {/* Published CMS pages — a compact "More" menu so the nav never overflows */}
              {pages.length ? (
                <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
                  <button
                    type="button"
                    onMouseEnter={() => setMoreOpen(true)}
                    onClick={() => setMoreOpen((v) => !v)}
                    aria-expanded={moreOpen}
                    aria-haspopup="true"
                    className={cx('inline-flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200', linkCls)}
                  >
                    More <ChevronDown className={cx('h-3.5 w-3.5 transition-transform', moreOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {moreOpen ? (
                      <motion.div
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: EASE }}
                        className="absolute right-0 top-full mt-1 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"
                      >
                        {pages.map((p) => (
                          <Link
                            key={p.slug}
                            to={m.pageHref(p.slug)}
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-[#1A1A2E] transition-colors hover:bg-slate-50 hover:text-[#0E8C72]"
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                            <span className="truncate">{p.title}</span>
                          </Link>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}

              <Link to={m.portalHref} className={cx('px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200', linkCls)}>
                Login
              </Link>
            </nav>

            {/* CTA + burger */}
            <div className="flex items-center gap-3 shrink-0">
              {m.store ? (
                <Link
                  to={m.storeHref}
                  className={cx(
                    'hidden lg:inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5',
                    onDark
                      ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                      : 'border-[#0E8C72]/25 bg-[#0BB89F]/5 text-[#0E8C72] hover:bg-[#0BB89F]/10'
                  )}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Shop
                </Link>
              ) : null}
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
                className={cx(
                  'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors xl:hidden shrink-0',
                  onDark ? 'text-white hover:bg-white/10' : 'text-[#4A5568] hover:bg-slate-100'
                )}
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
              <nav className="mt-1 flex flex-col max-h-[70vh] overflow-y-auto" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <Anchor key={l.label} href={l.href} onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors text-[#1A1A2E] hover:bg-slate-50"
                  >{l.label}</Anchor>
                ))}
                {pages.map((p) => (
                  <Link key={p.slug} to={m.pageHref(p.slug)} onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors text-[#1A1A2E] hover:bg-slate-50"
                  >{p.title}</Link>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <Link to={m.bookHref} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[14px] font-semibold" style={{ background: TEAL }}>
                    <CalendarPlus className="h-4 w-4" /> Book Appointment
                  </Link>
                  {m.store ? (
                    <Link to={m.storeHref} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#0E8C72]/25 bg-[#0BB89F]/5 text-[#0E8C72] text-[14px] font-semibold">
                      <ShoppingBag className="h-4 w-4" /> Shop medicines
                    </Link>
                  ) : null}
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
