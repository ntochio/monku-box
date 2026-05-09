import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";

export type DashboardSummary = {
  topicCounts: { topicId: string; label: string; count: number }[];
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

  return {
    topicCounts,
    suggestions: [...data.suggestions],
  };
}
