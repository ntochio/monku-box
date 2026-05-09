import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { MonkuJsonStore, emptyStore } from "./json-store";
import { createId } from "@/domain/ids";

describe("MonkuJsonStore", () => {
  let dir: string;
  let path: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "monku-"));
    path = join(dir, "store.json");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("persists round-trip", () => {
    const store = new MonkuJsonStore(path);
    store.withTransaction((d) => {
      d.topics.push({
        topicId: createId(),
        label: "通勤",
        normalizedLabel: "通勤",
        createdByRole: "submitter",
        createdAt: new Date().toISOString(),
        status: "active",
      });
    });
    const s2 = new MonkuJsonStore(path).read();
    expect(s2.topics).toHaveLength(1);
  });

  it("emptyStore has defaults", () => {
    const e = emptyStore();
    expect(e.blockedWords.length).toBeGreaterThan(0);
  });
});
