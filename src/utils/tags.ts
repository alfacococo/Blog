import type { CollectionEntry } from 'astro:content';

/**
 * 统计每个标签在文章集合里出现的次数。
 * 会过滤掉空字符串之类的无效标签——tags 首页（标签索引）和
 * tags/[tag] 详情页的 getStaticPaths 都用这个，保证两边统计口径一致。
 */
export function getTagCounts(posts: CollectionEntry<'posts'>[]): Record<string, number> {
  const tagCountMap: Record<string, number> = {};

  posts.forEach((post) => {
    (post.data.tags ?? []).forEach((tag) => {
      if (typeof tag === 'string' && tag.trim() !== '') {
        tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
      }
    });
  });

  return tagCountMap;
}

/**
 * 把标签计数对象按文章数量从多到少排序，返回标签名数组。
 */
export function getSortedTags(tagCountMap: Record<string, number>): string[] {
  return Object.keys(tagCountMap).sort((a, b) => tagCountMap[b] - tagCountMap[a]);
}
