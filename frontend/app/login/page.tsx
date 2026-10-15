"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiJson } from "@/lib/auth";
import { apiUrl } from "@/lib/format";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { saveSession, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [google, setGoogle] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(user.is_admin ? "/admin" : "/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    const flag = params.get("google");
    if (flag === "unconfigured") {
      setError("Google sign-in is not configured on this server yet.");
    } else if (flag === "failed") {
      setError("Google sign-in did not finish. Try again.");
    }

    void apiJson<{ google: boolean }>("/api/v1/auth/config")
      .then((data) => setGoogle(data.google))
      .catch(() => setGoogle(false));
  }, [params]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const data = await apiJson<{ token: string; user: { is_admin?: boolean } }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await saveSession(data.token);
      router.push(data.user.is_admin ? "/admin" : "/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="mx-auto w-full max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Use your ToolHub account to see usage, saved files, and API keys.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
          />
        </label>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Signing in" : "Sign in"}
        </button>
        {google && (
          <a
            href={apiUrl("/auth/google")}
            className="block rounded-lg border border-line px-4 py-2.5 text-center text-sm font-semibold"
          >
            Continue with Google
          </a>
        )}
      </form>
      <p className="mt-4 text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-medium text-accent">
          Create an account
        </Link>
      </p>
    </article>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
