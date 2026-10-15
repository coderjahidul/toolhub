"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ToolIcon } from "@/components/ToolIcon";
import { categories, tools, type ToolDefinition } from "@/lib/tools";

export function HomeExplorer() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!normalized) {
      return tools;
    }

    return tools.filter((tool) => {
      const haystack = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized]);

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Search tools</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try compressor, PDF, or JSON"
          className="w-full rounded-xl border border-line bg-card px-4 py-3 text-base outline-none ring-accent focus:ring-2"
        />
      </label>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-card px-4 py-8 text-center text-muted">
          No tools match that search.
        </p>
      ) : (
        categories.map((category) => {
          const items = visible.filter((tool) => tool.category === category.slug);
          if (items.length === 0) {
            return null;
          }

          return (
            <section key={category.slug} id={category.slug} className="scroll-mt-20">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
                <p className="mt-1 max-w-2xl text-muted">{category.blurb}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-accent"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
        <ToolIcon slug={tool.slug} />
      </span>
      <span className="mt-4 text-xs font-medium uppercase tracking-wide text-accent">
        {tool.processing === "client" ? "In browser" : "Server"}
      </span>
      <h3 className="mt-1 text-lg font-semibold">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{tool.description}</p>
    </Link>
  );
}
