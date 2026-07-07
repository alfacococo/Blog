import { describe, expect, it } from 'vitest';
import { getReadingTime, getWordCount } from './wordCount';

describe('getWordCount', () => {
  it('counts only Chinese characters when onlyChinese is true', () => {
    expect(getWordCount('你好 hello 世界 123', { onlyChinese: true })).toBe(4);
  });

  it('returns 0 for onlyChinese when there are no Chinese characters', () => {
    expect(getWordCount('hello world 123', { onlyChinese: true })).toBe(0);
  });

  it('strips markdown syntax and whitespace by default', () => {
    expect(getWordCount('# Hello\n\n**world** - a *test*')).toBe(
      'Helloworldatest'.length,
    );
  });

  it('returns 0 for empty content', () => {
    expect(getWordCount('')).toBe(0);
    expect(getWordCount('', { onlyChinese: true })).toBe(0);
  });
});

describe('getReadingTime', () => {
  it('rounds up to the nearest minute', () => {
    expect(getReadingTime(401, 400)).toBe(2);
    expect(getReadingTime(400, 400)).toBe(1);
  });

  it('never returns less than 1 minute, even for 0 words', () => {
    expect(getReadingTime(0)).toBe(1);
  });

  it('uses the default of 400 words per minute', () => {
    expect(getReadingTime(800)).toBe(2);
  });
});
