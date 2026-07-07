import { expect, test } from '@playwright/test';

test('pagefind search returns matching results', async ({ page }) => {
  await page.goto('/');

  await page.locator('#search-trigger').click();
  await expect(page.locator('#search-modal')).not.toHaveClass(/hidden/);

  const input = page.locator('.pagefind-ui__search-input');
  await expect(input).toBeVisible();
  await input.fill('生活');

  const results = page.locator('.pagefind-ui__result');
  await expect(results.first()).toBeVisible();
  expect(await results.count()).toBeGreaterThan(0);
});

test('searching for gibberish yields no results without erroring', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#search-trigger').click();

  const input = page.locator('.pagefind-ui__search-input');
  await input.fill('asdkjqwexyznonexistent12345');

  await expect(page.locator('.pagefind-ui__result')).toHaveCount(0);
});

test('clicking the backdrop (outside the search box) closes the modal', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#search-trigger').click();
  await expect(page.locator('#search-modal')).not.toHaveClass(/hidden/);

  // 特意点在弹窗左上角，避开中间的搜索框内容区，模拟"点遮罩层关闭"
  await page.locator('#search-modal').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('#search-modal')).toHaveClass(/hidden/);
});

test('the explicit close button also closes the modal', async ({ page }) => {
  await page.goto('/');
  await page.locator('#search-trigger').click();
  await page.locator('#search-close').click();
  await expect(page.locator('#search-modal')).toHaveClass(/hidden/);
});
