import type { CriteriaCounts } from './report';

const COLORS: Record<string, string> = {
  b: 'var(--color-field)',
  r: 'var(--color-report)',
  m: 'var(--color-danger)',
  n: 'var(--color-muted)',
};

/** Donut SVG de conteo de criterios (Bueno/Regular/Malo/N/A). */
export function CriteriaDonut({ counts }: { counts: CriteriaCounts }) {
  const { b, r, m, n, total, pctGood } = counts;
  const cx = 75,
    cy = 75,
    radius = 58,
    stroke = 18,
    circ = 2 * Math.PI * radius;
  const segments = [
    { v: b, color: COLORS.b },
    { v: r, color: COLORS.r },
    { v: m, color: COLORS.m },
    { v: n, color: COLORS.n },
  ];
  let offset = 0;
  return (
    <svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
      {segments.map((d, i) => {
        if (d.v <= 0) return null;
        const len = (d.v / total) * circ;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += len;
        return el;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--color-heading)">
        {pctGood}%
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="var(--color-muted)">
        en buen estado
      </text>
    </svg>
  );
}
