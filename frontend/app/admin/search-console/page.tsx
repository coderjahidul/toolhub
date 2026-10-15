"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiJson } from "@/lib/auth";
import { siteUrl } from "@/lib/format";
import { emptySettings, type PublicSettings } from "@/lib/settings";

export default function SearchConsolePage() {
  const [form, setForm] = useState<PublicSettings>(emptySettings());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const sitemap = siteUrl("/sitemap.xml");

  useEffect(() => {
    apiJson<PublicSettings>("/api/v1/settings")
      .then((data) => setForm({ ...emptySettings(), ...data, adsense: { ...emptySettings().adsense, ...data.adsense } }))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load Search Console settings."))
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
      setMessage("Verification saved. In Search Console, click Verify, then submit the sitemap.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the verification code.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <h1 className="text-3xl font-semibold tracking-tight">Google Search Console</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Add the site in Search Console, choose the HTML tag method, and paste the code or the whole meta tag here. ToolHub puts it on every page.
      </p>
      <label className="mt-6 block text-sm font-medium">
        Verification code
        <textarea
          value={form.search_console.verification}
          onChange={(event) => setForm({ ...form, search_console: { verification: event.target.value } })}
          placeholder='content value, or the full <meta> tag'
          className="mt-1 h-28 w-full rounded-xl border border-line bg-background px-3 py-2.5 font-mono text-sm"
        />
      </label>
      <div className="mt-6 rounded-2xl border border-line bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sitemap</p>
        <p className="mt-2 break-all font-mono text-sm">{sitemap}</p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(sitemap);
            setMessage("Sitemap URL copied.");
          }}
          className="mt-3 rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-semibold"
        >
          Copy sitemap URL
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 text-sm text-accent-strong">{message}</p>}
      <button
        type="submit"
        disabled={!loaded || saving}
        className="mt-6 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save verification"}
      </button>
    </form>
  );
}
