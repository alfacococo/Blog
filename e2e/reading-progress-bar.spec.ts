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

    // 这里两件事都要等：
    // 1. 全局开了 scroll-behavior: smooth，一次跳几千像素的 scrollTo 不是瞬间完成的，
    //    真正滚到位可能要一秒多；
    // 2. 图片是懒加载的，只有滚到附近才会开始加载，加载完成后会把页面撑高，
    //    "底部"这个目标值本身也在滚动过程中不断往后挪。
    // 真实用户是一路慢慢往下滚的，两件事同步发生，滚到底时高度早就稳定了；
    // 这里反复把页面滚到"当前"测得的底部，直到高度和 scrollY 都不再变化，模拟这个过程。
    let lastScrollY = -1;
    let lastHeight = -1;
    for (let attempt = 0; attempt < 40; attempt++) {
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.evaluate((h) => window.scrollTo(0, h), height);
      await page.waitForTimeout(150);
      const scrollY = await page.evaluate(() => window.scrollY);
      if (scrollY === lastScrollY && height === lastHeight) break;
      lastScrollY = scrollY;
      lastHeight = height;
    }

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
