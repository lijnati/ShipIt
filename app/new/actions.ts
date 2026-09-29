"use server";

import { redirect } from "next/navigation";
import type { User } from "@/db/schema";
import { createChallenge as insertChallenge } from "@/db/queries/challenges";
import { getCurrentShipItUser } from "@/lib/auth";
import { validateChallenge, type ChallengeFieldErrors } from "@/lib/challenge";
import { routes } from "@/lib/site";

export type CreateChallengeState = {
  errors: ChallengeFieldErrors;
  formError: string | null;
};

const SAVE_FAILED: CreateChallengeState = {
  errors: {},
  formError: "We couldn't save your promise. Nothing went public — try again in a moment.",
};

const field = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export async function createChallenge(
  _prev: CreateChallengeState,
  formData: FormData,
): Promise<CreateChallengeState> {
  // Authoritative validation on the server clock. Only these four fields are
  // read; anything else in the form (e.g. a smuggled userId) is ignored.
  const result = validateChallenge(
    {
      title: field(formData, "title"),
      deadline: field(formData, "deadline"),
      description: field(formData, "description"),
      projectUrl: field(formData, "projectUrl"),
    },
    new Date(),
  );
  if (!result.ok) return { errors: result.errors, formError: null };

  // Ownership comes from the Clerk session → database user, never the form.
  let user: User | null;
  try {
    user = await getCurrentShipItUser();
  } catch (error) {
    console.error("[new] resolving user failed", error);
    return SAVE_FAILED;
  }
  if (!user) {
    return {
      errors: {},
      formError: "Your session expired. Sign in again — your promise is still in the form.",
    };
  }
  if (!user.username) redirect(routes.onboarding);

  let slug: string;
  try {
    slug = await insertChallenge(user.id, result.data);
  } catch (error) {
    console.error("[new] challenge creation failed", error);
    return SAVE_FAILED;
  }

  redirect(`/c/${slug}`);
}
