interface PageItemsOptions {
  boundaryCount?: number;
  siblingCount?: number;
}

// 页数很少时（阈值以内）直接展开全部，收缩成省略号反而更占视觉噪音，
// 省不了几个数字却多了一个"…"。
const SHOW_ALL_THRESHOLD = 5;

/**
 * 构建分页页码列表：首尾各固定展示 boundaryCount 页，当前页左右各展示
 * siblingCount 页，其余用省略号折叠。相邻或重叠的区间会自动合并、不插入
 * 省略号（比如当前页贴近首页时，省略号会自然消失），因此不需要另外
 * 针对"当前页靠近边界"写特殊分支。
 *
 * 默认 boundaryCount=1、siblingCount=0，即 "1 … 当前页 … 总页数" 这种
 * 最紧凑的形态——这是给页面本身宽度有限（分页条要跟 Prev/Next、
 * "跳转到"输入框挤在同一行）留出空间的设计取舍，页数字格本身不承担
 * "快速跳到当前页前后一页"的职责，那个由 Prev/Next 按钮负责。
 */
export function getPageItems(
  current: number,
  total: number,
  { boundaryCount = 1, siblingCount = 0 }: PageItemsOptions = {},
): (number | string)[] {
  if (total <= SHOW_ALL_THRESHOLD) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const desired = new Set<number>();
  for (let p = 1; p <= boundaryCount; p++) desired.add(p);
  for (let p = total - boundaryCount + 1; p <= total; p++) desired.add(p);
  for (let p = current - siblingCount; p <= current + siblingCount; p++) {
    if (p >= 1 && p <= total) desired.add(p);
  }

  const sorted = [...desired].sort((a, b) => a - b);
  const items: (number | string)[] = [];

  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      items.push('...');
    }
    items.push(p);
  });

  return items;
}

export function getPageHref(basePath: string, pageNumber: number): string {
  return pageNumber === 1 ? basePath : `${basePath}/${pageNumber}/`;
}
