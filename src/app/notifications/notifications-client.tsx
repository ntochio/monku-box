"use client";

import { NotificationList } from "@/contexts/notifications/presentation/NotificationList";
import { usePocRole } from "@/lib/poc-role";

export default function NotificationsClient() {
  const role = usePocRole();
  return <NotificationList role={role} />;
}
