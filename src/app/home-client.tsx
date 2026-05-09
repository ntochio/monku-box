"use client";

import Link from "next/link";
import type { Role } from "@/domain/role";
import { usePocRole, usePocRoleSetter } from "@/lib/poc-role";

const nav = [
  { href: "/submit", label: "投稿", hint: "topic と投稿内容（文字起こし欄に音声／テキスト）", testId: "home-link-submit" },
  { href: "/messages", label: "メッセージ一覧", hint: "閲覧者・管理者", testId: "home-link-messages" },
  { href: "/dashboard", label: "ダッシュボード", hint: "集計と改善提案", testId: "home-link-dashboard" },
  { href: "/notifications", label: "通知", hint: "閲覧者・管理者", testId: "home-link-notifications" },
  { href: "/admin", label: "管理", hint: "アカウント・辞書", testId: "home-link-admin" },
] as const;

export default function HomeClient() {
  const role = usePocRole();
  const setRole = usePocRoleSetter();

  const changeRole = (r: Role) => {
    setRole(r);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          文句箱（PoC）
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          ロールは PoC 用に HTTP ヘッダ{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            X-Monku-Role
          </code>{" "}
          で擬似します。下の選択が各画面の API 呼び出しに使われます。
        </p>
      </div>

      <label
        className="mb-8 flex max-w-md flex-col gap-2"
        data-testid="home-role-select-label"
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">現在のロール</span>
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950"
          value={role}
          onChange={(e) => changeRole(e.target.value as Role)}
          data-testid="home-role-select"
        >
          <option value="submitter">投稿者</option>
          <option value="viewer">閲覧者</option>
          <option value="admin">管理者</option>
        </select>
      </label>

      <nav className="grid gap-3 sm:grid-cols-2" aria-label="主要画面">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            className="group rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70"
          >
            <span className="block font-medium text-zinc-900 group-hover:text-zinc-950 dark:text-zinc-50">
              {item.label}
            </span>
            <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{item.hint}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
