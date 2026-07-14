import { expect, test } from '@playwright/test';

// 全局组件（挂在 Layout 里，每个页面都有），借用最长的一篇文章保证滚动区间够用。
const LONG_POST = '/posts/post-41/';

test('scroll-to-top button appears past the threshold and scrolls back up on click', async ({
  page,
}) => {
  await page.goto(LONG_POST);

  const button = page.locator('#scroll-top-button');
  await expect(button).not.toHaveClass(/visible/);

  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(button).toHaveClass(/visible/);

  await button.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(button).not.toHaveClass(/visible/);
});
