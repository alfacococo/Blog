// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { onNavigate } from './onNavigate';

function fireAstroPageLoad() {
  document.dispatchEvent(new Event('astro:page-load'));
}

describe('onNavigate', () => {
  it('runs the callback on every astro:page-load by default', () => {
    const fn = vi.fn();
    onNavigate(fn);

    fireAstroPageLoad();
    fireAstroPageLoad();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('runs the callback only once when { once: true }', () => {
    const fn = vi.fn();
    onNavigate(fn, { once: true });

    fireAstroPageLoad();
    fireAstroPageLoad();
    fireAstroPageLoad();

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
