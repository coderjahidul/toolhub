import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { AuthProvider } from "@/components/AuthProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { siteUrl } from "@/lib/format";
import { fetchPublicSettings } from "@/lib/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings();
  const verification = settings.search_console.verification;

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: "ToolHub — Free Image, PDF, and Developer Tools",
      template: "%s · ToolHub",
    },
    description:
      "Compress and resize images, merge and compress PDFs, format JSON, and generate passwords. Free online tools from ToolHub.",
    openGraph: {
      title: "ToolHub — Free Image, PDF, and Developer Tools",
      description:
        "Compress and resize images, merge and compress PDFs, format JSON, and generate passwords.",
      url: "/",
      siteName: "ToolHub",
      type: "website",
    },
    verification: verification ? { google: verification } : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground" suppressHydrationWarning>
        <AuthProvider>
          <SiteSettingsProvider>
            <SiteHeader />
            <AdSlot slot="header-banner" format="banner" className="mx-auto w-full max-w-[1280px] px-4 pt-4 sm:px-6" />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CookieConsent />
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
