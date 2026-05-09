import Link from "next/link";
import NotificationsClient from "./notifications-client";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-xl py-10 px-4 flex flex-col gap-6">
      <Link href="/" className="text-sm text-blue-700 underline">
        ← ホーム
      </Link>
      <h1 className="text-xl font-semibold">通知</h1>
      <NotificationsClient />
    </div>
  );
}
