import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { HomeExplorer } from "@/components/HomeExplorer";
import { fetchPosts } from "@/lib/blog";

export default async function HomePage() {
  const posts = await fetchPosts();
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Free online tools</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Image, PDF, and developer tools that stay simple.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Compress or convert an image, merge a PDF, format JSON, or generate a password.
            Server tools allow 20 operations a day. JSON and passwords stay in your browser.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-foreground sm:flex-row sm:flex-wrap sm:gap-3">
            <li className="rounded-full border border-line bg-card px-3 py-1.5">7 free tools</li>
            <li className="rounded-full border border-line bg-card px-3 py-1.5">Optional account</li>
            <li className="rounded-full border border-line bg-card px-3 py-1.5">20 server jobs a day</li>
          </ul>
        </div>
      </section>
      <HomeExplorer />
      {posts.length > 0 && (
        <section className="mx-auto w-full max-w-[1280px] px-4 pb-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Guides</h2>
            <Link href="/blog" className="text-sm font-semibold text-accent hover:underline">
              All guides
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="block h-full rounded-2xl border border-line bg-card p-5 hover:border-accent">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 sm:px-6">
        <AdSlot slot="home-inline" format="banner" />
      </div>
    </>
  );
}
