import { PageShell } from "@/components/page-shell";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <PageShell
      title="ダッシュボード"
      description="topic 別の件数と、PoC で生成される改善提案を確認できます。"
    >
      <DashboardClient />
    </PageShell>
  );
}
