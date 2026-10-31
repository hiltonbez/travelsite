// The agency's blog posts from TribeTravel (Marketing > Blog, /api/site/<slug>/posts, P17.223). Read in the browser at
// run time, so a post published in TribeTravel shows on the site straight away without rebuilding it.
import { AGENCY_SLUG, TRIBETRAVEL_URL } from "@/lib/site-content";

export type PostItem = { slug: string; title: string; summary: string; category: string; image: string; date: string; minutes: number };
export type Post = PostItem & { body_html: string; seo_title: string; seo_description: string; fonts: string[] };

const base = `${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(AGENCY_SLUG)}/posts`;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(base + path, { headers: { Accept: "application/json" }, credentials: "omit" });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

/** The published posts, newest first. [] when the blog isn't switched on or can't be reached. */
export async function listPosts(): Promise<PostItem[]> {
  try {
    return (await get<{ posts: PostItem[] }>("")).posts ?? [];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<Post> {
  return (await get<{ post: Post }>(`/${encodeURIComponent(slug)}`)).post;
}
