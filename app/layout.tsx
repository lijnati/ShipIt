import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/shipit/navbar";
import { Footer } from "@/components/shipit/footer";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { routes, siteConfig } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Stop saying you're going to ship it`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Stop saying you're going to ship it.",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Stop saying you're going to ship it.",
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider
          signInUrl={routes.signIn}
          signUpUrl={routes.signUp}
          signInFallbackRedirectUrl={routes.dashboard}
          signUpFallbackRedirectUrl={routes.onboarding}
          afterSignOutUrl={routes.home}
          appearance={clerkAppearance}
        >
          <a
            href="#main"
            className="sr-only z-50 bg-brand px-3 py-2 font-mono text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
