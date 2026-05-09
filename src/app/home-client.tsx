"use client";

import Link from "next/link";
import type { Role } from "@/domain/role";
import { usePocRole, usePocRoleSetter } from "@/lib/poc-role";

export default function HomeClient() {
  const role = usePocRole();
  const setRole = usePocRoleSetter();

  const changeRole = (r: Role) => {
    setRole(r);
  };

  return (
    <div className="mx-auto max-w-lg flex flex-col gap-6 py-12 px-4">
      <h1 className="text-2xl font-semibold">文句箱（PoC）</h1>
      <p className="text-sm text-zinc-600">
        ロールは PoC 用（ヘッダ <code className="bg-zinc-100 px-1">X-Monku-Role</code>
        ）で擬似します。下の選択が各画面の API 呼び出しに使われます。
      </p>
      <label className="flex flex-col gap-1 text-sm" data-testid="home-role-select-label">
        <span className="font-medium">現在のロール</span>
        <select
          className="border rounded px-2 py-2"
          value={role}
          onChange={(e) => changeRole(e.target.value as Role)}
          data-testid="home-role-select"
        >
          <option value="submitter">投稿者</option>
          <option value="viewer">閲覧者</option>
          <option value="admin">管理者</option>
        </select>
      </label>
      <nav className="flex flex-col gap-2 text-blue-700 underline">
        <Link href="/submit" data-testid="home-link-submit">
          投稿
        </Link>
        <Link href="/dashboard" data-testid="home-link-dashboard">
          ダッシュボード
        </Link>
        <Link href="/notifications" data-testid="home-link-notifications">
          通知
        </Link>
        <Link href="/admin" data-testid="home-link-admin">
          管理（アカウント・辞書）
        </Link>
      </nav>
    </div>
  );
}
