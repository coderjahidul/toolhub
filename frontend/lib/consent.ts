export const CONSENT_KEY = "toolhub-ads-consent";
export const CONSENT_EVENT = "toolhub-consent";

export type AdConsent = "unknown" | "granted" | "denied";

export function readAdConsent(): AdConsent {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const value = localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : "unknown";
}

export function writeAdConsent(value: "granted" | "denied"): void {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
