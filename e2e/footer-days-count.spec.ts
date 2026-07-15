import { expect, test } from '@playwright/test';

test('footer days-count survives an Astro client-side route change', async ({
  page,
}) => {
  // 回归测试：Footer 的天数脚本之前用 `data-astro-rerun` + `define:vars`，
  // 但 Astro 编译器在两者同时出现时会把 data-astro-rerun 属性丢掉，导致这段
  // 脚本的文本在全站每个页面都完全一样，只要跑过一次就被 ClientRouter 当成
  // "已执行过"而在之后的软导航里被跳过，天数会掉回 HTML 里写死的占位符 0。
  await page.goto('/posts/');

  const daysCount = page.locator('#days-count');
  const initial = await daysCount.textContent();
  expect(initial).not.toBe('0');

  await page.locator('a[data-post-card]').first().click();
  await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);
  await expect(daysCount).toHaveText(initial ?? '');

  await page.locator('a[href="/tags/"]').first().click();
  await expect(page).toHaveURL(/\/tags\//);
  await expect(daysCount).toHaveText(initial ?? '');
});
