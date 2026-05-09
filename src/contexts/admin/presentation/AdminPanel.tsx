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
      <p className="text-amber-800" data-testid="admin-role-warning">
        管理者ロールが必要です。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-testid="admin-panel">
      <section>
        <h2 className="font-medium mb-2">アカウント一覧</h2>
        <ul className="text-sm list-disc pl-5 mb-4">
          {accounts.map((a) => (
            <li key={a.accountId}>
              {a.email} — {a.role}
            </li>
          ))}
        </ul>
        <h3 className="text-sm font-medium mb-1">アカウント追加（ロール必須）</h3>
        <div className="flex flex-col gap-2 max-w-md">
          <input
            className="border rounded px-2 py-2"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="admin-account-email"
          />
          <select
            className="border rounded px-2 py-2"
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
            className="rounded bg-black text-white px-3 py-2 w-fit"
            onClick={() => void addAccount()}
            data-testid="admin-account-submit"
          >
            追加
          </button>
        </div>
      </section>
      <section>
        <h2 className="font-medium mb-2">禁止語（1 行 1 語）</h2>
        <textarea
          className="border rounded px-2 py-2 w-full min-h-[120px] text-sm"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          data-testid="admin-blocked-words"
        />
        <button
          type="button"
          className="mt-2 rounded bg-zinc-800 text-white px-3 py-2"
          onClick={() => void saveWords()}
          data-testid="admin-words-save"
        >
          保存
        </button>
      </section>
      {msg ? (
        <p className="text-sm" data-testid="admin-message">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
