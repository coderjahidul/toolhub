"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/#image", label: "Image tools" },
  { href: "/#pdf", label: "PDF tools" },
  { href: "/#developer", label: "Developer tools" },
  { href: "/blog", label: "How-to guides" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const accountHref = user ? "/dashboard" : "/login";
  const accountLabel = user ? "Dashboard" : "Sign in";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-header text-white">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </span>
          <span className="truncate text-lg font-semibold tracking-tight">ToolHub</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={accountHref}
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            {accountLabel}
          </Link>
          {user?.is_admin && (
            <Link
              href="/admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Admin
            </Link>
          )}
          <Link
            href="/#image"
            className="hidden rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-strong sm:inline-flex"
          >
            Browse tools
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-white/10 px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={accountHref}
              className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
            >
              {accountLabel}
            </Link>
            {user?.is_admin && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}
            <Link
              href="/#image"
              className="mt-1 rounded-lg bg-accent px-3 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Browse tools
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
