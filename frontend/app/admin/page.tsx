"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth";

type Overview = {
  users: number;
  guides: number;
  uses_today: number;
  saved_files: number;
  adsense_enabled: boolean;
  search_console_ready: boolean;
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson<Overview>("/api/v1/admin/overview")
      .then(setData)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load the overview."));
  }, []);

  const stats = [
    { label: "Accounts", value: data?.users },
    { label: "Guides", value: data?.guides },
    { label: "Tool uses today", value: data?.uses_today },
    { label: "Saved files", value: data?.saved_files },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Site totals, plus the Google integrations that the public pages read.
      </p>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{stat.value ?? "—"}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <StatusCard
          href="/admin/guides"
          title="Guides"
          ready={Boolean(data && data.guides > 0)}
          detail="Add a new article or edit the ones already published."
        />
        <StatusCard
          href="/admin/adsense"
          title="Google AdSense"
          ready={Boolean(data?.adsense_enabled)}
          detail={data?.adsense_enabled ? "Ads are enabled on the public site." : "Add a publisher ID and turn ads on."}
        />
        <StatusCard
          href="/admin/search-console"
          title="Google Search Console"
          ready={Boolean(data?.search_console_ready)}
          detail={data?.search_console_ready ? "Verification tag is on the site." : "Paste the verification code from Search Console."}
        />
      </div>
    </div>
  );
}

function StatusCard({ href, title, ready, detail }: { href: string; title: string; ready: boolean; detail: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-line p-5 hover:border-accent">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ready ? "bg-accent text-white" : "bg-background text-muted"}`}>
          {ready ? "Ready" : "Not set"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </Link>
  );
}
