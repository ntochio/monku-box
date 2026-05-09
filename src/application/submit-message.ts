import { ForbiddenError, ValidationError } from "@/application/errors";
import { createId } from "@/domain/ids";
import { normalizeTopicLabel } from "@/domain/normalize";
import type {
  DataStoreSnapshot,
  MessageRecord,
  NotificationEventRecord,
  TopicRecord,
} from "@/domain/models";
import { applyContentPolicy } from "@/domain/policy-engine";
import type { Role } from "@/domain/role";
import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";

function messagesInLastHour(data: DataStoreSnapshot, topicId: string): number {
  const cutoff = Date.now() - 60 * 60 * 1000;
  return data.messages.filter(
    (m) =>
      m.topicId === topicId && new Date(m.createdAt).getTime() >= cutoff,
  ).length;
}

function refreshSuggestion(data: DataStoreSnapshot, topic: TopicRecord) {
  const count = data.messages.filter((m) => m.topicId === topic.topicId).length;
  const suggestion = {
    suggestionId: createId(),
    topicId: topic.topicId,
    summaryText: `「${topic.label}」に関する投稿が ${count} 件あります。傾向を確認し、チームで改善の打ち手を検討してください。`,
    evidenceMetrics: { count, period: "all_time" },
    generatedAt: new Date().toISOString(),
  };
  const idx = data.suggestions.findIndex((s) => s.topicId === topic.topicId);
  if (idx >= 0) data.suggestions[idx] = suggestion;
  else data.suggestions.push(suggestion);
}

function pushNotification(
  data: DataStoreSnapshot,
  event: Omit<NotificationEventRecord, "eventId" | "occurredAt"> & {
    title: string;
  },
) {
  const full: NotificationEventRecord = {
    ...event,
    eventId: createId(),
    occurredAt: new Date().toISOString(),
  };
  data.notificationEvents.push(full);
  for (const recipientRole of ["viewer", "admin"] as const) {
    data.notificationViews.push({
      notificationId: createId(),
      eventId: full.eventId,
      recipientRole,
      readFlag: false,
      createdAt: new Date().toISOString(),
    });
  }
}

function emitAfterMessage(
  data: DataStoreSnapshot,
  msg: MessageRecord,
  topic: TopicRecord,
) {
  pushNotification(data, {
    eventType: "new_message",
    topicId: topic.topicId,
    messageId: msg.messageId,
    title: `新規投稿: ${topic.label}`,
  });

  const n = messagesInLastHour(data, topic.topicId);
  if (n >= 5) {
    pushNotification(data, {
      eventType: "topic_spike",
      topicId: topic.topicId,
      title: `topic 急増: ${topic.label}（直近1時間で${n}件）`,
    });
  }
}

export type SubmitMessageInput = {
  role: Role;
  topicId?: string | null;
  topicLabel: string;
  body: string;
  inputType: "text" | "voice";
  anonymousSubmitterId?: string | null;
};

export function submitMessage(
  input: SubmitMessageInput,
  store: MonkuJsonStore = new MonkuJsonStore(),
) {
  if (input.role !== "submitter") {
    throw new ForbiddenError("投稿は投稿者ロールのみ");
  }
  if (!input.topicLabel?.trim() && !input.topicId) {
    throw new ValidationError("topicLabel または topicId が必要です");
  }

  return store.withTransaction((data) => {
    const anonymousSubmitterId =
      input.anonymousSubmitterId?.trim() || createId();

    let topic: TopicRecord | undefined;
    if (input.topicId) {
      topic = data.topics.find((t) => t.topicId === input.topicId);
    }
    if (!topic && input.topicLabel?.trim()) {
      const norm = normalizeTopicLabel(input.topicLabel);
      topic = data.topics.find((t) => t.normalizedLabel === norm);
      if (!topic) {
        topic = {
          topicId: createId(),
          label: input.topicLabel.trim(),
          normalizedLabel: norm,
          createdByRole: input.role,
          createdAt: new Date().toISOString(),
          status: "active",
        };
        data.topics.push(topic);
      }
    }

    if (!topic) {
      throw new ValidationError("topic を特定できません");
    }

    const messageId = createId();
    const { bodyDisplay, policyResult } = applyContentPolicy(
      input.body,
      data.blockedWords,
      messageId,
    );

    const msg: MessageRecord = {
      messageId,
      topicId: topic.topicId,
      bodyRaw: input.body,
      bodyDisplay,
      inputType: input.inputType,
      anonymousSubmitterId,
      createdAt: new Date().toISOString(),
      policyApplied: true,
    };
    data.messages.push(msg);
    data.policyResults.push(policyResult);

    refreshSuggestion(data, topic);
    emitAfterMessage(data, msg, topic);

    return {
      messageId,
      topicId: topic.topicId,
      bodyDisplay,
    };
  });
}
