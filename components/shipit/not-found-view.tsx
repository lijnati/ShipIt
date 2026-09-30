import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/site";

type NotFoundViewProps = {
  title: string;
  body: string;
};

/** Shared layout for the 404 pages. */
export function NotFoundView({ title, body }: NotFoundViewProps) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="font-mono text-7xl font-black tracking-tighter sm:text-8xl">404</p>
      <h1 className="mt-6 font-heading text-4xl leading-[0.95] font-black tracking-tighter text-balance sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={routes.newChallenge} className={buttonVariants({ variant: "brand", size: "xl" })}>
          Make a real promise
        </Link>
        <Link href={routes.home} className={buttonVariants({ variant: "paper", size: "xl" })}>
          Back home
        </Link>
      </div>
    </section>
  );
}
