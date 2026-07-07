// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  applyTagFilter,
  parsePostTags,
  resolveInitialTag,
  setActiveTagLink,
} from './tagFilter';

describe('parsePostTags', () => {
  it('parses a JSON array of strings', () => {
    expect(parsePostTags('["a","b"]')).toEqual(['a', 'b']);
  });

  it('returns an empty array for null input', () => {
    expect(parsePostTags(null)).toEqual([]);
  });

  it('returns an empty array for malformed JSON', () => {
    expect(parsePostTags('{not valid json')).toEqual([]);
  });

  it('filters out non-string entries', () => {
    expect(parsePostTags('["a", 1, null, "b"]')).toEqual(['a', 'b']);
  });

  it('returns an empty array when the JSON is not an array', () => {
    expect(parsePostTags('{"a":1}')).toEqual([]);
  });
});

function makeCard(tags: string[] | null): HTMLElement {
  const li = document.createElement('li');
  const card = document.createElement('a');
  card.setAttribute('data-post-card', '');
  if (tags !== null) {
    card.setAttribute('data-post-tags', JSON.stringify(tags));
  }
  li.appendChild(card);
  return card;
}

describe('applyTagFilter', () => {
  it('shows cards that match the selected tag and hides the rest', () => {
    const match = makeCard(['a', 'b']);
    const noMatch = makeCard(['b']);

    applyTagFilter([match, noMatch], 'a');

    expect(match.closest('li')!.style.display).toBe('');
    expect(noMatch.closest('li')!.style.display).toBe('none');
  });

  it('hides cards with no tags attribute', () => {
    const card = makeCard(null);
    applyTagFilter([card], 'a');
    expect(card.closest('li')!.style.display).toBe('none');
  });

  it('ignores cards without a parent <li>', () => {
    const card = document.createElement('a');
    card.setAttribute('data-post-tags', '["a"]');
    expect(() => applyTagFilter([card], 'a')).not.toThrow();
  });
});

function makeTagLink(tag: string): HTMLElement {
  const el = document.createElement('button');
  el.setAttribute('data-tag', tag);
  return el;
}

describe('setActiveTagLink', () => {
  it('adds is-selected only to the matching link', () => {
    const a = makeTagLink('a');
    const b = makeTagLink('b');

    const active = setActiveTagLink([a, b], 'b');

    expect(a.classList.contains('is-selected')).toBe(false);
    expect(b.classList.contains('is-selected')).toBe(true);
    expect(active).toBe(b);
  });

  it('clears a previously selected link when switching', () => {
    const a = makeTagLink('a');
    const b = makeTagLink('b');
    a.classList.add('is-selected');

    setActiveTagLink([a, b], 'b');

    expect(a.classList.contains('is-selected')).toBe(false);
  });

  it('returns undefined and leaves links untouched when the tag is unknown', () => {
    const a = makeTagLink('a');
    a.classList.add('is-selected');

    const active = setActiveTagLink([a], 'nonexistent');

    expect(active).toBeUndefined();
    expect(a.classList.contains('is-selected')).toBe(false);
  });
});

describe('resolveInitialTag', () => {
  it('uses the query tag when it matches a known tag', () => {
    expect(resolveInitialTag(['a', 'b'], 'b')).toEqual({
      tag: 'b',
      isValidQueryTag: true,
    });
  });

  it('falls back to the first known tag when the query tag is unknown', () => {
    expect(resolveInitialTag(['a', 'b'], 'z')).toEqual({
      tag: 'a',
      isValidQueryTag: false,
    });
  });

  it('falls back to the first known tag when there is no query tag', () => {
    expect(resolveInitialTag(['a', 'b'], null)).toEqual({
      tag: 'a',
      isValidQueryTag: false,
    });
  });

  it('returns null when there are no known tags', () => {
    expect(resolveInitialTag([], null)).toEqual({
      tag: null,
      isValidQueryTag: false,
    });
  });
});
