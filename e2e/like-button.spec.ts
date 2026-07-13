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

    // initLikeButton() 绑定点击事件是在 fetch 初始点赞数完成之后才做的（异步），
    // 而 Playwright 的 click() 只检查按钮"看起来"可点（可见、稳定），不知道监听器
    // 有没有真的挂上去。等 like-count 从占位符变成真实数字，就代表初始化已经跑完，
    // 这时候点才靠谱——不然在内容比较重、渲染慢的文章上会偶发点了却没反应。
    await expect(page.locator('.like-count')).not.toHaveText('--');

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
