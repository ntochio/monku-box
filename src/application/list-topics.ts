import { createId } from "@/domain/ids";
import { normalizeTopicLabel } from "@/domain/normalize";
import type { TopicRecord } from "@/domain/models";
import type { Role } from "@/domain/role";
import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";

export function listTopics(store: MonkuJsonStore = new MonkuJsonStore()): TopicRecord[] {
  const data = store.read();
  return [...data.topics]
    .filter((t) => t.status === "active")
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function addTopic(
  label: string,
  role: Role,
  store: MonkuJsonStore = new MonkuJsonStore(),
): TopicRecord {
  const norm = normalizeTopicLabel(label);
  return store.withTransaction((data) => {
    const existing = data.topics.find((t) => t.normalizedLabel === norm);
    if (existing) return existing;
    const topic: TopicRecord = {
      topicId: createId(),
      label: label.trim(),
      normalizedLabel: norm,
      createdByRole: role,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    data.topics.push(topic);
    return topic;
  });
}
