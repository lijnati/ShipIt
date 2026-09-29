"use client";

import { useState } from "react";
import Link from "next/link";
import { ClerkLoading, Show, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shipit/logo";
import { navLinks, routes } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

const signedOutLinks: NavItem[] = [
  ...navLinks,
  { href: routes.signIn, label: "Sign in" },
];
const signedInLinks: NavItem[] = [
  ...navLinks,
  { href: routes.dashboard, label: "Dashboard" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          <Show when="signed-out">
            <LinkList items={signedOutLinks} />
            <Link
              href={routes.newChallenge}
              className={buttonVariants({ variant: "brand", size: "lg" })}
            >
              Put my reputation on the line
            </Link>
          </Show>
          <Show when="signed-in">
            <LinkList items={signedInLinks} />
            <Link
              href={routes.newChallenge}
              className={buttonVariants({ variant: "ink", size: "lg" })}
            >
              New challenge
            </Link>
            <UserButton />
          </Show>
          <ClerkLoading>
            <span aria-hidden="true" className="h-9 w-40 bg-secondary" />
          </ClerkLoading>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="border-2 border-foreground"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={cn(
          "border-t-2 border-foreground bg-background md:hidden",
          !open && "hidden",
        )}
      >
        <Show when="signed-out">
          <MobileMenu
            items={signedOutLinks}
            cta="Put my reputation on the line"
            ctaVariant="brand"
            onNavigate={close}
          />
        </Show>
        <Show when="signed-in">
          <MobileMenu
            items={signedInLinks}
            cta="New challenge"
            ctaVariant="ink"
            onNavigate={close}
          />
        </Show>
      </div>
    </header>
  );
}

function LinkList({ items }: { items: NavItem[] }) {
  return (
    <ul className="flex items-center gap-6 font-mono text-sm">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="underline-offset-4 hover:underline">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobileMenu({
  items,
  cta,
  ctaVariant,
  onNavigate,
}: {
  items: NavItem[];
  cta: string;
  ctaVariant: "brand" | "ink";
  onNavigate: () => void;
}) {
  return (
    <>
      <ul className="flex flex-col px-4 py-2 font-mono text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block border-b border-foreground/15 py-3"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="px-4 pt-2 pb-4">
        <Link
          href={routes.newChallenge}
          className={cn(
            buttonVariants({ variant: ctaVariant, size: "xl" }),
            "w-full",
          )}
          onClick={onNavigate}
        >
          {cta}
        </Link>
      </div>
    </>
  );
}
