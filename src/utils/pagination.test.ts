import { describe, expect, it } from 'vitest';
import { getPageHref, getPageItems } from './pagination';

describe('getPageItems', () => {
  it('lists every page when there are 5 or fewer, regardless of current page', () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses to first, ellipsis, current, ellipsis, last by default when current is in the middle', () => {
    expect(getPageItems(20, 40)).toEqual([1, '...', 20, '...', 40]);
  });

  it('merges the leading run only when current is adjacent to the boundary page', () => {
    expect(getPageItems(1, 40)).toEqual([1, '...', 40]);
    expect(getPageItems(2, 40)).toEqual([1, 2, '...', 40]);
    expect(getPageItems(3, 40)).toEqual([1, '...', 3, '...', 40]);
  });

  it('merges the trailing run only when current is adjacent to the boundary page (symmetric to the start case)', () => {
    expect(getPageItems(40, 40)).toEqual([1, '...', 40]);
    expect(getPageItems(39, 40)).toEqual([1, '...', 39, 40]);
    expect(getPageItems(38, 40)).toEqual([1, '...', 38, '...', 40]);
  });

  it('supports wider boundary/sibling windows via options', () => {
    expect(getPageItems(20, 40, { boundaryCount: 2, siblingCount: 1 })).toEqual([
      1, 2, '...', 19, 20, 21, '...', 39, 40,
    ]);
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
