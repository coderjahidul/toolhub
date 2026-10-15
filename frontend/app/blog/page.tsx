import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { fetchPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Guides",
  description: "Practical guides on JPG, PNG, WebP, AVIF, image compression, and everyday PDF tools.",
  alternates: { canonical: "/blog" },
};

const labels: Record<string, string> = {
  image: "Image",
  pdf: "PDF",
  developer: "Developer",
};

export default async function BlogIndexPage() {
  const posts = await fetchPosts();

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Guides</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Notes on images and PDFs</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
        Short, practical articles about file formats and the free tools on ToolHub.
      </p>
      {posts.length === 0 ? (
        <p className="mt-10 text-muted">Guides will appear here after the API is running.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="block h-full rounded-2xl border border-line bg-card p-5 hover:border-accent">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {labels[post.category ?? ""] ?? "Guide"}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10">
        <AdSlot slot="blog-index" format="banner" />
      </div>
    </div>
  );
}
