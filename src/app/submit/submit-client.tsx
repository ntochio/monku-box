"use client";

import { SubmitForm } from "@/contexts/submission/presentation/SubmitForm";
import { usePocRole } from "@/lib/poc-role";

export default function SubmitClient() {
  const role = usePocRole();
  return <SubmitForm role={role} />;
}
