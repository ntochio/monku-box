import type { NextRequest } from "next/server";
import { parseRole, type Role } from "@/domain/role";
import { ForbiddenError } from "@/application/errors";

/** PoC: `X-Monku-Role` ヘッダ優先、次に `monku_role` Cookie。未指定は submitter。 */
export function getRequestRole(request: NextRequest): Role {
  const header = request.headers.get("x-monku-role");
  const fromHeader = parseRole(header);
  if (fromHeader) return fromHeader;
  const cookie = request.cookies.get("monku_role")?.value;
  const fromCookie = parseRole(cookie);
  if (fromCookie) return fromCookie;
  return "submitter";
}

export function requireRole(request: NextRequest, allowed: Role[]): Role {
  const r = getRequestRole(request);
  if (!allowed.includes(r)) {
    throw new ForbiddenError();
  }
  return r;
}
