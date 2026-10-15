import { apiUrl } from "@/lib/format";

export type BlogSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  published_at: string | null;
  updated_at: string | null;
};

export type BlogPost = BlogSummary & {
  html: string;
};

export async function fetchPosts(): Promise<BlogSummary[]> {
  try {
    const response = await fetch(apiUrl("/api/v1/blog"), { next: { revalidate: 60 } });
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { posts?: BlogSummary[] };
    return data.posts ?? [];
  } catch {
    return [];
  }
}

export async function fetchPost(slug: string): Promise<{ post: BlogPost; related: BlogSummary[] } | null> {
  try {
    const response = await fetch(apiUrl(`/api/v1/blog/${slug}`), { next: { revalidate: 60 } });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as { post: BlogPost; related: BlogSummary[] };
  } catch {
    return null;
  }
}
