/**
 * Premium Signature — shared UI atoms: buttons, section heads, icon tiles, imagery.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Star } from 'lucide-react';
import { GRADIENTS, SHADOW, cx, initials } from './lib';
import { Magnetic, Reveal } from './motion';

/* ---------------------------------- typography ---------------------------------- */

export function Eyebrow({ children, tone = 'light' }) {
  return (
    <span
      className={cx(
        'pmx-display inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em]',
        tone === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
      )}
    >
      <span
        aria-hidden="true"
        className={cx('h-px w-8', tone === 'dark' ? 'bg-emerald-400/60' : 'bg-emerald-600/50')}
      />
      {children}
    </span>
  );
}

export function SectionHead({ eyebrow, title, sub, tone = 'light', align = 'center', className }) {
  return (
    <div
      className={cx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        align === 'center' && '[&_.pmx-eyebrow-row]:justify-center',
        className
      )}
    >
      <Reveal>
        <div className="pmx-eyebrow-row flex">
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cx(
            'pmx-display mt-4 text-balance text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] sm:text-[2.6rem]',
            tone === 'dark' ? 'text-white' : 'text-[#0B1220]'
          )}
        >
          {title}
        </h2>
      </Reveal>
      {sub ? (
        <Reveal delay={0.16}>
          <p
            className={cx(
              'mt-5 text-pretty text-base leading-relaxed sm:text-lg',
              tone === 'dark' ? 'text-slate-400' : 'text-slate-600'
            )}
          >
            {sub}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ------------------------------------ buttons ------------------------------------ */

const btnBase =
  'group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-semibold outline-none transition-all duration-300 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98]';

/**
 * Button — variants: primary (deep navy, emerald glow on hover), light (white, for dark
 * sections), ghost (hairline), glass (translucent on imagery). Renders <Link> for `to`,
 * <a> for `href`, else <button>. Wrapped in Magnetic for the leaning micro-interaction.
 */
export function Button({
  to,
  href,
  onClick,
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className,
  magnetic = true,
  ...rest
}) {
  const sizes = {
    sm: 'px-5 py-2.5 text-[13px]',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-[15px]',
  };
  const variants = {
    primary: 'text-white bg-[#005A36] hover:-translate-y-0.5 hover:bg-[#004225]',
    light: 'text-[#005A36] bg-white hover:-translate-y-0.5',
    ghost:
      'text-slate-700 bg-white/70 border border-slate-200/80 backdrop-blur hover:border-slate-300 hover:bg-white hover:-translate-y-0.5',
    ghostDark:
      'text-white bg-white/5 border border-white/15 backdrop-blur hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5',
    emerald: 'text-white bg-gradient-to-br from-emerald-600 to-emerald-500 hover:-translate-y-0.5',
  };
  const shadows = {
    primary: { boxShadow: '0 12px 32px -10px rgba(0,90,54,0.3)' },
    light: { boxShadow: SHADOW.md },
    emerald: { boxShadow: SHADOW.glow },
    ghost: {},
    ghostDark: {},
  };

  const inner = (
    <>
      {/* sheen sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
      />
      {Icon ? <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" /> : null}
      <span className="inline-flex items-center gap-1.5">{children}</span>
    </>
  );

  const cls = cx(btnBase, sizes[size], variants[variant], className);
  const style = shadows[variant];

  let el;
  if (to) {
    el = (
      <Link to={to} className={cls} style={style} onClick={onClick} {...rest}>
        {inner}
      </Link>
    );
  } else if (href) {
    el = (
      <a href={href} className={cls} style={style} onClick={onClick} {...rest}>
        {inner}
      </a>
    );
  } else {
    el = (
      <button type="button" className={cls} style={style} onClick={onClick} {...rest}>
        {inner}
      </button>
    );
  }
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

/** Inline text link with sliding arrow. */
export function ArrowLink({ to, href, children, className, tone = 'light' }) {
  const cls = cx(
    'group/al inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
    tone === 'dark' ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-600',
    className
  );
  const inner = (
    <>
      <span>{children}</span>
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-300 group-hover/al:translate-x-0.5 group-hover/al:-translate-y-0.5"
        aria-hidden="true"
      />
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

/* ----------------------------------- decorations ----------------------------------- */

/** Gradient icon tile (large premium icon container). */
export function IconTile({ icon: Icon, i = 0, size = 'md', className, gradient }) {
  const sizes = { sm: 'h-10 w-10 rounded-xl', md: 'h-12 w-12 rounded-2xl', lg: 'h-14 w-14 rounded-2xl' };
  const icons = { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-7 w-7' };
  return (
    <span
      className={cx('inline-flex items-center justify-center text-white', sizes[size], className)}
      style={{ background: gradient || GRADIENTS[i % GRADIENTS.length], boxShadow: SHADOW.md }}
      aria-hidden="true"
    >
      <Icon className={icons[size]} strokeWidth={1.9} />
    </span>
  );
}

/** Brand mark — clinic logo if provided, else a crafted monogram tile.
 *  On dark surfaces the logo renders as a white silhouette so dark wordmarks stay legible. */
export function BrandMark({ logoUrl, name, tone = 'light', size = 'md' }) {
  const box = size === 'sm' ? 'h-8' : 'h-9';
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={cx(box, 'w-auto max-w-[160px] object-contain', tone === 'dark' && 'brightness-0 invert')}
      />
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className={cx(
          'relative flex shrink-0 items-center justify-center rounded-[11px] text-white',
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
        )}
        style={{
          background: 'linear-gradient(140deg,#0A1B3A 10%,#12306B 55%,#059669 130%)',
          boxShadow: '0 6px 18px -6px rgba(10,27,58,0.5)',
        }}
        aria-hidden="true"
      >
        <Plus className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={2.6} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white/90" />
      </span>
      <span
        className={cx(
          'pmx-display truncate text-[17px] font-semibold tracking-[-0.01em]',
          tone === 'dark' ? 'text-white' : 'text-[#0B1220]'
        )}
      >
        {name}
      </span>
    </span>
  );
}

/** Star row (supports halves visually via partial fill of the last star). */
export function Stars({ rating = 5, className, size = 'h-4 w-4' }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className={cx('inline-flex items-center gap-0.5', className)} aria-label={`Rated ${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, r - (i - 1)));
        return (
          <span key={i} className={cx('relative inline-block', size)} aria-hidden="true">
            <Star className={cx(size, 'absolute inset-0 text-slate-300')} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cx(size, 'text-amber-400')} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Gradient monogram avatar — dignified stand-in when no portrait exists. */
export function Monogram({ name, i = 0, className, textClass = 'text-sm' }) {
  return (
    <span
      className={cx('pmx-display inline-flex select-none items-center justify-center rounded-full font-semibold text-white', className)}
      style={{ background: GRADIENTS[i % GRADIENTS.length] }}
      aria-hidden="true"
    >
      <span className={textClass}>{initials(name)}</span>
    </span>
  );
}

/** Image with graceful gradient fallback if the URL ever 404s. */
export function SafeImg({ src, alt, className, imgClassName, eager = false, sizes }) {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div
        className={cx('flex items-center justify-center', className)}
        style={{ background: 'linear-gradient(135deg,#0A1B3A 0%,#12306B 60%,#059669 140%)' }}
        role="img"
        aria-label={alt}
      >
        <Plus className="h-10 w-10 text-white/30" aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={eager ? 'high' : undefined}
      onError={() => setBroken(true)}
      className={cx(className, imgClassName)}
    />
  );
}

/** Soft ambient gradient blob for section backgrounds. */
export function Blob({ className, from = 'rgba(16,185,129,0.14)', size = 560 }) {
  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none absolute rounded-full blur-3xl', className)}
      style={{ width: size, height: size, background: `radial-gradient(circle at center, ${from}, transparent 65%)` }}
    />
  );
}
