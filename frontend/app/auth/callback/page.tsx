"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  const { saveSession } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      router.replace("/login?google=failed");
      return;
    }

    void saveSession(token).then(() => router.replace("/dashboard"));
  }, [params, router, saveSession]);

  return <p className="px-4 py-16 text-center text-muted">Finishing sign-in…</p>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <Callback />
    </Suspense>
  );
}
