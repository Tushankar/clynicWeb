/**
 * Donut — a clean ring chart for distributions (e.g. patient demographics).
 * `segments` is [{ label, value, color }]. Renders arcs via stroke-dasharray with a
 * centred total. Colours are passed by the caller (CSS colours).
 */
export function Donut({ segments = [], size = 160, thickness = 18, centerValue, centerLabel, className }) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={thickness} />
        {total > 0 &&
          segments.map((seg, i) => {
            const frac = (seg.value || 0) / total;
            const len = frac * circ;
            const dash = `${len} ${circ - len}`;
            const offset = -acc * circ;
            acc += frac;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            );
          })}
      </svg>
      <div style={{ position: 'absolute', inset: 0 }} className="flex flex-col items-center justify-center">
        {centerValue != null && <span className="text-2xl font-semibold tabular text-foreground">{centerValue}</span>}
        {centerLabel && <span className="text-[11px] text-muted-foreground">{centerLabel}</span>}
      </div>
    </div>
  );
}
