import { PageShell } from "@/components/page-shell";
import AdminClient from "./admin-client";

export default function AdminPage() {
  return (
    <PageShell
      title="管理"
      description="アカウントと禁止語（Policy）の PoC 最小設定です（管理者ロール）。"
    >
      <AdminClient />
    </PageShell>
  );
}
