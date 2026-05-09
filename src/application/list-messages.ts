import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";
import type { MessageRecord } from "@/domain/models";

export function listMessages(
  opts: { topicId?: string | null; limit?: number },
  store: MonkuJsonStore = new MonkuJsonStore(),
): MessageRecord[] {
  const data = store.read();
  let rows = [...data.messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (opts.topicId) {
    rows = rows.filter((m) => m.topicId === opts.topicId);
  }
  const limit = Math.min(opts.limit ?? 100, 500);
  return rows.slice(0, limit);
}
