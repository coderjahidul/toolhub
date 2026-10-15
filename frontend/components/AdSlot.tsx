"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}
import { useSiteConsent, useSiteSettings } from "@/components/SiteSettingsProvider";

type AdSlotProps = {
  slot: string;
  format: "banner" | "rectangle";
  className?: string;
};

export function AdSlot({ slot, format, className = "" }: AdSlotProps) {
  const settings = useSiteSettings();
  const { consent } = useSiteConsent();
  const publisher = settings.adsense.enabled && consent === "granted" ? settings.adsense.publisher_id : "";
  const unit = settings.adsense.slots[slot] ?? "";
  const live = publisher !== "" && unit !== "";

  useEffect(() => {
    if (!live) {
      return;
    }

    try {
      const ads = window.adsbygoogle ?? [];
      window.adsbygoogle = ads;
      ads.push({});
    } catch {
      // AdSense rejects a second push on the same unit during fast refresh.
    }
  }, [live, publisher, unit]);

  if (!live) {
    return null;
  }

  return (
    <aside className={`ad-slot ad-slot-live ad-slot-${format} ${className}`} data-ad-slot={slot} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisher}
        data-ad-slot={unit}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
