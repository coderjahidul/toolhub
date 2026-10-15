import { apiUrl } from "@/lib/format";

export const AD_SLOTS = [
  { id: "header-banner", label: "Header banner", format: "Banner, every page" },
  { id: "home-inline", label: "Home page", format: "Banner, below the tools" },
  { id: "tool-sidebar", label: "Tool sidebar", format: "Rectangle, tool pages" },
  { id: "blog-index", label: "Guides index", format: "Banner, /blog" },
  { id: "blog-sidebar", label: "Guide sidebar", format: "Rectangle, article pages" },
] as const;

export type AdSlotId = (typeof AD_SLOTS)[number]["id"];

export type PublicSettings = {
  adsense: {
    enabled: boolean;
    publisher_id: string;
    slots: Record<string, string>;
  };
  search_console: {
    verification: string;
  };
};

export const emptySettings = (): PublicSettings => ({
  adsense: {
    enabled: false,
    publisher_id: "",
    slots: Object.fromEntries(AD_SLOTS.map((slot) => [slot.id, ""])),
  },
  search_console: { verification: "" },
});

export async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const response = await fetch(apiUrl("/api/v1/settings"), { cache: "no-store" });
    if (!response.ok) {
      return emptySettings();
    }

    return (await response.json()) as PublicSettings;
  } catch {
    return emptySettings();
  }
}
