import { expect, test } from '@playwright/test';

test('paginator navigates between numbered pages and highlights the active one', async ({
  page,
}) => {
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

test('the jump-to-page form only appears once there are enough pages to collapse', async ({
  page,
}) => {
  // 当前 /posts 和 /log 都只有 4 页（<=5），折叠态的跳转输入框不会渲染；
  // 折叠逻辑本身已经在 src/utils/pagination.test.ts 里覆盖了 >5 页的情况。
  // 这条测试只是确认："没到阈值时，页面上确实没有这个跳转表单"，
  // 避免将来阈值判断改错却没人发现。
  await page.goto('/posts/');
  await expect(page.locator('[data-page-jump-form]')).toHaveCount(0);
});
