import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ToolIcon } from "@/components/ToolIcon";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { fetchPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/format";
import { getTool, relatedTools, tools } from "@/lib/tools";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    return { title: "Tool not found" };
  }

  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `/tool/${tool.slug}` },
    openGraph: {
      title: tool.name,
      description: tool.description,
      url: `/tool/${tool.slug}`,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  const related = relatedTools(tool);
  const guides = (await fetchPosts()).filter((post) => post.category === tool.category).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: siteUrl(`/tool/${tool.slug}`),
    description: tool.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <article className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <p className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span> / </span>
        <Link href={`/#${tool.category}`} className="capitalize hover:text-foreground">
          {tool.category}
        </Link>
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <ToolIcon slug={tool.slug} className="h-7 w-7" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
      </div>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{tool.summary}</p>
      <div className="mt-8 flex flex-col items-start gap-6 lg:flex-row">
        <div className="min-w-0 w-full flex-1">
          <ToolWorkspace tool={tool} />
        </div>
        <AdSlot slot="tool-sidebar" format="rectangle" className="lg:sticky lg:top-20 lg:w-[300px] lg:shrink-0" />
      </div>
      {tool.sections.length > 0 && (
        <section className="mt-10 max-w-3xl space-y-8">
          {tool.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              <div className="mt-3 space-y-3 leading-7 text-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
            {tool.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Questions</h2>
          <div className="mt-4 space-y-4">
            {tool.faq.map((item) => (
              <div key={item.question}>
                <h3 className="font-medium">{item.question}</h3>
                <p className="mt-1 text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Related tools</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {related.map((item) => (
            <li key={item.slug}>
              <Link href={`/tool/${item.slug}`} className="rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-accent">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {guides.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Related guides</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {guides.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-accent">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
