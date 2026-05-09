import { listNotificationsForRole } from "@/application/notifications";
import { jsonError, jsonOk } from "@/lib/http/json-response";
import { requireRole } from "@/infrastructure/auth/session";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const role = requireRole(request, ["viewer", "admin"]);
    return jsonOk({ notifications: listNotificationsForRole(role) });
  } catch (e) {
    return jsonError(e);
  }
}
