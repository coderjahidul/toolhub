"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiJson } from "@/lib/auth";

type UserRow = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  plan: string;
  created_at: string | null;
};

type UserPage = {
  users: UserRow[];
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

function UserList() {
  const params = useSearchParams();
  const requested = Number(params.get("page") ?? "1");
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const [data, setData] = useState<UserPage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson<UserPage>(`/api/v1/admin/users?page=${page}`)
      .then(setData)
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load users."));
  }, [page]);

  const from = data && data.total > 0 ? (data.page - 1) * data.per_page + 1 : 0;
  const to = data ? Math.min(data.page * data.per_page, data.total) : 0;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
      <p className="mt-2 text-sm text-muted">
        {data ? `${from}–${to} of ${data.total}` : "20 accounts per page."}
      </p>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-background text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data?.users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.plan}</td>
                <td className="px-4 py-3">{user.is_admin ? "Admin" : "Member"}</td>
                <td className="px-4 py-3 text-muted">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && data.last_page > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-3" aria-label="User pages">
          {data.page > 1 ? (
            <Link href={`/admin/users?page=${data.page - 1}`} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold">
              Previous
            </Link>
          ) : (
            <span className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted">Previous</span>
          )}
          <p className="text-sm text-muted">
            Page {data.page} of {data.last_page}
          </p>
          {data.page < data.last_page ? (
            <Link href={`/admin/users?page=${data.page + 1}`} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold">
              Next
            </Link>
          ) : (
            <span className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted">Next</span>
          )}
        </nav>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading users…</p>}>
      <UserList />
    </Suspense>
  );
}
