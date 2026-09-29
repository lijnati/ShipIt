"use client";

import { useActionState, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { shipIt, type ShipState } from "@/app/c/[slug]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { normalizeWebUrl } from "@/lib/challenge";
import { cn } from "@/lib/utils";

const initialState: ShipState = { error: null, shipped: false };

/** Owner-only confirmation flow. The server re-checks everything on submit. */
export function ShipDialog({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(shipIt, initialState);
  const [proofUrl, setProofUrl] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  // Server errors hide once the input changes (until the next response).
  const [editedAfter, setEditedAfter] = useState<ShipState | null>(null);

  const error = clientError ?? (editedAfter === state ? null : state.error);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (normalizeWebUrl(proofUrl) === false) {
      event.preventDefault();
      setClientError("That doesn't look like a web link. Use http(s), e.g. myapp.com.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="brand" size="xl" className="w-full sm:w-auto" />}>
        I shipped it <span aria-hidden="true">🚀</span>
      </DialogTrigger>

      <DialogContent className="gap-6 rounded-none border-2 border-foreground bg-background p-6 shadow-brutal-lg ring-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl leading-none font-black tracking-tighter">
            You actually shipped it?
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Drop the link so the internet can verify you didn&apos;t just move the goalposts.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <input type="hidden" name="slug" value={slug} />
          <div className="flex flex-col gap-2">
            <label htmlFor="proofUrl" className="font-mono text-xs font-bold tracking-wide uppercase">
              Project / proof URL{" "}
              <span className="font-normal text-muted-foreground">— optional</span>
            </label>
            <input
              id="proofUrl"
              name="proofUrl"
              type="url"
              inputMode="url"
              value={proofUrl}
              onChange={(e) => {
                setProofUrl(e.target.value);
                setClientError(null);
                setEditedAfter(state);
              }}
              placeholder="myapp.com"
              autoComplete="url"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby="proofUrl-hint proofUrl-error"
              className="w-full min-w-0 border-2 border-foreground bg-card px-3 py-3 font-mono text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-failed"
            />
            <p id="proofUrl-hint" className="font-mono text-xs text-muted-foreground">
              Deployed site, GitHub release, Product Hunt page, launch post, demo.
            </p>
            <p
              id="proofUrl-error"
              role="alert"
              className={cn("font-mono text-sm font-bold text-destructive", !error && "sr-only")}
            >
              {error}
            </p>
          </div>

          <DialogFooter className="mx-0 mb-0 rounded-none border-t-2 border-foreground bg-transparent p-0 pt-5">
            <DialogClose render={<Button type="button" variant="paper" size="lg" />}>
              Not yet
            </DialogClose>
            <Button type="submit" variant="brand" size="lg" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                  Shipping…
                </>
              ) : (
                "Yep, I shipped it"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
