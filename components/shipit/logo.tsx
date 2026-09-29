import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 font-heading text-xl font-black tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center border-2 border-foreground bg-brand font-mono text-sm leading-none transition-transform group-hover:-rotate-6"
      >
        ↑
      </span>
      <span>
        Ship<span className="italic">It</span>
      </span>
    </Link>
  );
}
