/**
 * "已阅"状态存取——全放在一个 localStorage key 里（{ slug: 已读时间戳 }），
 * 而不是像点赞那样每篇文章一个 key，方便列表页一次性读出所有已读 slug。
 *
 * 隐私浏览模式下 localStorage 可能直接抛异常（Safari 历史上就是这样），
 * 所以所有读写都包一层 try/catch：读失败就当没有任何已读记录，
 * 写失败就放弃这次记录，不影响正常的阅读体验。
 */

const STORAGE_KEY = 'read-posts';

function readStore(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markPostAsRead(slug: string): void {
  try {
    const store = readStore();
    if (store[slug]) return; // 已经记录过，不用再写一次
    store[slug] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // 忽略：多半是隐私浏览模式下 localStorage 不可写
  }
}

export function getReadSlugs(): Set<string> {
  return new Set(Object.keys(readStore()));
}
