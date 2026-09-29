"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shipit/logo";
import { navLinks, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-6 font-mono text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={siteConfig.ctaHref}
            className={buttonVariants({ variant: "ink", size: "lg" })}
          >
            Make a promise
          </Link>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="border-2 border-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      <div
        id="mobile-nav"
        className={cn(
          "border-t-2 border-foreground bg-background md:hidden",
          !open && "hidden",
        )}
      >
        <ul className="flex flex-col px-4 py-2 font-mono text-sm">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block border-b border-foreground/15 py-3"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-4 pt-2 pb-4">
          <Link
            href={siteConfig.ctaHref}
            className={cn(
              buttonVariants({ variant: "ink", size: "xl" }),
              "w-full",
            )}
            onClick={() => setOpen(false)}
          >
            Make a promise
          </Link>
        </div>
      </div>
    </header>
  );
}
