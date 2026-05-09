"use client";

import { AdminPanel } from "@/contexts/admin/presentation/AdminPanel";
import { usePocRole } from "@/lib/poc-role";

export default function AdminClient() {
  const role = usePocRole();
  return <AdminPanel role={role} />;
}
