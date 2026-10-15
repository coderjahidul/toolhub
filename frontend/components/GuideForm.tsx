"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { apiJson } from "@/lib/auth";

type GuideDraft = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  published: boolean;
};

const empty: GuideDraft = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  category: "image",
  published: true,
};

export function GuideForm({ guideId }: { guideId?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<GuideDraft>(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!guideId) {
      return;
    }

    apiJson<{ post: GuideDraft & { category: string | null } }>(`/api/v1/admin/guides/${guideId}`)
      .then((data) =>
        setForm({
          title: data.post.title,
          slug: data.post.slug,
          excerpt: data.post.excerpt,
          body: data.post.body,
          category: data.post.category || "image",
          published: data.post.published,
        }),
      )
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load that guide."));
  }, [guideId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, category: form.category || null, slug: form.slug.trim() };
    try {
      if (guideId) {
        await apiJson(`/api/v1/admin/guides/${guideId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiJson("/api/v1/admin/guides", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/guides");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the guide.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!guideId || !window.confirm("Delete this guide?")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiJson(`/api/v1/admin/guides/${guideId}`, { method: "DELETE" });
      router.push("/admin/guides");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the guide.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        <Link href="/admin/guides" className="hover:underline">
          Guides
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{guideId ? "Edit guide" : "Add guide"}</h1>
      <label className="mt-6 block text-sm font-medium">
        Title
        <input
          required
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2.5"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        URL slug
        <input
          value={form.slug}
          onChange={(event) => setForm({ ...form, slug: event.target.value })}
          placeholder="Leave blank to build it from the title"
          className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2.5"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Excerpt
        <textarea
          required
          maxLength={300}
          value={form.excerpt}
          onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
          className="mt-1 h-20 w-full rounded-xl border border-line bg-background px-3 py-2.5"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Category
        <select
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2.5"
        >
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
          <option value="developer">Developer</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-medium">
        Markdown
        <textarea
          required
          value={form.body}
          onChange={(event) => setForm({ ...form, body: event.target.value })}
          className="mt-1 h-80 w-full rounded-xl border border-line bg-background px-3 py-2.5 font-mono text-sm"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(event) => setForm({ ...form, published: event.target.checked })}
        />
        Published on /blog
      </label>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save guide"}
        </button>
        {guideId && (
          <button type="button" onClick={() => void remove()} disabled={saving} className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
