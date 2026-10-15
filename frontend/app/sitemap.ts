import type { MetadataRoute } from "next";
import { fetchPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/format";
import { tools } from "@/lib/tools";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await fetchPosts();

  return [
    { url: siteUrl("/"), lastModified },
    { url: siteUrl("/blog"), lastModified },
    { url: siteUrl("/about"), lastModified },
    { url: siteUrl("/contact"), lastModified },
    { url: siteUrl("/privacy"), lastModified },
    { url: siteUrl("/terms"), lastModified },
    { url: siteUrl("/cookie-policy"), lastModified },
    ...tools.map((tool) => ({
      url: siteUrl(`/tool/${tool.slug}`),
      lastModified,
    })),
    ...posts.map((post) => ({
      url: siteUrl(`/blog/${post.slug}`),
      lastModified: post.published_at ? new Date(post.published_at) : lastModified,
    })),
  ];
}
