"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/adsense", label: "AdSense" },
  { href: "/admin/search-console", label: "Search Console" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.is_admin) {
      router.replace("/");
    }
  }, [ready, user, router]);

  if (!ready || !user?.is_admin) {
    return <p className="px-4 py-16 text-center text-muted">Checking admin access…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="bg-header text-white">
          <div className="px-5 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-header-muted">ToolHub</p>
            <p className="mt-1 text-lg font-semibold">Admin</p>
            <p className="mt-1 truncate text-sm text-header-muted">{user.email}</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:flex-col lg:px-3 lg:pb-6" aria-label="Admin">
            {links.map((link) => {
              const active = link.href === "/admin" ? pathname === "/admin" : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    active ? "bg-white text-header" : "text-header-muted hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden border-t border-white/10 px-3 py-4 lg:block">
            <button
              type="button"
              onClick={() => {
                void logout().then(() => router.push("/"));
              }}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-header-muted hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </aside>
        <div className="min-w-0 p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
