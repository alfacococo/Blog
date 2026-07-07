import { describe, expect, it } from 'vitest';
import { getPageHref, getPageItems } from './pagination';

describe('getPageItems', () => {
  it('lists every page when there are 5 or fewer', () => {
    expect(getPageItems(1)).toEqual([1]);
    expect(getPageItems(5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses to first, ellipsis, last when there are more than 5 pages', () => {
    expect(getPageItems(6)).toEqual([1, '...', 6]);
    expect(getPageItems(42)).toEqual([1, '...', 42]);
  });
});

describe('getPageHref', () => {
  it('points page 1 at the bare base path', () => {
    expect(getPageHref('/posts', 1)).toBe('/posts');
  });

  it('appends the page number for later pages', () => {
    expect(getPageHref('/posts', 3)).toBe('/posts/3/');
  });
});
