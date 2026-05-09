import { getBlockedWords, updateBlockedWords } from "@/application/accounts";
import { jsonError, jsonOk } from "@/lib/http/json-response";
import { requireRole } from "@/infrastructure/auth/session";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["admin"]);
    return jsonOk({ blockedWords: getBlockedWords() });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireRole(request, ["admin"]);
    const body = (await request.json()) as { words?: string[] };
    const words = Array.isArray(body.words) ? body.words : [];
    const out = updateBlockedWords(words);
    return jsonOk(out);
  } catch (e) {
    return jsonError(e);
  }
}
