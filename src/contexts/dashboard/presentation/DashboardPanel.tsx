"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { Role } from "@/domain/role";
import { monkuFetch } from "@/lib/client-api";
import { MessagesTimelineBarChart } from "@/contexts/dashboard/presentation/MessagesTimelineBarChart";
import { TopicPieChart } from "@/contexts/dashboard/presentation/TopicPieChart";

type Summary = {
  topicCounts: { topicId: string; label: string; count: number }[];
  messagesByDay: { date: string; count: number }[];
  suggestions: {
    suggestionId: string;
    topicId: string;
    summaryText: string;
    evidenceMetrics: { count: number; period: string };
    generatedAt: string;
  }[];
};

export function DashboardPanel({ role }: { role: Role }) {
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await monkuFetch("/v1/api/dashboard/summary", role);
    if (!res.ok) {
      setErr("ダッシュボードを取得できません（閲覧者/管理者ロールが必要です）。");
      setData(null);
      return;
    }
    setData((await res.json()) as Summary);
  }, [role]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  if (role !== "viewer" && role !== "admin") {
    return (
      <p
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        data-testid="dashboard-role-warning"
      >
        閲覧者または管理者ロールに切り替えてください。
      </p>
    );
  }

  if (err) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
        {err}
      </p>
    );
  }
  if (!data) return <p className="text-sm text-zinc-500">読み込み中…</p>;

  return (
    <div className="flex flex-col gap-8" data-testid="dashboard-panel">
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          topic 別件数
        </h2>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          円グラフは件数が 1 件以上の topic のみ表示します。
        </p>
        <TopicPieChart items={data.topicCounts} />
        <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          件数リスト
        </h3>
        <ul className="flex flex-col gap-2 text-sm">
          {data.topicCounts.map((t) => (
            <li
              key={t.topicId}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-zinc-950/80"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{t.label}</span>
              <span className="tabular-nums text-zinc-600 dark:text-zinc-400">{t.count} 件</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          日別投稿件数
        </h2>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          メッセージの <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">createdAt</code> を{" "}
          <strong>UTC</strong> の暦日（YYYY-MM-DD）で集計した棒グラフです。
        </p>
        <MessagesTimelineBarChart series={data.messagesByDay} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          改善提案
        </h2>
        <div className="flex flex-col gap-3">
          {data.suggestions.map((s) => (
            <article
              key={s.suggestionId}
              className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
              data-testid="dashboard-suggestion-card"
            >
              <p className="leading-relaxed text-zinc-900 dark:text-zinc-100">{s.summaryText}</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                根拠: {s.evidenceMetrics.count} 件 / {s.evidenceMetrics.period}
              </p>
            </article>
          ))}
        </div>
      </section>

      <p
        className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
        data-testid="dashboard-aggregation-footnote"
      >
        <strong>件数の意味（PoC）</strong>: グラフとリストの数字は、保存された<strong>投稿メッセージの件数</strong>です。同一の人からの連続投稿や、似た内容の投稿があっても 1
        件ずつ数えます。将来はログインや Slack などで投稿者を識別したうえでの集計や、重複の扱いを検討する予定です（設計はリポジトリ内の Inception 資料「集計・連投・重複」に記載）。
      </p>
    </div>
  );
}
