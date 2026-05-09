"use client";

import { DashboardPanel } from "@/contexts/dashboard/presentation/DashboardPanel";
import { usePocRole } from "@/lib/poc-role";

export default function DashboardClient() {
  const role = usePocRole();
  return <DashboardPanel role={role} />;
}
