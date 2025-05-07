import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("posts");

  const debugData = posts.map((post, index) => ({
    index,
    id: post.id,
    slug: post.slug,
    title: post.data.title,
    date: post.data.date,
    description: post.data.description,
    tags: post.data.tags,
    hasTitle: !!post.data.title,
    hasDate: !!post.data.date,
    hasSlug: !!post.slug,
    hasDescription: !!post.data.description,
    tagCount: Array.isArray(post.data.tags) ? post.data.tags.length : "invalid",
  }));

  return new Response(JSON.stringify(debugData, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
