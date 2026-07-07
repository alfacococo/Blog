// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { attachPressFeedback } from './attachPressFeedback';

function fire(el: Element, type: string) {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true }));
}

beforeEach(() => {
  document.body.innerHTML = '<button data-tag-link>tag</button>';
  attachPressFeedback('[data-tag-link]');
});

describe('attachPressFeedback', () => {
  it('adds the pressed class on pointerdown', () => {
    const el = document.querySelector('[data-tag-link]')!;
    fire(el, 'pointerdown');
    expect(el.classList.contains('is-pressed')).toBe(true);
  });

  it('removes the pressed class on pointerup', () => {
    const el = document.querySelector('[data-tag-link]')!;
    fire(el, 'pointerdown');
    fire(el, 'pointerup');
    expect(el.classList.contains('is-pressed')).toBe(false);
  });

  it('removes the pressed class on pointerleave', () => {
    const el = document.querySelector('[data-tag-link]')!;
    fire(el, 'pointerdown');
    fire(el, 'pointerleave');
    expect(el.classList.contains('is-pressed')).toBe(false);
  });

  it('removes the pressed class on pointercancel', () => {
    const el = document.querySelector('[data-tag-link]')!;
    fire(el, 'pointerdown');
    fire(el, 'pointercancel');
    expect(el.classList.contains('is-pressed')).toBe(false);
  });

  it('supports a custom pressed class name', () => {
    document.body.innerHTML = '<button data-custom>tag</button>';
    attachPressFeedback('[data-custom]', 'my-pressed');
    const el = document.querySelector('[data-custom]')!;
    fire(el, 'pointerdown');
    expect(el.classList.contains('my-pressed')).toBe(true);
  });
});
