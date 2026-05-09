"use client";

type Day = { date: string; count: number };

function formatDayLabel(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return `${m}/${d}`;
}

export function MessagesTimelineBarChart({ series }: { series: Day[] }) {
  if (series.length === 0) {
    return (
      <p className="text-sm text-zinc-500" data-testid="dashboard-timeline-empty">
        日次の投稿データがありません。
      </p>
    );
  }

  const max = Math.max(...series.map((s) => s.count), 1);

  return (
    <div className="w-full overflow-x-auto pb-2" data-testid="dashboard-timeline-bars">
      <div
        className="flex min-h-[200px] min-w-[min(100%,280px)] items-end gap-1 sm:gap-2"
        role="img"
        aria-label="日別投稿件数の棒グラフ"
      >
        {series.map((s) => {
          const h = Math.max(4, (s.count / max) * 100);
          return (
            <div key={s.date} className="flex flex-1 flex-col items-center gap-1" style={{ minWidth: "1.25rem" }}>
              <div className="flex h-40 w-full items-end justify-center">
                <div
                  className="w-full max-w-[2rem] rounded-t bg-indigo-500 transition-[height] dark:bg-indigo-400"
                  style={{ height: `${h}%` }}
                  title={`${s.date}: ${s.count} 件`}
                />
              </div>
              <span className="max-w-full truncate text-center text-[10px] text-zinc-500 sm:text-xs" title={s.date}>
                {formatDayLabel(s.date)}
              </span>
              <span className="tabular-nums text-[10px] text-zinc-600 dark:text-zinc-400 sm:text-xs">{s.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
