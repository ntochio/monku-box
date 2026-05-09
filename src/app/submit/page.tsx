import { PageShell } from "@/components/page-shell";
import SubmitClient from "./submit-client";

export default function SubmitPage() {
  return (
    <PageShell title="投稿" description="匿名でメッセージを投稿します（投稿者ロール）。">
      <SubmitClient />
    </PageShell>
  );
}
