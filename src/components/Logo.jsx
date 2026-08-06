import { cn } from '@/lib/utils';

/**
 * Clynic brand lockup — an inline SVG so the mark is crisp at every size, tintable, and
 * always in sync with the brand green ramp (see index.css). Size it by height and let the
 * width auto-fit. Use everywhere the brand appears.
 *
 * `mark` renders the glyph alone (favicons, tight nav slots, avatars);
 * `tone="dark"` renders the wordmark in white for dark surfaces.
 */
export function Logo({ className, alt = 'Clynic', mark = false, tone = 'light' }) {
  // Wordmark rides the same brand green as the glyph (white on dark surfaces).
  const wordFill = tone === 'dark' ? '#FFFFFF' : '#0E8C72';

  if (mark) {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label={alt} className={cn('h-8 w-auto', className)}>
        <LogoMark />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 188 48" role="img" aria-label={alt} className={cn('h-8 w-auto', className)}>
      <LogoMark />
      <text
        x="58"
        y="33"
        fill={wordFill}
        fontFamily="'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif"
        fontSize="26"
        fontWeight="700"
        letterSpacing="-0.8"
      >
        Clynic
      </text>
    </svg>
  );
}

/** The "C+" glyph: an open brand-green ring with a medical cross in its mouth. */
function LogoMark() {
  return (
    <g>
      <defs>
        <linearGradient id="clynic-mark" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0BB89F" />
          <stop offset="0.55" stopColor="#0E8C72" />
          <stop offset="1" stopColor="#0A6A56" />
        </linearGradient>
      </defs>
      {/* Open ring — the "C" */}
      <path
        d="M33.4 11.6A16 16 0 1 0 33.4 36.4"
        fill="none"
        stroke="url(#clynic-mark)"
        strokeWidth="8.5"
        strokeLinecap="round"
      />
      {/* Cross — the "+" sitting in the ring's mouth */}
      <path
        d="M31.5 24h11M37 18.5v11"
        fill="none"
        stroke="url(#clynic-mark)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </g>
  );
}
