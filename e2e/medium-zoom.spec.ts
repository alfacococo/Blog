import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

// post-1 里确定放了本地图片（src/assets/images/post-1-1.webp 等），用它来验证 medium-zoom。
const POST_WITH_IMAGES = '/posts/post-1/';

/**
 * 分页里哪一页能点到 post-1 会随文章总数变化（现在排在最后一页），
 * 与其硬编码页码，不如直接从构建产物里查一遍，避免以后文章数变了测试却没人发现。
 */
function findPostsListPageContaining(href: string): string {
  const postsDir = join(process.cwd(), 'dist', 'posts');
  const pageDirs = readdirSync(postsDir).filter((d) => /^\d+$/.test(d));
  const candidates = ['', ...pageDirs].sort(
    (a, b) => (Number(a) || 1) - (Number(b) || 1),
  );

  for (const dir of candidates) {
    const file = join(postsDir, dir, 'index.html');
    if (existsSync(file) && readFileSync(file, 'utf-8').includes(`href="${href}"`)) {
      return dir === '' ? '/posts/' : `/posts/${dir}/`;
    }
  }

  throw new Error(`Could not find a posts list page linking to ${href}`);
}

async function openAndCloseZoom(page: import('@playwright/test').Page) {
  const image = page.locator('.prose img').first();
  await expect(image).toBeVisible();

  await image.click();

  // medium-zoom 打开时：原图会被隐藏，另外克隆一张挂在 body 下当作放大态，
  // 同时 body 会挂上 medium-zoom--opened，遮罩层跟着可见。
  // 图片带 srcset 时（constrained 响应式图片），medium-zoom 还会再克隆一份
  // 换大 sizes 的"高清版"，所以 --opened 元素可能是 1 个也可能是 2 个，
  // 这里断言"至少有一个可见"而不是用严格单元素定位。
  await expect(page.locator('body')).toHaveClass(/medium-zoom--opened/);
  await expect(image).toHaveClass(/medium-zoom-image--hidden/);
  await expect(page.locator('.medium-zoom-image--opened').first()).toBeVisible();

  // medium-zoom 在打开动画（.3s transform 过渡）结束前会忽略关闭请求，
  // 所以点遮罩关闭之前得先等这个过渡跑完，不然点了也没反应。
  await page.waitForTimeout(400);

  // 放大后的图片 z-index 比遮罩层高、且居中覆盖了大半个视口，
  // 所以故意点遮罩的左上角，避开被放大图挡住的区域
  await page.locator('.medium-zoom-overlay').click({ position: { x: 5, y: 5 } });

  await expect(page.locator('body')).not.toHaveClass(/medium-zoom--opened/);
  await expect(image).not.toHaveClass(/medium-zoom-image--hidden/);
  await expect(page.locator('.medium-zoom-image--opened')).toHaveCount(0);
}

test('medium-zoom works on a fresh full-page load', async ({ page }) => {
  await page.goto(POST_WITH_IMAGES);
  await openAndCloseZoom(page);
});

test('medium-zoom still works after an Astro client-side route change', async ({
  page,
}) => {
  // 先落地在一个不含图片的页面，再通过站内链接点击跳转过去——
  // 这是走 Astro ClientRouter 的软导航，而不是整页刷新，
  // 用来验证 MarkdownPostsLayout 里 onNavigate(init) 的重新绑定逻辑没有失效。
  const listPage = findPostsListPageContaining(POST_WITH_IMAGES);
  await page.goto(listPage);
  await page.evaluate(() => {
    (window as unknown as { __e2eMarker?: boolean }).__e2eMarker = true;
  });

  await page
    .locator(`a[data-post-card][href="${POST_WITH_IMAGES}"]`)
    .click();
  await expect(page).toHaveURL(new RegExp(`${POST_WITH_IMAGES}?$`));

  // 断言这确实是软导航（同一个 window 上下文），而不是巧合地整页刷新也能通过
  expect(
    await page.evaluate(
      () => (window as unknown as { __e2eMarker?: boolean }).__e2eMarker,
    ),
  ).toBe(true);

  await openAndCloseZoom(page);
});
