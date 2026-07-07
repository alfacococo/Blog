/**
 * 构建分页页码列表：页数不多时全部展开，页数多了就折叠成 1 … N，
 * 折叠态下用户可以在省略号处输入页码跳转（见 Paginator.astro 里的 jump-form）。
 */
export function getPageItems(total: number): (number | string)[] {
  const pages: (number | string)[] = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, '...', total);
  }

  return pages;
}

export function getPageHref(basePath: string, pageNumber: number): string {
  return pageNumber === 1 ? basePath : `${basePath}/${pageNumber}/`;
}
