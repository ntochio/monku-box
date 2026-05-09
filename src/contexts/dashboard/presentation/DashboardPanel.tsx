"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { Role } from "@/domain/role";
import { monkuFetch } from "@/lib/client-api";

type Summary = {
  topicCounts: { topicId: string; label: string; count: number }[];
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
      <p className="text-amber-800" data-testid="dashboard-role-warning">
        閲覧者または管理者ロールに切り替えてください。
      </p>
    );
  }

  if (err) {
    return <p className="text-red-700">{err}</p>;
  }
  if (!data) return <p>読み込み中…</p>;

  return (
    <div className="flex flex-col gap-8" data-testid="dashboard-panel">
      <section>
        <h2 className="font-medium mb-2">topic 別件数</h2>
        <ul className="list-disc pl-5 text-sm">
          {data.topicCounts.map((t) => (
            <li key={t.topicId}>
              {t.label}: {t.count}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium mb-2">改善提案</h2>
        <div className="flex flex-col gap-3">
          {data.suggestions.map((s) => (
            <article
              key={s.suggestionId}
              className="border rounded p-3 text-sm"
              data-testid="dashboard-suggestion-card"
            >
              <p>{s.summaryText}</p>
              <p className="text-zinc-500 mt-1">
                根拠: {s.evidenceMetrics.count} 件 / {s.evidenceMetrics.period}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
