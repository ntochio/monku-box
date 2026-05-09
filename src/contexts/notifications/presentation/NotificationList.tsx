"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { Role } from "@/domain/role";
import { monkuFetch } from "@/lib/client-api";

type Row = {
  notificationId: string;
  title: string;
  readFlag: boolean;
  createdAt: string;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NotificationList({ role }: { role: Role }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await monkuFetch("/v1/api/notifications", role);
    if (!res.ok) {
      setErr("通知を取得できません。");
      return;
    }
    const data = (await res.json()) as { notifications: Row[] };
    setRows(data.notifications ?? []);
  }, [role]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  const markRead = async (id: string) => {
    const res = await monkuFetch(`/v1/api/notifications/${id}/read`, role, {
      method: "POST",
    });
    if (res.ok) void load();
  };

  if (role !== "viewer" && role !== "admin") {
    return (
      <p
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        data-testid="notifications-role-warning"
      >
        投稿者には通知は表示されません（閲覧者/管理者に切り替え）。
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3" data-testid="notification-list">
      {err ? (
        <li className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </li>
      ) : null}
      {rows.map((r) => (
        <li
          key={r.notificationId}
          className="flex justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <div>
            <p className={r.readFlag ? "text-zinc-500 dark:text-zinc-400" : "font-medium text-zinc-900 dark:text-zinc-50"}>
              {r.title}
            </p>
            <p className="mt-1 text-xs text-zinc-400 tabular-nums">{formatWhen(r.createdAt)}</p>
          </div>
          {!r.readFlag ? (
            <button
              type="button"
              className="h-fit shrink-0 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              onClick={() => void markRead(r.notificationId)}
              data-testid={`notification-read-${r.notificationId}`}
            >
              既読
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
