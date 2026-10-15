"use client";

import { useEffect, useState } from "react";
import { DashboardFrame } from "@/components/DashboardFrame";
import { apiJson } from "@/lib/auth";

type ApiKeyRow = {
  id: number;
  name: string;
  prefix: string;
  last_used_at: string | null;
  created_at: string;
};

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[] | null>(null);
  const [name, setName] = useState("My script");
  const [plain, setPlain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await apiJson<{ keys: ApiKeyRow[] }>("/api/v1/account/api-keys");
    setKeys(data.keys);
  }

  useEffect(() => {
    void load().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load keys."));
  }, []);

  async function createKey(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const data = await apiJson<{ plain_text: string }>("/api/v1/account/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setPlain(data.plain_text);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the key.");
    }
  }

  async function revoke(id: number) {
    await apiJson(`/api/v1/account/api-keys/${id}`, { method: "DELETE" });
    setKeys((current) => current?.filter((key) => key.id !== id) ?? []);
  }

  return (
    <DashboardFrame>
      <p className="text-sm text-muted">
        Send the key as <span className="font-mono">Authorization: Bearer thub_…</span> on the same image and PDF endpoints. Billing for keys comes later. The free daily limit still applies.
      </p>
      <form onSubmit={createKey} className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-medium">
          Key name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white">
          Create key
        </button>
      </form>
      {plain && (
        <p className="mt-4 break-all rounded-xl border border-accent bg-card p-4 font-mono text-sm">
          Copy this key now. It will not be shown again.
          <span className="mt-2 block">{plain}</span>
        </p>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {keys?.length === 0 && <li className="px-4 py-6 text-sm text-muted">No API keys yet.</li>}
        {keys?.map((key) => (
          <li key={key.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{key.name}</p>
              <p className="font-mono text-sm text-muted">{key.prefix}…</p>
            </div>
            <button type="button" onClick={() => void revoke(key.id)} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold">
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </DashboardFrame>
  );
}
