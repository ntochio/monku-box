import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-2 border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          data-testid="page-shell-back-home"
        >
          ← ホーム
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <div className="pb-12">{children}</div>
    </div>
  );
}
