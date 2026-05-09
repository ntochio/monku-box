"use client";

import { MessageListPanel } from "@/contexts/messages/presentation/MessageListPanel";
import { usePocRole } from "@/lib/poc-role";

export default function MessagesClient() {
  const role = usePocRole();
  return <MessageListPanel role={role} />;
}
