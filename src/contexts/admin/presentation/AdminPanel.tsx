"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { Role } from "@/domain/role";
import { monkuFetch } from "@/lib/client-api";

type Account = { accountId: string; email: string; role: Role };

export function AdminPanel({ role }: { role: Role }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [words, setWords] = useState<string>("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("viewer");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [a, w] = await Promise.all([
      monkuFetch("/v1/api/accounts", role),
      monkuFetch("/v1/api/policy/words", role),
    ]);
    if (a.ok) {
      const d = (await a.json()) as { accounts: Account[] };
      setAccounts(d.accounts ?? []);
    }
    if (w.ok) {
      const d = (await w.json()) as { blockedWords: string[] };
      setWords((d.blockedWords ?? []).join("\n"));
    }
  }, [role]);

  useEffect(() => {
    if (role !== "admin") return;
    startTransition(() => {
      void load();
    });
  }, [load, role]);

  const addAccount = async () => {
    setMsg(null);
    const res = await monkuFetch("/v1/api/accounts", role, {
      method: "POST",
      body: JSON.stringify({ email, role: newRole }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg((data as { error?: { message?: string } }).error?.message ?? "失敗");
      return;
    }
    setMsg("アカウントを追加しました");
    setEmail("");
    void load();
  };

  const saveWords = async () => {
    setMsg(null);
    const list = words
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await monkuFetch("/v1/api/policy/words", role, {
      method: "POST",
      body: JSON.stringify({ words: list }),
    });
    if (!res.ok) {
      setMsg("辞書の保存に失敗しました");
      return;
    }
    setMsg("禁止語リストを更新しました");
  };

  if (role !== "admin") {
    return (
      <p
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        data-testid="admin-role-warning"
      >
        管理者ロールが必要です。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-testid="admin-panel">
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          アカウント一覧
        </h2>
        <ul className="mb-6 list-none space-y-2 text-sm">
          {accounts.map((a) => (
            <li
              key={a.accountId}
              className="flex justify-between rounded-lg bg-white px-3 py-2 dark:bg-zinc-950/80"
            >
              <span className="text-zinc-900 dark:text-zinc-100">{a.email}</span>
              <span className="text-zinc-500 dark:text-zinc-400">{a.role}</span>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">アカウント追加</h3>
        <div className="flex max-w-md flex-col gap-2">
          <input
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="admin-account-email"
          />
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-950"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as Role)}
            data-testid="admin-account-role"
          >
            <option value="submitter">submitter</option>
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
          </select>
          <button
            type="button"
            className="w-fit rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={() => void addAccount()}
            data-testid="admin-account-submit"
          >
            追加
          </button>
        </div>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          禁止語（1 行 1 語）
        </h2>
        <textarea
          className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          data-testid="admin-blocked-words"
        />
        <button
          type="button"
          className="mt-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          onClick={() => void saveWords()}
          data-testid="admin-words-save"
        >
          保存
        </button>
      </section>
      {msg ? (
        <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800" data-testid="admin-message">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
