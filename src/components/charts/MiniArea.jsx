import { useId } from 'react';

/**
 * MiniArea — a compact area+line chart with a soft gradient fill, endpoint dot, and
 * x-axis labels. Used for the Revenue Overview widget. `data` is [{ label, value }].
 */
export function MiniArea({ data = [], color = 'hsl(var(--primary))', height = 150, format = (v) => v, className }) {
  const gid = useId().replace(/:/g, '');
  const w = 320;
  const h = 110;
  const padX = 6;
  const padTop = 10;
  const padBottom = 6;
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const step = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => [padX + i * step, h - padBottom - ((d.value - min) / range) * (h - padTop - padBottom)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = pts.length ? `${line} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z` : '';
  const last = pts[pts.length - 1];

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, color, display: 'block' }} aria-hidden="true">
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill={`url(#area-${gid})`} />}
        {area && <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
        {last && <circle cx={last[0]} cy={last[1]} r="3.5" fill="currentColor" vectorEffect="non-scaling-stroke" />}
      </svg>
      {data.length > 0 && (
        <div className="mt-2 flex justify-between px-1 text-[11px] text-muted-foreground">
          {data.map((d, i) => (
            <span key={i} className="tabular">{d.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
