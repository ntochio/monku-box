import { PageShell } from "@/components/page-shell";
import MessagesClient from "./messages-client";

export default function MessagesPage() {
  return (
    <PageShell
      title="メッセージ一覧"
      description="投稿されたメッセージを時系列で確認します。閲覧者・管理者ロールで利用できます。"
    >
      <MessagesClient />
    </PageShell>
  );
}
