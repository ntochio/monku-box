export type Role = "submitter" | "viewer" | "admin";

export function parseRole(v: string | null | undefined): Role | null {
  if (v === "submitter" || v === "viewer" || v === "admin") return v;
  return null;
}
