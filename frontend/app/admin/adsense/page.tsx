"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiJson } from "@/lib/auth";
import { AD_SLOTS, emptySettings, type PublicSettings } from "@/lib/settings";

export default function AdSenseSettingsPage() {
  const [form, setForm] = useState<PublicSettings>(emptySettings());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson<PublicSettings>("/api/v1/settings")
      .then((data) => {
        setForm({
          ...emptySettings(),
          ...data,
          adsense: { ...emptySettings().adsense, ...data.adsense, slots: { ...emptySettings().adsense.slots, ...data.adsense.slots } },
        });
      })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load AdSense settings."))
      .finally(() => setLoaded(true));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await apiJson<PublicSettings>("/api/v1/admin/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setForm(saved);
      setMessage("AdSense settings saved. Reload a public page to see the ads.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save AdSense settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <h1 className="text-3xl font-semibold tracking-tight">Google AdSense</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Paste the publisher ID and the ad unit ID for each placement. Ads stay hidden until this is on, a unit ID is set, and the visitor accepts cookies. The same publisher ID is published at /ads.txt.
      </p>
      <label className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3">
        <span>
          <span className="block text-sm font-semibold">Show ads</span>
          <span className="mt-1 block text-sm text-muted">Turn this off to stop every AdSense request.</span>
        </span>
        <input
          type="checkbox"
          checked={form.adsense.enabled}
          onChange={(event) => setForm({ ...form, adsense: { ...form.adsense, enabled: event.target.checked } })}
          className="h-5 w-5 accent-accent"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Publisher ID
        <input
          value={form.adsense.publisher_id}
          onChange={(event) => setForm({ ...form, adsense: { ...form.adsense, publisher_id: event.target.value.trim() } })}
          placeholder="ca-pub-0000000000000000"
          className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2.5"
        />
      </label>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {AD_SLOTS.map((slot) => (
          <label key={slot.id} className="block text-sm font-medium">
            {slot.label}
            <span className="mt-0.5 block text-xs font-normal text-muted">{slot.format}</span>
            <input
              inputMode="numeric"
              value={form.adsense.slots[slot.id] ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  adsense: { ...form.adsense, slots: { ...form.adsense.slots, [slot.id]: event.target.value.trim() } },
                })
              }
              placeholder="Ad unit ID"
              className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2.5"
            />
          </label>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 text-sm text-accent-strong">{message}</p>}
      <button
        type="submit"
        disabled={!loaded || saving}
        className="mt-6 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save AdSense"}
      </button>
    </form>
  );
}
