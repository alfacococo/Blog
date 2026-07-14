import { expect, test } from '@playwright/test';

// post-41 是目前最长的一篇文章，保证滚动区间足够大，测试才能稳定复现
// "刚进入/滚动到一半/滚动到底"这几种状态，不会因为内容太短而一步到位。
const LONG_POST = '/posts/post-41/';

function progressBarWidth(page: import('@playwright/test').Page) {
  return page.locator('#progress-bar').evaluate((el) => (el as HTMLElement).style.width);
}

test.describe('reading progress bar', () => {
  test('starts at 0% on a fresh load', async ({ page }) => {
    await page.goto(LONG_POST);
    expect(await progressBarWidth(page)).toBe('0%');
  });

  test('reaches 100% once scrolled to the bottom', async ({ page }) => {
    await page.goto(LONG_POST);

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    await expect.poll(() => progressBarWidth(page)).toBe('100%');
  });

  test('reports an intermediate percentage partway down the page', async ({ page }) => {
    await page.goto(LONG_POST);

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight / 2),
    );

    await expect
      .poll(async () => parseFloat(await progressBarWidth(page)))
      .toBeGreaterThan(10);
  });
});
