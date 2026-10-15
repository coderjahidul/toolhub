"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CONSENT_EVENT, readAdConsent, writeAdConsent, type AdConsent } from "@/lib/consent";
import { apiUrl } from "@/lib/format";
import { emptySettings, type PublicSettings } from "@/lib/settings";

const SettingsContext = createContext<PublicSettings>(emptySettings());

type ConsentState = {
  consent: AdConsent;
  choosing: boolean;
  ready: boolean;
  setConsent: (value: "granted" | "denied") => void;
  requestChoice: () => void;
  closeChoice: () => void;
};

const ConsentContext = createContext<ConsentState>({
  consent: "unknown",
  choosing: false,
  ready: false,
  setConsent: () => undefined,
  requestChoice: () => undefined,
  closeChoice: () => undefined,
});

export function useSiteSettings(): PublicSettings {
  return useContext(SettingsContext);
}

export function useSiteConsent(): ConsentState {
  return useContext(ConsentContext);
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(emptySettings());
  const [consent, setConsentState] = useState<AdConsent>("unknown");
  const [choosing, setChoosing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(apiUrl("/api/v1/settings"), { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PublicSettings | null) => {
        if (active && data?.adsense && data.search_console) {
          setSettings(data);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      setConsentState(readAdConsent());
      setReady(true);
    };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setConsent = useCallback((value: "granted" | "denied") => {
    writeAdConsent(value);
    setConsentState(value);
    setChoosing(false);
  }, []);

  const requestChoice = useCallback(() => setChoosing(true), []);
  const closeChoice = useCallback(() => setChoosing(false), []);

  const publisher = settings.adsense.enabled && consent === "granted" ? settings.adsense.publisher_id : "";

  return (
    <SettingsContext.Provider value={settings}>
      <ConsentContext.Provider value={{ consent, choosing, ready, setConsent, requestChoice, closeChoice }}>
        {publisher && (
          <Script
            id="toolhub-adsense"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisher)}`}
            crossOrigin="anonymous"
          />
        )}
        {children}
      </ConsentContext.Provider>
    </SettingsContext.Provider>
  );
}
