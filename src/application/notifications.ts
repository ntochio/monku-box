import { NotFoundError } from "@/application/errors";
import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";
import type { Role } from "@/domain/role";

export type NotificationListItem = {
  notificationId: string;
  eventId: string;
  title: string;
  eventType: string;
  topicId: string;
  readFlag: boolean;
  createdAt: string;
};

export function listNotificationsForRole(
  role: Role,
  store: MonkuJsonStore = new MonkuJsonStore(),
): NotificationListItem[] {
  if (role !== "viewer" && role !== "admin") {
    return [];
  }
  const data = store.read();
  const views = data.notificationViews.filter((v) => v.recipientRole === role);
  const out: NotificationListItem[] = [];
  for (const v of views) {
    const ev = data.notificationEvents.find((e) => e.eventId === v.eventId);
    if (!ev) continue;
    out.push({
      notificationId: v.notificationId,
      eventId: v.eventId,
      title: ev.title,
      eventType: ev.eventType,
      topicId: ev.topicId,
      readFlag: v.readFlag,
      createdAt: v.createdAt,
    });
  }
  return out.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function markNotificationRead(
  notificationId: string,
  role: Role,
  store: MonkuJsonStore = new MonkuJsonStore(),
) {
  if (role !== "viewer" && role !== "admin") {
    throw new NotFoundError();
  }
  return store.withTransaction((data) => {
    const v = data.notificationViews.find(
      (x) => x.notificationId === notificationId && x.recipientRole === role,
    );
    if (!v) throw new NotFoundError("通知が見つかりません");
    v.readFlag = true;
    return { ok: true };
  });
}
