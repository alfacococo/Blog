/**
 * 解析卡片上 data-post-tags 属性（JSON 字符串）。
 * 属性缺失或者不是合法的字符串数组 JSON 时，一律当作没有标签处理，
 * 避免脏数据把整个筛选逻辑炸掉。
 */
export function parsePostTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === 'string')
      : [];
  } catch {
    return [];
  }
}

/**
 * 按选中的标签显示/隐藏文章卡片（通过卡片外层 <li> 的 display 样式）。
 */
export function applyTagFilter(cards: Element[], selectedTag: string): void {
  cards.forEach((card) => {
    const matched = parsePostTags(card.getAttribute('data-post-tags')).includes(
      selectedTag,
    );
    const listItem = card.closest('li');
    if (!listItem) return;
    (listItem as HTMLElement).style.display = matched ? '' : 'none';
  });
}

/**
 * 高亮选中的标签按钮，并清除其余按钮的高亮，保证同一时间只有一个处于选中态。
 * 返回被选中的按钮元素（找不到则返回 undefined）。
 */
export function setActiveTagLink(
  tagLinks: Element[],
  selectedTag: string,
): Element | undefined {
  tagLinks.forEach((item) => item.classList.remove('is-selected'));

  const activeLink = tagLinks.find(
    (item) => item.getAttribute('data-tag') === selectedTag,
  );
  activeLink?.classList.add('is-selected');

  return activeLink;
}

/**
 * 决定页面初次加载时应该选中哪个标签：
 * URL 上的 ?tag= 参数如果命中已知标签就用它，否则回退到第一个标签。
 */
export function resolveInitialTag(
  knownTags: (string | null)[],
  queryTag: string | null,
): { tag: string | null; isValidQueryTag: boolean } {
  const isValidQueryTag = queryTag ? knownTags.includes(queryTag) : false;
  const tag = isValidQueryTag ? queryTag : (knownTags[0] ?? null);
  return { tag, isValidQueryTag };
}
