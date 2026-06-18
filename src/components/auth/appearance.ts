import type { ComponentProps } from "react";
import type { SignIn } from "@clerk/nextjs";

type Appearance = NonNullable<ComponentProps<typeof SignIn>["appearance"]>;

/**
 * Aurora-styled Clerk appearance for the split-screen auth pages. The card is
 * made transparent/borderless so it blends into the right-hand form panel; the
 * primary button picks up the indigo→violet brand gradient. Element keys that a
 * given Clerk version doesn't recognize are ignored harmlessly.
 */
export const authAppearance: Appearance = {
  variables: {
    colorPrimary: "#6d4aff",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-jakarta)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full border-none shadow-none",
    card: "w-full border-none bg-transparent p-0 shadow-none",
    headerTitle: "font-display text-3xl font-bold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "h-11 rounded-xl border-border",
    dividerLine: "bg-border",
    formFieldInput: "h-11 rounded-xl",
    formButtonPrimary:
      "h-12 rounded-xl bg-gradient-to-br from-[#6d4aff] to-[#a259ff] text-[15px] font-semibold normal-case shadow-aurora hover:opacity-90",
    footerActionLink: "text-primary font-semibold",
  },
};
