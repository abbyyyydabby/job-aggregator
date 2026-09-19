type DayPoint = { date: string; label: string; count: number };

type ActivityChartProps = {
  days: DayPoint[];
  total: number;
};

const WIDTH = 560;
const HEIGHT = 180;
const PAD_LEFT = 34;
const PAD_RIGHT = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export function ActivityChart({ days, total }: ActivityChartProps) {
  const maxCount = Math.max(...days.map((d) => d.count), 4);
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = days.length > 1 ? plotW / (days.length - 1) : 0;

  const points = days.map((d, i) => {
    const x = PAD_LEFT + i * stepX;
    const y = PAD_TOP + plotH - (d.count / maxCount) * plotH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    `${linePath} ` +
    `L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)} ` +
    `L ${points[0].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        style={{ height: HEIGHT }}
        role="img"
        aria-label={`Job ingestion activity over the last ${days.length} days, ${total} total`}
      >
        <defs>
          <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => {
          const y = PAD_TOP + plotH * g;
          return (
            <line
              key={g}
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={y}
              y2={y}
              stroke="var(--line)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          );
        })}

        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <text
            key={g}
            x={PAD_LEFT - 8}
            y={PAD_TOP + plotH * (1 - g) + 3}
            textAnchor="end"
            fontSize="9"
            fill="var(--muted-dim)"
          >
            {Math.round(maxCount * g)}
          </text>
        ))}

        <path d={areaPath} fill="url(#activity-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--lime)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r={2.5} fill="var(--lime)" />
        ))}

        {points.map((p) => (
          <text
            key={p.date}
            x={p.x}
            y={HEIGHT - 6}
            textAnchor="middle"
            fontSize="10"
            fill="var(--muted-dim)"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
