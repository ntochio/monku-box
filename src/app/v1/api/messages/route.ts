import { submitMessage } from "@/application/submit-message";
import { listMessages } from "@/application/list-messages";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json-response";
import { getRequestRole, requireRole } from "@/infrastructure/auth/session";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["viewer", "admin"]);
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : undefined;
    const items = listMessages({ topicId, limit });
    return jsonOk({ messages: items });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = getRequestRole(request);
    const body = (await request.json()) as {
      topicId?: string;
      topicLabel?: string;
      body?: string;
      inputType?: "text" | "voice";
      anonymousSubmitterId?: string;
    };
    const result = submitMessage({
      role,
      topicId: body.topicId ?? null,
      topicLabel: body.topicLabel ?? "",
      body: body.body ?? "",
      inputType: body.inputType === "voice" ? "voice" : "text",
      anonymousSubmitterId: body.anonymousSubmitterId ?? null,
    });
    return jsonCreated(result);
  } catch (e) {
    return jsonError(e);
  }
}
