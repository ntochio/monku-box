import Link from "next/link";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-xl py-10 px-4 flex flex-col gap-6">
      <Link href="/" className="text-sm text-blue-700 underline">
        ← ホーム
      </Link>
      <h1 className="text-xl font-semibold">ダッシュボード</h1>
      <DashboardClient />
    </div>
  );
}
