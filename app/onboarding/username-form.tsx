"use client";

import { useActionState, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { claimUsername, type ClaimUsernameState } from "@/app/onboarding/actions";
import { siteConfig } from "@/lib/site";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { cn } from "@/lib/utils";

export function UsernameForm({ suggestion }: { suggestion: string }) {
  const [value, setValue] = useState(suggestion);
  const [state, formAction, pending] = useActionState<
    ClaimUsernameState,
    FormData
  >(claimUsername, { error: null, username: suggestion });

  const normalized = normalizeUsername(value);
  const validation = validateUsername(value);
  const clientError = value.length > 0 && !validation.ok ? validation.error : null;
  // Only show a server error while the input still matches what was submitted.
  const serverError =
    state.error && normalizeUsername(state.username) === normalized
      ? state.error
      : null;
  const error = clientError ?? serverError;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="font-mono text-xs font-bold tracking-wide uppercase"
        >
          Username
        </label>
        <div
          className={cn(
            "flex items-center border-2 border-foreground bg-card focus-within:ring-3 focus-within:ring-ring/50",
            error && "border-failed",
          )}
        >
          <span
            aria-hidden="true"
            className="self-stretch border-r-2 border-inherit bg-secondary px-3 py-3 font-mono text-lg font-bold"
          >
            @
          </span>
          <input
            id="username"
            name="username"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase())}
            placeholder="yourname"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={40}
            required
            aria-invalid={error ? true : undefined}
            aria-describedby="username-hint username-error"
            className="w-full min-w-0 bg-transparent px-3 py-3 font-mono text-lg outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <p id="username-hint" className="font-mono text-xs text-muted-foreground">
          3–24 characters. Lowercase letters, numbers, underscores.
        </p>
        <p
          id="username-error"
          role="alert"
          className={cn(
            "font-mono text-sm font-bold text-destructive",
            !error && "sr-only",
          )}
        >
          {error}
        </p>
      </div>

      <div className="border-2 border-dashed border-foreground/40 px-4 py-3">
        <p className="font-mono text-xs text-muted-foreground uppercase">
          Your public profile
        </p>
        <p className="mt-1 font-mono text-sm break-all">
          {siteConfig.domain}/u/
          <span className="bg-active px-0.5 font-bold">
            {normalized || "yourname"}
          </span>
        </p>
      </div>

      <Button
        type="submit"
        variant="brand"
        size="xl"
        disabled={pending || !validation.ok}
        className="w-full sm:w-auto sm:self-start"
      >
        {pending ? (
          <>
            <LoaderCircle aria-hidden="true" className="animate-spin" />
            Claiming…
          </>
        ) : (
          <>
            Claim this username
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
