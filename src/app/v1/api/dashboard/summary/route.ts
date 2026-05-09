import { buildDashboardSummary } from "@/application/dashboard-summary";
import { jsonError, jsonOk } from "@/lib/http/json-response";
import { requireRole } from "@/infrastructure/auth/session";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["viewer", "admin"]);
    return jsonOk(buildDashboardSummary());
  } catch (e) {
    return jsonError(e);
  }
}
