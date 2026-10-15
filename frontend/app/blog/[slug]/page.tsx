import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { fetchPost, fetchPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/format";
import { publisherBio, publisherName } from "@/lib/site";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPost(slug);
  if (!data) {
    return { title: "Guide not found" };
  }

  return {
    title: data.post.title,
    description: data.post.excerpt,
    alternates: { canonical: `/blog/${data.post.slug}` },
    openGraph: {
      title: data.post.title,
      description: data.post.excerpt,
      type: "article",
      url: `/blog/${data.post.slug}`,
      publishedTime: data.post.published_at ?? undefined,
      modifiedTime: data.post.updated_at ?? undefined,
      authors: [publisherName],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const data = await fetchPost(slug);
  if (!data) {
    notFound();
  }

  const { post, related } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
    author: { "@type": "Organization", name: publisherName, url: siteUrl("/about") },
    publisher: { "@type": "Organization", name: publisherName, url: siteUrl("/about") },
  };
  const publishedLabel = formatGuideDate(post.published_at);
  const updatedLabel = formatGuideDate(post.updated_at);
  const showUpdated = publishedLabel !== null && updatedLabel !== null && updatedLabel !== publishedLabel;

  return (
    <article className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        <Link href="/blog" className="hover:underline">
          Guides
        </Link>
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-4 text-sm text-muted">
        <Link href="/about" className="font-semibold text-foreground hover:underline">
          {publisherName}
        </Link>
        {publishedLabel && <span> · Published {publishedLabel}</span>}
        {showUpdated && <span> · Updated {updatedLabel}</span>}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{publisherBio}</p>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{post.excerpt}</p>
      <div className="mt-8 flex flex-col items-start gap-8 lg:flex-row">
        <div className="article-body min-w-0 w-full max-w-3xl flex-1" dangerouslySetInnerHTML={{ __html: post.html }} />
        <AdSlot slot="blog-sidebar" format="rectangle" className="lg:sticky lg:top-20 lg:w-[300px] lg:shrink-0" />
      </div>
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Related guides</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/blog/${item.slug}`} className="rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-accent">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

function formatGuideDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(date);
}
