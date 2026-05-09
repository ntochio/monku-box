import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("/v1/api/messages", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "monku-msg-api-"));
    process.env.MONKU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.MONKU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it("POST creates message as submitter", async () => {
    const req = new NextRequest("http://localhost/v1/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Monku-Role": "submitter",
      },
      body: JSON.stringify({
        topicLabel: "通勤",
        body: "電車が遅れる",
        inputType: "text",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const j = (await res.json()) as { messageId: string; topicId: string };
    expect(j.messageId).toBeTruthy();
    expect(j.topicId).toBeTruthy();
  });

  it("GET forbidden for submitter", async () => {
    const req = new NextRequest("http://localhost/v1/api/messages", {
      headers: { "X-Monku-Role": "submitter" },
    });
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("GET lists for viewer after post", async () => {
    await POST(
      new NextRequest("http://localhost/v1/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Monku-Role": "submitter",
        },
        body: JSON.stringify({
          topicLabel: "会議",
          body: "長すぎる",
        }),
      }),
    );
    const res = await GET(
      new NextRequest("http://localhost/v1/api/messages", {
        headers: { "X-Monku-Role": "viewer" },
      }),
    );
    expect(res.status).toBe(200);
    const j = (await res.json()) as { messages: unknown[] };
    expect(j.messages.length).toBeGreaterThanOrEqual(1);
  });
});
