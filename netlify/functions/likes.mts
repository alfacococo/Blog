import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const store = getStore("likes"); // 这是 Blobs 里的一个"命名空间"
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "缺少 slug 参数" }), {
      status: 400,
    });
  }

  if (req.method === "GET") {
    // 读取点赞数
    const count = (await store.get(slug, { type: "json" })) ?? 0;
    return new Response(JSON.stringify({ count }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    // 点赞 +1
    const current = (await store.get(slug, { type: "json" })) ?? 0;
    const updated = current + 1;
    await store.setJSON(slug, updated);
    return new Response(JSON.stringify({ count: updated }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "不支持的请求方法" }), {
    status: 405,
  });
};