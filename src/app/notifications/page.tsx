import { PageShell } from "@/components/page-shell";
import NotificationsClient from "./notifications-client";

export default function NotificationsPage() {
  return (
    <PageShell title="通知" description="閲覧者・管理者向けのアプリ内通知です。">
      <NotificationsClient />
    </PageShell>
  );
}
