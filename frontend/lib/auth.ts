import { apiUrl } from "@/lib/format";

const TOKEN_KEY = "toolhub.token";

export type AccountUser = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  is_admin?: boolean;
};

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...init, headers });
  } catch {
    throw new Error("Network error. Start the Laravel API and try again.");
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as { message?: string; errors?: Record<string, string[]> }) : {};

  if (!response.ok) {
    const first = data.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    throw new Error(first || data.message || "Request failed.");
  }

  return data as T;
}
