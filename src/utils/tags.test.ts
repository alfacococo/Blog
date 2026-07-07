import type { CollectionEntry } from 'astro:content';
import { describe, expect, it } from 'vitest';
import { getSortedTags, getTagCounts } from './tags';

function makePost(tags: (string | undefined)[] | undefined): CollectionEntry<'posts'> {
  return { data: { tags } } as unknown as CollectionEntry<'posts'>;
}

describe('getTagCounts', () => {
  it('counts how many posts each tag appears in', () => {
    const posts = [makePost(['a', 'b']), makePost(['a']), makePost(['b', 'c'])];
    expect(getTagCounts(posts)).toEqual({ a: 2, b: 2, c: 1 });
  });

  it('ignores empty-string and whitespace-only tags', () => {
    const posts = [makePost(['', '  ', 'a'])];
    expect(getTagCounts(posts)).toEqual({ a: 1 });
  });

  it('treats posts with no tags as contributing nothing', () => {
    const posts = [makePost(undefined), makePost(['a'])];
    expect(getTagCounts(posts)).toEqual({ a: 1 });
  });

  it('returns an empty object when there are no posts', () => {
    expect(getTagCounts([])).toEqual({});
  });
});

describe('getSortedTags', () => {
  it('sorts tags by post count descending', () => {
    expect(getSortedTags({ a: 1, b: 3, c: 2 })).toEqual(['b', 'c', 'a']);
  });

  it('returns an empty array for an empty map', () => {
    expect(getSortedTags({})).toEqual([]);
  });
});
