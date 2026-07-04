/**
 * Mobile action bar — a floating glass dock that slides in after the hero, keeping
 * "Book" one thumb-tap away on phones without covering content at the top of the page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarPlus, Phone } from 'lucide-react';
import { telHref } from '../lib';
import { EASE } from '../motion';

export default function MobileBar({ m }) {
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { y: 72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: 72, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-x-4 z-40 sm:hidden"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div
            className="flex items-center gap-2.5 rounded-[1.4rem] border border-white/50 p-2.5"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
              boxShadow: '0 24px 56px -16px rgba(10,27,58,0.4)',
            }}
          >
            <Link
              to={m.bookHref}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A1B3A] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(10,27,58,0.5)] transition-transform active:scale-[0.98]"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Book appointment
            </Link>
            {m.contact.phone ? (
              <a
                href={telHref(m.contact.phone)}
                className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#0A1B3A] transition-transform active:scale-[0.96]"
                aria-label={`Call ${m.name}`}
              >
                <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
