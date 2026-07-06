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
    // 读取点赞数：先查新 key，查不到的话再回头看一下切换新版 Content Layer API 之前
    // 带 .md 后缀的旧 key（比如 "post-40.md"），避免之前累积的点赞数平白归零
    let count = (await store.get(slug, { type: "json" })) as number | null;

    if (count === null) {
      const legacyCount = (await store.get(`${slug}.md`, {
        type: "json",
      })) as number | null;

      if (legacyCount !== null) {
        count = legacyCount;
        // 顺手把旧数据迁移到新 key 下面，以后就不用再绕这一层了
        await store.setJSON(slug, legacyCount);
      }
    }

    return new Response(JSON.stringify({ count: count ?? 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    // 点赞 +1：同样先查新 key，查不到再回头看旧 key，保证在迁移前后都能接上正确的基数
    let current = (await store.get(slug, { type: "json" })) as number | null;

    if (current === null) {
      current =
        ((await store.get(`${slug}.md`, { type: "json" })) as number | null) ??
        0;
    }

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