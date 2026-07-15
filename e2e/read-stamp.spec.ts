import { expect, test } from '@playwright/test';

test.describe('read stamp', () => {
  test('marks a card as read after visiting its post, and it persists across SPA navigation and a hard reload', async ({
    page,
  }) => {
    await page.goto('/posts/');

    const firstCard = page.locator('a[data-post-card]').first();
    const secondCard = page.locator('a[data-post-card]').nth(1);

    // 进去之前，谁都还没被标记成已读
    await expect(firstCard).not.toHaveClass(/is-read/);

    await firstCard.click();
    await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);

    // ReadMarker 挂的那个 .read-marker div 是服务端渲染出来的静态标记，
    // 页面一加载就存在于 DOM 里，跟它的 <script> 有没有跑完没关系——
    // 用它做"已经标记成已读"的信号是假信号。真正靠谱的信号是 localStorage
    // 里确实写进了这条记录，用 poll 等这个才对。
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('read-posts')))
      .not.toBeNull();

    // 用浏览器后退回列表页——这条路径走的是 Astro ClientRouter 的 SPA 软导航
    // （非 once 的 astro:page-load），跟下面 reload() 触发的"首次加载"分支
    // 是两条不同代码路径，都要覆盖到，不然只测一条会漏掉另一条挂了都不知道。
    await page.goBack();
    await expect(page).toHaveURL(/\/posts\/$/);

    await expect(firstCard).toHaveClass(/is-read/);
    await expect(secondCard).not.toHaveClass(/is-read/);

    // 图章有个 opacity 的淡入过渡，直接读 computed style 可能读到过渡途中的中间值，
    // 用 poll 等它稳定到最终的 0.92，而不是死等一个固定 timeout。
    await expect
      .poll(() =>
        firstCard
          .locator('.read-stamp')
          .evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBeGreaterThan(0.5);

    // 硬刷新，重新走一遍首次加载分支，已读状态应该还在（localStorage 是跨会话持久的）
    await page.reload();
    await expect(firstCard).toHaveClass(/is-read/);
    await expect(secondCard).not.toHaveClass(/is-read/);
  });
});
