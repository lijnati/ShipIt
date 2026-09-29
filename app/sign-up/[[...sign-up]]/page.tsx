import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/shipit/auth-shell";
import { routes } from "@/lib/site";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <AuthShell
      kicker="Step zero"
      title="Stop lurking. Start shipping."
      body="Make an account, pick a username, then make a promise the internet can hold you to."
    >
      <SignUp path={routes.signUp} />
    </AuthShell>
  );
}
