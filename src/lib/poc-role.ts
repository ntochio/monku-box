"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Role } from "@/domain/role";

export const ROLE_KEY = "monku-poc-role";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Role {
  if (typeof window === "undefined") return "submitter";
  const s = localStorage.getItem(ROLE_KEY);
  if (s === "viewer" || s === "admin" || s === "submitter") return s;
  return "submitter";
}

function getServerSnapshot(): Role {
  return "submitter";
}

function emit() {
  listeners.forEach((l) => l());
}

/** ホーム等からロール変更時に呼ぶ（同一タブで他コンポーネントへ反映） */
export function setPocRole(role: Role) {
  localStorage.setItem(ROLE_KEY, role);
  emit();
}

export function usePocRole(): Role {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function usePocRoleSetter() {
  return useCallback((role: Role) => {
    setPocRole(role);
  }, []);
}
