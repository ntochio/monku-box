import { createAccount, listAccounts } from "@/application/accounts";
import { ValidationError } from "@/application/errors";
import { jsonCreated, jsonError, jsonOk } from "@/lib/http/json-response";
import { requireRole } from "@/infrastructure/auth/session";
import type { Role } from "@/domain/role";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["admin"]);
    return jsonOk({ accounts: listAccounts() });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireRole(request, ["admin"]);
    const body = (await request.json()) as { email?: string; role?: Role };
    if (!body.email?.trim()) {
      return jsonError(new ValidationError("email が必要です"));
    }
    if (!body.role) {
      return jsonError(new ValidationError("role が必要です"));
    }
    const acc = createAccount(body.email, body.role);
    return jsonCreated({ account: acc });
  } catch (e) {
    return jsonError(e);
  }
}
