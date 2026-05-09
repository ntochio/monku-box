"use client";

import type { Role } from "@/domain/role";

export async function monkuFetch(
  path: string,
  role: Role,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Monku-Role", role);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(path, { ...init, headers });
}
