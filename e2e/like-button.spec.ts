import { expect, test } from '@playwright/test';

test.describe('like button', () => {
  test.beforeEach(async ({ page }) => {
    let count = 5;
    await page.route('**/.netlify/functions/likes*', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        count += 1;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count }),
      });
    });
  });

  test('clicking like increments the count and disables re-liking', async ({
    page,
  }) => {
    await page.goto('/posts/');
    await page.locator('a[data-post-card]').first().click();

    const likeBtn = page.locator('.like-btn');
    const likeCount = page.locator('.like-count');

    await expect(likeCount).toHaveText('5');
    await expect(likeBtn).not.toHaveClass(/liked/);

    await likeBtn.click();
    await expect(likeCount).toHaveText('6');
    await expect(likeBtn).toHaveClass(/liked/);

    // 已经点过了，再点一次不应该再发请求、数字也不应该再变
    await likeBtn.click();
    await expect(likeCount).toHaveText('6');
  });

  test('a like persists across reload via localStorage', async ({ page }) => {
    await page.goto('/posts/');
    await page.locator('a[data-post-card]').first().click();

    await page.locator('.like-btn').click();
    await expect(page.locator('.like-btn')).toHaveClass(/liked/);

    await page.reload();
    await expect(page.locator('.like-btn')).toHaveClass(/liked/);

    // 刷新后重新点击不应该再触发一次 POST（计数应保持不变）
    const countBeforeRetry = await page.locator('.like-count').textContent();
    await page.locator('.like-btn').click();
    await expect(page.locator('.like-count')).toHaveText(countBeforeRetry ?? '');
  });
});
