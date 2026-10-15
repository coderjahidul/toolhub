"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/dashboard", label: "Usage" },
  { href: "/dashboard/files", label: "Saved files" },
  { href: "/dashboard/keys", label: "API keys" },
];

export function DashboardFrame({ children }: { children: ReactNode }) {
  const { user, plan, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return <p className="px-4 py-16 text-center text-muted">Loading your account…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">{plan ?? "free"} plan</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{user.name}</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void logout().then(() => router.push("/"));
          }}
          className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold"
        >
          Sign out
        </button>
      </div>
      <nav className="mt-6 flex gap-2 overflow-x-auto" aria-label="Account">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                active ? "bg-accent text-white" : "border border-line bg-card text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
