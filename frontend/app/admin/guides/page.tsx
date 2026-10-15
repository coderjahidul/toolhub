"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth";

type GuideRow = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
};

export default function AdminGuidesPage() {
  const [posts, setPosts] = useState<GuideRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson<{ posts: GuideRow[] }>("/api/v1/admin/guides")
      .then((data) => setPosts(data.posts))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load guides."));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Guides</h1>
          <p className="mt-2 text-sm text-muted">Add a guide or edit one that is already on the site.</p>
        </div>
        <Link href="/admin/guides/new" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong">
          Add guide
        </Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {posts.length === 0 && !error && <li className="px-4 py-6 text-sm text-muted">No guides yet.</li>}
        {posts.map((post) => (
          <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">{post.title}</p>
              <p className="truncate text-sm text-muted">
                {post.published ? "Published" : "Draft"} · /blog/{post.slug}
              </p>
            </div>
            <Link href={`/admin/guides/${post.id}`} className="text-sm font-semibold text-accent hover:underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
