import { expect, test } from '@playwright/test';

test.describe('theme toggle', () => {
  test('switches the html class and persists to localStorage', async ({
    page,
  }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initiallyLight = (await html.getAttribute('class'))?.includes(
      'light',
    );

    await page.locator('#themeToggle').click();

    if (initiallyLight) {
      await expect(html).not.toHaveClass(/light/);
      expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(
        'dark',
      );
    } else {
      await expect(html).toHaveClass(/light/);
      expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(
        'light',
      );
    }
  });

  test('theme survives a full page reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('#themeToggle').click();
    const themeAfterToggle = await page.evaluate(() =>
      localStorage.getItem('theme'),
    );

    await page.reload();

    const html = page.locator('html');
    if (themeAfterToggle === 'light') {
      await expect(html).toHaveClass(/light/);
    } else {
      await expect(html).not.toHaveClass(/light/);
    }
  });
});
