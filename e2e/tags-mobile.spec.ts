import { expect, test } from '@playwright/test';

test.describe('tag selection on touch devices', () => {
  test.use({ hasTouch: true });

  test('tapping a tag selects only that tag, with no leftover press state', async ({
    page,
  }) => {
    await page.goto('/tags/');

    const tagButtons = page.locator('[data-tag-link]');
    const count = await tagButtons.count();
    expect(count).toBeGreaterThan(1);

    const first = tagButtons.nth(0);
    const second = tagButtons.nth(1);

    await first.tap();
    await expect(first).toHaveClass(/is-selected/);
    await expect(first).not.toHaveClass(/is-pressed/);
    await expect(second).not.toHaveClass(/is-selected/);

    // 换一个标签：之前选中的要正确取消高亮，不能同时留下两个"选中"态
    await second.tap();
    await expect(second).toHaveClass(/is-selected/);
    await expect(first).not.toHaveClass(/is-selected/);
    await expect(first).not.toHaveClass(/is-pressed/);
  });

  test('the unselected background color is restored after tapping away', async ({
    page,
  }) => {
    await page.goto('/tags/');

    const tagButtons = page.locator('[data-tag-link]');
    const first = tagButtons.nth(0);
    const second = tagButtons.nth(1);

    await first.tap();
    await second.tap();

    // 之前修过的 bug：触摸过的标签会永久卡在选中色 #9076a8 上。
    // 这里直接断言真实的计算背景色，而不是只看 class 名。
    await expect(first).toHaveCSS('background-color', 'rgb(88, 73, 102)');
    await expect(second).toHaveCSS('background-color', 'rgb(144, 118, 168)');
  });
});
