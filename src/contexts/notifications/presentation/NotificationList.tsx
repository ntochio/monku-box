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
      <p className="text-amber-800" data-testid="notifications-role-warning">
        投稿者には通知は表示されません（閲覧者/管理者に切り替え）。
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2" data-testid="notification-list">
      {err ? <li className="text-red-700">{err}</li> : null}
      {rows.map((r) => (
        <li
          key={r.notificationId}
          className="border rounded p-3 flex justify-between gap-2 text-sm"
        >
          <div>
            <p className={r.readFlag ? "text-zinc-500" : "font-medium"}>{r.title}</p>
            <p className="text-xs text-zinc-400">{r.createdAt}</p>
          </div>
          {!r.readFlag ? (
            <button
              type="button"
              className="text-blue-700 underline shrink-0"
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
