import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/** Brings Clerk's prebuilt UI in line with the ShipIt look: square, inked, loud. */
export const clerkAppearance: Appearance = {
  // Clerk styles go in this layer (declared in globals.css) so Tailwind utilities win.
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#0b0b0b",
    colorBackground: "#ffffff",
    colorDanger: "#e5261b",
    borderRadius: "0",
    fontFamily: "var(--font-archivo)",
  },
  elements: {
    cardBox: "border-2 border-foreground shadow-brutal-lg",
    formButtonPrimary: "font-bold",
    avatarBox: "size-9 border-2 border-foreground",
    userButtonPopoverCard: "border-2 border-foreground shadow-brutal",
  },
};
