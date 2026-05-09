import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { buildDashboardSummary } from "@/application/dashboard-summary";
import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";
import type { DataStoreSnapshot } from "@/domain/models";

function snap(over: Partial<DataStoreSnapshot>): DataStoreSnapshot {
  return {
    topics: over.topics ?? [],
    messages: over.messages ?? [],
    policyResults: over.policyResults ?? [],
    notificationEvents: over.notificationEvents ?? [],
    notificationViews: over.notificationViews ?? [],
    suggestions: over.suggestions ?? [],
    accounts: over.accounts ?? [],
    blockedWords: over.blockedWords ?? [],
    version: over.version ?? 1,
  };
}

describe("buildDashboardSummary", () => {
  let dir: string;
  let path: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "monku-dash-"));
    path = join(dir, "store.json");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("includes messagesByDay aggregated by UTC date", () => {
    const store = new MonkuJsonStore(path);
    store.write(
      snap({
        topics: [
          {
            topicId: "t1",
            label: "A",
            normalizedLabel: "a",
            createdByRole: "submitter",
            createdAt: "2026-05-01T00:00:00.000Z",
            status: "active",
          },
        ],
        messages: [
          {
            messageId: "m1",
            topicId: "t1",
            bodyRaw: "x",
            bodyDisplay: "x",
            inputType: "text",
            anonymousSubmitterId: "anon",
            createdAt: "2026-05-08T10:00:00.000Z",
            policyApplied: false,
          },
          {
            messageId: "m2",
            topicId: "t1",
            bodyRaw: "y",
            bodyDisplay: "y",
            inputType: "text",
            anonymousSubmitterId: "anon",
            createdAt: "2026-05-08T15:00:00.000Z",
            policyApplied: false,
          },
          {
            messageId: "m3",
            topicId: "t1",
            bodyRaw: "z",
            bodyDisplay: "z",
            inputType: "text",
            anonymousSubmitterId: "anon",
            createdAt: "2026-05-09T02:00:00.000Z",
            policyApplied: false,
          },
        ],
      }),
    );

    const s = buildDashboardSummary(new MonkuJsonStore(path));
    expect(s.messagesByDay).toEqual([
      { date: "2026-05-08", count: 2 },
      { date: "2026-05-09", count: 1 },
    ]);
    expect(s.topicCounts).toEqual([{ topicId: "t1", label: "A", count: 3 }]);
  });
});
