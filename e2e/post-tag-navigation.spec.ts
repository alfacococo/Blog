import { expect, test } from '@playwright/test';

test('clicking a tag on a post detail page jumps to that tag on the tags page', async ({
  page,
}) => {
  // 不写死具体标签名或文章 id：谁改了标签名字、谁把这两篇文章的标签换掉，
  // 这条测试都不应该跟着挂——它验证的是"标签链接机制本身是否自洽"，
  // 而不是"某个具体标签今天叫什么"。
  await page.goto('/posts/');
  await page.locator('a[data-post-card]').first().click();
  await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);

  const postTitle = await page.locator('h2.postshome').textContent();
  const tagLink = page.locator('.badge__list a').first();
  const tagName = (await tagLink.textContent())?.trim();
  expect(tagName).toBeTruthy();

  await tagLink.click();
  // Astro 的 ClientRouter 会拦截站内链接做客户端软导航，click() 本身不会等它跑完，
  // 需要显式等 URL 变化，不然读 page.url() 时可能还停在上一页。
  await page.waitForURL(/\/tags\/\?tag=/);

  const url = new URL(page.url());
  expect(url.pathname).toBe('/tags/');
  expect(url.searchParams.get('tag')).toBe(tagName);

  const activeTagButton = page.locator(`[data-tag-link][data-tag="${tagName}"]`);
  await expect(activeTagButton).toHaveClass(/is-selected/);
  await expect(page.locator('#selected-tag-title')).toHaveText(
    `包含「${tagName}」标签的文章`,
  );

  // 点进来的这篇文章本身就带这个标签，筛选之后理应还能在列表里看到它
  const tagPostsContainer = page.locator('#tag-posts-container');
  await expect(tagPostsContainer).toContainText(postTitle ?? '');

  // 确认真的按标签过滤了，而不是把所有文章都显示出来
  const visibleCount = await page.locator('a[data-post-card]:visible').count();
  const totalCount = await page.locator('a[data-post-card]').count();
  expect(visibleCount).toBeGreaterThan(0);
  expect(visibleCount).toBeLessThan(totalCount);
});
