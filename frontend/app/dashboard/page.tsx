"use client";

import { useEffect, useState } from "react";
import { DashboardFrame } from "@/components/DashboardFrame";
import { apiJson } from "@/lib/auth";
import { formatBytes } from "@/lib/format";

type UsageResponse = {
  plan: string;
  unlimited: boolean;
  limit: number;
  used: number;
  remaining: number | null;
  history: { tool_slug: string; bytes_in: number; status: string; created_at: string }[];
};

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiJson<UsageResponse>("/api/v1/account/usage")
      .then(setUsage)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load usage."));
  }, []);

  return (
    <DashboardFrame>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {usage && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Used today" value={String(usage.used)} />
            <Stat label="Daily limit" value={usage.unlimited ? "Unlimited" : String(usage.limit)} />
            <Stat label="Remaining" value={usage.unlimited ? "Unlimited" : String(usage.remaining ?? 0)} />
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {usage.history.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted" colSpan={4}>
                      No server operations yet. Run an image or PDF tool while signed in.
                    </td>
                  </tr>
                ) : (
                  usage.history.map((row, index) => (
                    <tr key={`${row.created_at}-${index}`} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">{row.tool_slug}</td>
                      <td className="px-4 py-3">{formatBytes(row.bytes_in)}</td>
                      <td className="px-4 py-3 capitalize">{row.status}</td>
                      <td className="px-4 py-3 text-muted">{new Date(row.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
