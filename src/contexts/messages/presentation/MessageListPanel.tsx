"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import type { Role } from "@/domain/role";
import type { MessageRecord } from "@/domain/models";
import { monkuFetch } from "@/lib/client-api";

type Topic = { topicId: string; label: string };

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

export function MessageListPanel({ role }: { role: Role }) {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const topicLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of topics) m.set(t.topicId, t.label);
    return m;
  }, [topics]);

  const loadTopics = useCallback(async () => {
    const res = await monkuFetch("/v1/api/topics", role);
    if (!res.ok) return;
    const data = (await res.json()) as { topics: Topic[] };
    setTopics(data.topics ?? []);
  }, [role]);

  const loadMessages = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const q = topicFilter ? `?topicId=${encodeURIComponent(topicFilter)}` : "";
    const res = await monkuFetch(`/v1/api/messages${q}`, role);
    setLoading(false);
    if (!res.ok) {
      setErr("メッセージ一覧を取得できません（閲覧者または管理者ロールが必要です）。");
      setMessages([]);
      return;
    }
    const data = (await res.json()) as { messages: MessageRecord[] };
    setMessages(data.messages ?? []);
  }, [role, topicFilter]);

  useEffect(() => {
    startTransition(() => {
      void loadTopics();
    });
  }, [loadTopics]);

  useEffect(() => {
    if (role !== "viewer" && role !== "admin") {
      queueMicrotask(() => {
        setLoading(false);
        setMessages([]);
        setErr(null);
      });
      return;
    }
    startTransition(() => {
      void loadMessages();
    });
  }, [loadMessages, role]);

  if (role !== "viewer" && role !== "admin") {
    return (
      <p
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        data-testid="messages-role-warning"
      >
        メッセージ一覧は閲覧者または管理者ロールで表示できます。ホームでロールを切り替えてください。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6" data-testid="messages-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            topic で絞り込み
          </span>
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:focus:border-zinc-500"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            data-testid="messages-topic-filter"
          >
            <option value="">すべての topic</option>
            {topics.map((t) => (
              <option key={t.topicId} value={t.topicId}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          onClick={() => void loadMessages()}
          data-testid="messages-refresh"
        >
          再読み込み
        </button>
      </div>

      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">読み込み中…</p>
      ) : !err && messages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          表示するメッセージがありません。投稿がある topic を選ぶか、フィルタを「すべて」にしてください。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li key={m.messageId}>
              <article
                className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                data-testid="messages-row"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="rounded-full bg-zinc-200/80 px-2.5 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {topicLabelById.get(m.topicId) ?? m.topicId}
                  </span>
                  <span
                    className={
                      m.inputType === "voice"
                        ? "rounded-full bg-violet-100 px-2 py-0.5 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }
                  >
                    {m.inputType === "voice" ? "音声" : "テキスト"}
                  </span>
                  {m.policyApplied ? (
                    <span className="text-zinc-400">Policy 適用済み</span>
                  ) : null}
                  <span className="ml-auto tabular-nums">{formatWhen(m.createdAt)}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
                  {m.bodyDisplay}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
