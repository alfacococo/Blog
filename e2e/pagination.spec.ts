import { expect, test } from '@playwright/test';

test('paginator navigates between numbered pages and highlights the active one', async ({
  page,
  isMobile,
}) => {
  // 页码数字格只在桌面/宽屏下渲染，窄屏（见 paginator.css 的 600px 断点）
  // 收起成纯文本"当前/总页数"，翻页交给 Prev/Next——这条用例测的正是
  // "点数字格翻页"这个桌面专属交互，移动端视口下这些格子本来就不可见/不可点。
  test.skip(isMobile, '窄屏下数字格被隐藏，翻页走 Prev/Next，见下方 mobile 专属用例');

  await page.goto('/posts/');

  const activePage = page.locator('a[aria-current="page"]');
  await expect(activePage).toHaveText('1');

  const firstPageFirstPost = await page
    .locator('a[data-post-card] h3')
    .first()
    .textContent();

  await page.getByRole('link', { name: '2', exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/2\/?$/);
  await expect(page.locator('a[aria-current="page"]')).toHaveText('2');

  const secondPageFirstPost = await page
    .locator('a[data-post-card] h3')
    .first()
    .textContent();
  expect(secondPageFirstPost).not.toBe(firstPageFirstPost);
});

test('on narrow viewports, number cells collapse to compact text and Prev/Next still navigate', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, '这条用例只覆盖窄屏下的收起态，桌面态见上面那条用例');

  await page.goto('/posts/');
  await expect(page.locator('.paginator-cell').first()).toBeHidden();
  await expect(page.locator('.paginator-compact')).toBeVisible();

  // 不写死总页数（会随文章数量增减而变化），只校验 "当前 / 总数" 的格式和当前页部分。
  const total = await page.locator('.paginator-jump-input').getAttribute('max');
  await expect(page.locator('.paginator-compact')).toHaveText(`1 / ${total}`);

  await page.locator('[data-page-link]:not([data-page-number])').last().click();
  await expect(page).toHaveURL(/\/posts\/2\/?$/);
  await expect(page.locator('.paginator-compact')).toHaveText(`2 / ${total}`);
});

test('the jump-to-page form is always available and navigates to the typed page', async ({
  page,
}) => {
  // "Go to page" 现在是常驻区块，不再依赖页码折叠触发；
  // 折叠逻辑本身已经在 src/utils/pagination.test.ts 里覆盖。
  await page.goto('/posts/');
  const form = page.locator('[data-page-jump-form]');
  await expect(form).toHaveCount(1);

  await form.locator('input[name="page"]').fill('2');
  await form.getByRole('button', { name: '跳转' }).click();
  await expect(page).toHaveURL(/\/posts\/2\/?$/);
  await expect(page.locator('a[aria-current="page"]')).toHaveText('2');
});
