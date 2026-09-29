"use client";

import { useActionState, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createChallenge, type CreateChallengeState } from "@/app/new/actions";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  charLength,
  combineLocalDateTime,
  validateChallenge,
  type ChallengeField,
  type ChallengeFieldErrors,
} from "@/lib/challenge";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const initialState: CreateChallengeState = { errors: {}, formError: null };

// Checked in this order; the first invalid field gets focus.
const fieldOrder: ChallengeField[] = ["title", "deadline", "description", "projectUrl"];
const focusTarget: Record<ChallengeField, string> = {
  title: "title",
  deadline: "deadline-date",
  description: "description",
  projectUrl: "projectUrl",
};

const inputClass =
  "w-full min-w-0 border-2 border-foreground bg-card px-3 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-failed";
const labelClass = "font-mono text-xs font-bold tracking-wide uppercase";

export function ChallengeForm() {
  const [state, formAction, pending] = useActionState(createChallenge, initialState);
  const hydrated = useHydrated();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  const [clientErrors, setClientErrors] = useState<ChallengeFieldErrors>({});
  // Server errors hide once their field is edited (until the next response).
  const [editedAfter, setEditedAfter] = useState<
    Partial<Record<ChallengeField, CreateChallengeState>>
  >({});

  const deadline = combineLocalDateTime(date, time)?.toISOString() ?? "";

  const errorFor = (name: ChallengeField) =>
    clientErrors[name] ?? (editedAfter[name] === state ? undefined : state.errors[name]);

  const touched = (name: ChallengeField) => {
    setClientErrors((prev) => ({ ...prev, [name]: undefined }));
    setEditedAfter((prev) => ({ ...prev, [name]: state }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validateChallenge({ title, deadline, description, projectUrl }, new Date());
    if (result.ok) {
      setClientErrors({});
      return; // let the server action run
    }
    event.preventDefault();
    setClientErrors(result.errors);
    const first = fieldOrder.find((name) => result.errors[name]);
    if (first) document.getElementById(focusTarget[first])?.focus();
  }

  const timeZone = hydrated ? Intl.DateTimeFormat().resolvedOptions().timeZone : null;
  const zoneLabel = hydrated
    ? new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value
    : null;
  const today = hydrated ? toDateInputValue(new Date()) : undefined;

  const titleError = errorFor("title");
  const deadlineError = errorFor("deadline");
  const descriptionError = errorFor("description");
  const projectUrlError = errorFor("projectUrl");

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <input type="hidden" name="deadline" value={deadline} />

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className={labelClass}>
          What are you shipping?
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            touched("title");
          }}
          placeholder="Launch my landing page"
          maxLength={TITLE_MAX_LENGTH + 20}
          autoComplete="off"
          required
          aria-invalid={titleError ? true : undefined}
          aria-describedby="title-error"
          className={cn(inputClass, "font-heading text-lg font-bold")}
        />
        <FieldError id="title-error" message={titleError} />
      </div>

      {/* Deadline */}
      <fieldset className="flex flex-col gap-2" aria-describedby="deadline-zone deadline-error">
        <legend className={cn(labelClass, "mb-2")}>Deadline</legend>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-1">
            <label htmlFor="deadline-date" className="sr-only">
              Date
            </label>
            <input
              id="deadline-date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                setDate(e.target.value);
                touched("deadline");
              }}
              required
              aria-invalid={deadlineError ? true : undefined}
              className={cn(inputClass, "font-mono")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="deadline-time" className="sr-only">
              Time
            </label>
            <input
              id="deadline-time"
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                touched("deadline");
              }}
              required
              aria-invalid={deadlineError ? true : undefined}
              className={cn(inputClass, "font-mono sm:w-40")}
            />
          </div>
        </div>
        <p id="deadline-zone" className="font-mono text-xs text-muted-foreground">
          {timeZone
            ? `Your timezone: ${timeZone}${zoneLabel ? ` (${zoneLabel})` : ""}. Everyone else sees it in theirs.`
            : "In your local timezone."}
        </p>
        <FieldError id="deadline-error" message={deadlineError} />
      </fieldset>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="description" className={labelClass}>
            Description <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <span
            aria-hidden="true"
            className={cn(
              "font-mono text-xs text-muted-foreground tabular-nums",
              charLength(description.trim()) > DESCRIPTION_MAX_LENGTH && "font-bold text-destructive",
            )}
          >
            {charLength(description.trim())}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            touched("description");
          }}
          rows={4}
          aria-invalid={descriptionError ? true : undefined}
          aria-describedby="description-hint description-error"
          className={cn(inputClass, "resize-y")}
        />
        <p id="description-hint" className="font-mono text-xs text-muted-foreground">
          What&apos;s included? Keep it specific enough that Future You can&apos;t cheat.
        </p>
        <FieldError id="description-error" message={descriptionError} />
      </div>

      {/* Project URL */}
      <div className="flex flex-col gap-2">
        <label htmlFor="projectUrl" className={labelClass}>
          Project URL <span className="font-normal text-muted-foreground">— optional</span>
        </label>
        <input
          id="projectUrl"
          name="projectUrl"
          type="url"
          inputMode="url"
          value={projectUrl}
          onChange={(e) => {
            setProjectUrl(e.target.value);
            touched("projectUrl");
          }}
          placeholder="myapp.com"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={projectUrlError ? true : undefined}
          aria-describedby="projectUrl-error"
          className={cn(inputClass, "font-mono")}
        />
        <FieldError id="projectUrl-error" message={projectUrlError} />
      </div>

      {state.formError && (
        <p
          role="alert"
          className="border-2 border-foreground bg-failed px-4 py-3 font-mono text-sm font-bold"
        >
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t-2 border-foreground pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted-foreground">
          Public the moment you hit the button. No take-backs.
        </p>
        <Button type="submit" variant="brand" size="xl" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <LoaderCircle aria-hidden="true" className="animate-spin" />
              Going public…
            </>
          ) : (
            <>
              Make it public
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  return (
    <p
      id={id}
      role="alert"
      className={cn("font-mono text-sm font-bold text-destructive", !message && "sr-only")}
    >
      {message}
    </p>
  );
}

/** "YYYY-MM-DD" for the local date, as <input type="date"> expects. */
function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
