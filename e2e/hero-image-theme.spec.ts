import { expect, test } from '@playwright/test';

// 回归测试：hero 图用 <picture><source media="(prefers-color-scheme: light)">
// 原生选图，但按 HTML 规范，只要 source 命中了，就算再用 JS 显式设置 img.src
// 也会被原生选源逻辑覆盖回去——之前有一版实现漏了这点，导致"系统浅色、手动切成
// 深色主题"这种组合下，图片会一直被系统偏好"纠正"回浅色版，人工测试才发现。
// 这里用 img.currentSrc（浏览器实际渲染出来的资源，不是只看 DOM 属性）
// 把系统偏好 × 手动切换的几种组合都钉住，改坏了 CI 就会红。

function heroCurrentSrc(page: import('@playwright/test').Page) {
  return page
    .locator('.hero-image')
    .evaluate((img) => (img as HTMLImageElement).currentSrc);
}

test.describe('hero image theme switching — system prefers light', () => {
  test.use({ colorScheme: 'light' });

  test('matches system preference with no manual override (native <picture>, no JS involved)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect.poll(() => heroCurrentSrc(page)).toContain('/images/mv.webp');
  });

  test('manual dark override wins even though system prefers light', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).not.toHaveClass(/light/);
    await expect
      .poll(() => heroCurrentSrc(page))
      .toContain('/images/mv-dark.webp');
  });

  test('manual override survives a full page reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('#themeToggle').click();
    await page.reload();
    await expect
      .poll(() => heroCurrentSrc(page))
      .toContain('/images/mv-dark.webp');
  });
});

test.describe('hero image theme switching — system prefers dark', () => {
  test.use({ colorScheme: 'dark' });

  test('matches system preference with no manual override (native <picture>, no JS involved)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect
      .poll(() => heroCurrentSrc(page))
      .toContain('/images/mv-dark.webp');
  });

  test('manual light override wins even though system prefers dark', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#themeToggle').click();
    await expect(page.locator('html')).toHaveClass(/light/);
    await expect.poll(() => heroCurrentSrc(page)).toContain('/images/mv.webp');
  });
});
