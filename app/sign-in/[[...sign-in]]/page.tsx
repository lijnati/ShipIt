import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/shipit/auth-shell";
import { routes } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell
      kicker="Welcome back"
      title="The clock missed you."
      body="Sign in to check on your promises. Or to see who's been falling behind."
    >
      <SignIn path={routes.signIn} />
    </AuthShell>
  );
}
