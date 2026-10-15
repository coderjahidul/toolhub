"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiJson, clearToken, getToken, setToken, type AccountUser } from "@/lib/auth";

type AuthState = {
  user: AccountUser | null;
  plan: string | null;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  saveSession: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setPlan(null);
      setReady(true);
      return;
    }

    try {
      const data = await apiJson<{ user: AccountUser; plan: string }>("/api/v1/auth/me");
      setUser(data.user);
      setPlan(data.plan);
    } catch {
      clearToken();
      setUser(null);
      setPlan(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await apiJson("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // The local session still ends if the token is already gone.
    }
    clearToken();
    setUser(null);
    setPlan(null);
  }, []);

  const saveSession = useCallback(async (token: string) => {
    setToken(token);
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, plan, ready, refresh, logout, saveSession }),
    [user, plan, ready, refresh, logout, saveSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
