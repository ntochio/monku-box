import Link from "next/link";
import SubmitClient from "./submit-client";

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-xl py-10 px-4 flex flex-col gap-6">
      <Link href="/" className="text-sm text-blue-700 underline">
        ← ホーム
      </Link>
      <h1 className="text-xl font-semibold">投稿</h1>
      <SubmitClient />
    </div>
  );
}
