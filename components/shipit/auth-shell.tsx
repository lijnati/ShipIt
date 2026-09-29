import type { ReactNode } from "react";

type AuthShellProps = {
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
};

/** Page frame around Clerk's <SignIn /> and <SignUp />. */
export function AuthShell({ kicker, title, body, children }: AuthShellProps) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="mb-6 inline-block border-2 border-foreground bg-card px-2 py-1 font-mono text-xs tracking-wide uppercase">
          <span className="text-brand">●</span> {kicker}
        </p>
        <h1 className="font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">{body}</p>
      </div>
      <div className="flex justify-center lg:justify-end">{children}</div>
    </section>
  );
}
