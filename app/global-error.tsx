"use client";

import "./globals.css";

// Last-resort boundary for errors in the root layout itself (app/error.tsx
// handles everything below it). Must render its own <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 font-sans text-foreground">
        <main className="w-full max-w-lg">
          <p className="inline-block border-2 border-foreground bg-failed px-2 py-1 font-mono text-xs font-bold tracking-wide uppercase">
            Failed to ship
          </p>
          <h1 className="mt-6 text-5xl leading-[0.95] font-black tracking-tighter">
            ShipIt fell over.
          </h1>
          <p className="mt-4 text-lg">Not your fault. Give it a second and try again.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 border-2 border-foreground bg-foreground px-5 py-3 font-bold text-background"
          >
            Try again
          </button>
          {error.digest && <p className="mt-6 font-mono text-xs">ref: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
