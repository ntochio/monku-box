"use client";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#64748b",
];

type Slice = { topicId: string; label: string; count: number };

function pieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export function TopicPieChart({ items }: { items: Slice[] }) {
  const positive = items.filter((i) => i.count > 0);
  const total = positive.reduce((s, i) => s + i.count, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-zinc-500" data-testid="dashboard-topic-pie-empty">
        件数がある topic がありません。
      </p>
    );
  }

  const cx = 50;
  const cy = 50;
  const r = 40;

  const slices = positive.reduce<{
    angle: number;
    items: { slice: Slice; idx: number; path: string }[];
  }>(
    (state, slice, idx) => {
      const sweep = (slice.count / total) * 360;
      const start = state.angle;
      const end = state.angle + sweep;
      return {
        angle: end,
        items: [
          ...state.items,
          {
            slice,
            idx,
            path: pieSlicePath(cx, cy, r, start, end),
          },
        ],
      };
    },
    { angle: 0, items: [] },
  ).items;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8" data-testid="dashboard-topic-pie">
      <svg viewBox="0 0 100 100" className="mx-auto h-48 w-48 shrink-0" role="img" aria-label="topic 別件数の割合">
        <title>topic 別件数の円グラフ</title>
        {slices.map(({ slice, idx, path }) => {
          const color = COLORS[idx % COLORS.length];
          return <path key={slice.topicId} d={path} fill={color} stroke="white" strokeWidth="0.5" />;
        })}
      </svg>
      <ul className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
        {positive.map((slice, idx) => (
          <li key={slice.topicId} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              aria-hidden
            />
            <span className="truncate text-zinc-800 dark:text-zinc-100">{slice.label}</span>
            <span className="ml-auto tabular-nums text-zinc-500">
              {slice.count}（{Math.round((slice.count / total) * 100)}%）
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
