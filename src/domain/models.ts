import type { Role } from "./role";

export type TopicRecord = {
  topicId: string;
  label: string;
  normalizedLabel: string;
  createdByRole: Role;
  createdAt: string;
  status: "active" | "archived";
};

export type MessageRecord = {
  messageId: string;
  topicId: string;
  bodyRaw: string;
  bodyDisplay: string;
  inputType: "text" | "voice";
  anonymousSubmitterId: string;
  createdAt: string;
  policyApplied: boolean;
};

export type PolicyResultRecord = {
  policyResultId: string;
  messageId: string;
  requiredCheckOk: boolean;
  lengthCheckOk: boolean;
  maskApplied: boolean;
  maskedTerms: string[];
  finalAction: "accept_with_mask";
};

export type NotificationEventRecord = {
  eventId: string;
  eventType: "new_message" | "topic_spike";
  topicId: string;
  messageId?: string;
  occurredAt: string;
  title: string;
};

export type NotificationViewRecord = {
  notificationId: string;
  eventId: string;
  recipientRole: "viewer" | "admin";
  readFlag: boolean;
  createdAt: string;
};

export type SuggestionRecord = {
  suggestionId: string;
  topicId: string;
  summaryText: string;
  evidenceMetrics: { count: number; period: string };
  generatedAt: string;
};

export type AccountRecord = {
  accountId: string;
  email: string;
  role: Role;
  status: "active";
  createdAt: string;
};

export type DataStoreSnapshot = {
  topics: TopicRecord[];
  messages: MessageRecord[];
  policyResults: PolicyResultRecord[];
  notificationEvents: NotificationEventRecord[];
  notificationViews: NotificationViewRecord[];
  suggestions: SuggestionRecord[];
  accounts: AccountRecord[];
  blockedWords: string[];
  version: number;
};
