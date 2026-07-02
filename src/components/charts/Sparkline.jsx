/**
 * Sparkline — a tiny inline trend line for KPI cards. Scales `data` (numbers) into a
 * fixed viewBox and stretches to the container width. Colour comes from `color`
 * (any CSS colour) via currentColor, so it can pick up a semantic/brand hue.
 */
export function Sparkline({ data = [], color = 'currentColor', fill = true, strokeWidth = 2, className }) {
  const w = 100;
  const h = 32;
  const pad = 3;
  const vals = data.length > 1 ? data : [...data, ...data, 0].slice(0, 2);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const step = (w - pad * 2) / (vals.length - 1);
  const pts = vals.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} style={{ color, display: 'block' }} aria-hidden="true">
      {fill && <path d={area} fill="currentColor" opacity="0.1" />}
      <path d={line} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
