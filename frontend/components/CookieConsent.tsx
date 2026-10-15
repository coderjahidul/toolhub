"use client";

import Link from "next/link";
import { useSiteConsent } from "@/components/SiteSettingsProvider";

export function CookieConsent() {
  const { consent, choosing, ready, setConsent, closeChoice } = useSiteConsent();
  const visible = ready && (consent === "unknown" || choosing);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-card p-4 shadow-lg sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <p className="text-sm leading-6 text-muted">
          ToolHub uses optional Google ads. Accept to load AdSense cookies, or reject to keep the pages ad-free.
          Details are in the{" "}
          <Link href="/cookie-policy" className="font-semibold text-accent-strong hover:underline" onClick={closeChoice}>
            cookie policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-accent"
            onClick={() => setConsent("denied")}
          >
            Reject
          </button>
          <button
            type="button"
            className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
            onClick={() => setConsent("granted")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  const { requestChoice } = useSiteConsent();

  return (
    <button type="button" className="hover:text-white" onClick={requestChoice}>
      Cookie settings
    </button>
  );
}
