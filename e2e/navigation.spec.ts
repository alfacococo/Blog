import { expect, test } from '@playwright/test';

test('home -> posts list -> post detail -> prev/next article navigation', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Posts', exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/?$/);

  const firstCard = page.locator('a[data-post-card]').first();
  const firstTitle = await firstCard.locator('h3').textContent();
  await firstCard.click();
  await expect(page).toHaveURL(/\/posts\/[^/]+\/$/);
  await expect(page.locator('h1, h2').filter({ hasText: firstTitle ?? '' }).first()).toBeVisible();

  const nextLink = page.locator('[data-nav-link="next"]');
  if (await nextLink.count()) {
    const nextTitle = await page
      .locator('[data-title-link="next"]')
      .textContent();
    await nextLink.click();
    await expect(page.locator('article, main')).toContainText(nextTitle ?? '');

    const prevLink = page.locator('[data-nav-link="prev"]');
    await expect(prevLink).toBeVisible();
    const backTitle = await page
      .locator('[data-title-link="prev"]')
      .textContent();
    await prevLink.click();
    await expect(page.locator('main')).toContainText(backTitle ?? '');
  }
});
