import { expect, test } from '@playwright/test';

// post-41 标题数量最多且内容最长，保证目录一定会渲染，也保证滚得过 300px 的显隐阈值。
const POST_WITH_HEADINGS = '/posts/post-41/';
// post-1 没有二级到四级标题，用它验证「没有标题时目录不渲染」。
const POST_WITHOUT_HEADINGS = '/posts/post-1/';

test('does not render when the post has no headings', async ({ page }) => {
  await page.goto(POST_WITHOUT_HEADINGS);
  await expect(page.locator('.toc')).toHaveCount(0);
});

test('renders one link per heading and becomes visible after scrolling past the threshold', async ({
  page,
}) => {
  await page.goto(POST_WITH_HEADINGS);

  const toc = page.locator('.toc');
  await expect(toc).toHaveCount(1);
  await expect(toc).not.toHaveClass(/visible/);
  expect(await toc.locator('a').count()).toBeGreaterThan(0);

  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(toc).toHaveClass(/visible/);
});

test('clicking a heading link jumps to that heading', async ({ page }) => {
  await page.goto(POST_WITH_HEADINGS);

  const firstLink = page.locator('.toc a').first();
  const href = await firstLink.getAttribute('href');
  expect(href).toMatch(/^#./);

  await firstLink.click();
  // 中文锚点会被浏览器编码进 URL（如 #嘟文合并到日记 变成 #%E5%98%9F...），
  // 所以要解码之后再比较，而不是直接拿 href 原文去匹配 URL。
  await expect
    .poll(() => page.evaluate(() => decodeURIComponent(location.hash)))
    .toBe(href);

  const heading = page.locator(`[id="${href!.slice(1)}"]`);
  await expect(heading).toBeInViewport();
});
