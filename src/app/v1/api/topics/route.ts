import { ValidationError } from "@/application/errors";
import { addTopic, listTopics } from "@/application/list-topics";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json-response";
import { getRequestRole } from "@/infrastructure/auth/session";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    return jsonOk({ topics: listTopics() });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = getRequestRole(request);
    const body = (await request.json()) as { label?: string };
    if (!body.label?.trim()) {
      return jsonError(new ValidationError("label が必要です"));
    }
    const topic = addTopic(body.label, role);
    return jsonCreated({ topic });
  } catch (e) {
    return jsonError(e);
  }
}
