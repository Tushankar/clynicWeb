/**
 * Premium Signature — motion primitives (framer-motion).
 * Every primitive respects prefers-reduced-motion: reveals collapse to simple fades,
 * ambient/floating loops disable entirely.
 */
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

export const EASE = [0.21, 0.47, 0.32, 0.98];

/** Fade-up + blur-in reveal on first scroll into view. */
export function Reveal({ children, delay = 0, y = 26, className, as = 'div', once = true, ...rest }) {
  const reduced = useReducedMotion();
  const Cmp = motion[as] || motion.div;
  return (
    <Cmp
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(10px)' }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-72px 0px' }}
      transition={{ duration: 0.75, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Cmp>
  );
}

/** Parent that staggers its <Item> children as they enter the viewport. */
export function Stagger({ children, className, gap = 0.09, delay = 0, ...rest }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-64px 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Item({ children, className, y = 26, ...rest }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(8px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.7, ease: EASE },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Buttery number counter — springs from 0 to `value` when scrolled into view. */
export function CountUp({ value, decimals = 0, suffix = '', className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 42, damping: 18, mass: 1 });
  const [text, setText] = useState('0');

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setText(Number(value).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
      return;
    }
    mv.set(value);
  }, [inView, value, reduced, mv, decimals]);

  useEffect(
    () =>
      spring.on('change', (v) =>
        setText(
          Number(v).toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        )
      ),
    [spring, decimals]
  );

  return (
    <span ref={ref} className={className}>
      {text}
      {suffix}
    </span>
  );
}

/** Gentle infinite vertical bob for floating cards. */
export function FloatY({ children, className, distance = 10, duration = 6, delay = 0, ...rest }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduced ? undefined : { y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Magnetic hover — the element leans a few px toward the cursor. */
export function Magnetic({ children, className, strength = 0.28, max = 7 }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.6 });

  const onMove = (e) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    x.set(Math.max(-max, Math.min(max, dx)));
    y.set(Math.max(-max, Math.min(max, dy)));
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

/** Subtle 3D tilt on pointer — for premium cards. Keep max small (≤4°). */
export function Tilt({ children, className, max = 3.5, style, ...rest }) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 180, damping: 18 });

  const onMove = (e) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX: reduced ? 0 : rx, rotateY: reduced ? 0 : ry, transformPerspective: 900, ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
