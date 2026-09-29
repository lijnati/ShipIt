"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Catches unexpected server failures (e.g. the database being unreachable)
// without leaking error details to the page.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="mb-6 inline-block border-2 border-foreground bg-failed px-2 py-1 font-mono text-xs font-bold tracking-wide uppercase">
        Failed to ship
      </p>
      <h1 className="font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance">
        Something broke on our side.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Not your fault. Give it a second and try again.
      </p>
      <Button type="button" variant="ink" size="xl" className="mt-8" onClick={reset}>
        Try again
      </Button>
      {error.digest && (
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          ref: {error.digest}
        </p>
      )}
    </section>
  );
}
