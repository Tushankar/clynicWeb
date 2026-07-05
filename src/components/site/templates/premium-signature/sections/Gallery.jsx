/**
 * Gallery — Rebuilt with clean solid white background,
 * forest-green rings, and high contrast active overlay.
 */
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { EASE, Item, Stagger } from '../motion';
import { SectionHead } from '../ui';

// Varied aspect ratios give the masonry its rhythm.
const RATIOS = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[16/11]', 'aspect-[4/5]'];

function Lightbox({ images, index, onClose, onNav, name }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNav]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-10"
      style={{ background: 'rgba(10,28,20,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} gallery viewer`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        aria-label="Close viewer"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`${name} — gallery image ${index + 1} of ${images.length}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="max-h-[86vh] max-w-full rounded-2xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>

      <span className="pmx-display absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[12.5px] font-medium text-white">
        {index + 1} / {images.length}
      </span>
    </motion.div>,
    document.body
  );
}

export default function Gallery({ m }) {
  const images = (m.gallery || []).slice(0, 9);
  const [open, setOpen] = useState(null); // index | null

  const onNav = useCallback(
    (d) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length]
  );

  if (!images.length) return null;

  return (
    <section id="gallery" className="scroll-mt-28 bg-[#012F24] text-white" aria-label="Gallery">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <SectionHead
          tone="dark"
          eyebrow="Step inside"
          title="A space designed to put you at ease"
          sub="Calm rooms, modern equipment and light everywhere — take a look around before you visit."
        />

        <Stagger className="mt-14 columns-2 gap-4 [column-fill:_balance] md:columns-3 md:gap-5" gap={0.06}>
          {images.map((src, i) => (
            <Item key={src + i} className="mb-4 break-inside-avoid md:mb-5">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#012F24] focus-visible:ring-offset-2"
                aria-label={`Open gallery image ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`${m.name} — gallery image ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={`${RATIOS[i % RATIOS.length]} w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]`}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#012F24]/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#012F24] opacity-0 shadow-lg backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </Item>
          ))}
        </Stagger>
      </div>

      <AnimatePresence>
        {open !== null ? (
          <Lightbox
            images={images}
            index={open}
            onClose={() => setOpen(null)}
            onNav={onNav}
            name={m.name}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
