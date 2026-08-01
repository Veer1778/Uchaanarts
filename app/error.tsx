"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

/**
 * Route error boundary. Next.js renders this in place of any page in this
 * segment that throws during render, so a single failing section can no longer
 * take the whole site down with a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for whatever monitoring is wired up later (Sentry et al).
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div className="max-w-md">
        <p className="label text-muted">Something went wrong</p>
        <h1 className="mt-4 font-display text-[2.2rem] leading-tight">
          We couldn&apos;t load this page.
        </h1>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">
          The problem has been logged. You can try again, or browse the
          collection while we look into it.
        </p>

        {error.digest && (
          <p className="mt-4 text-[11px] text-faint">Reference: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-accent inline-flex items-center gap-2 px-7 py-3 text-[13px]">
            <RotateCw size={14} /> Try again
          </button>
          <Link href="/" className="btn-outline px-7 py-3 text-[13px]">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
