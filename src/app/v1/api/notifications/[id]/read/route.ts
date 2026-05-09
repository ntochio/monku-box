import { markNotificationRead } from "@/application/notifications";
import { jsonError, jsonOk } from "@/lib/http/json-response";
import { requireRole } from "@/infrastructure/auth/session";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const role = requireRole(request, ["viewer", "admin"]);
    markNotificationRead(id, role);
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
