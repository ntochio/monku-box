import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";

export type DashboardSummary = {
  topicCounts: { topicId: string; label: string; count: number }[];
  /** 全メッセージを UTC 日付（YYYY-MM-DD）ごとに集計、古い順 */
  messagesByDay: { date: string; count: number }[];
  suggestions: {
    suggestionId: string;
    topicId: string;
    summaryText: string;
    evidenceMetrics: { count: number; period: string };
    generatedAt: string;
  }[];
};

export function buildDashboardSummary(
  store: MonkuJsonStore = new MonkuJsonStore(),
): DashboardSummary {
  const data = store.read();
  const topicCounts = data.topics
    .filter((t) => t.status === "active")
    .map((t) => ({
      topicId: t.topicId,
      label: t.label,
      count: data.messages.filter((m) => m.topicId === t.topicId).length,
    }))
    .sort((a, b) => b.count - a.count);

  const dayMap = new Map<string, number>();
  for (const m of data.messages) {
    const day = new Date(m.createdAt).toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const messagesByDay = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    topicCounts,
    messagesByDay,
    suggestions: [...data.suggestions],
  };
}
