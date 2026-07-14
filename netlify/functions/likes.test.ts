import type { Context } from '@netlify/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import likes from './likes.mts';

const { getStore } = vi.hoisted(() => ({ getStore: vi.fn() }));
vi.mock('@netlify/blobs', () => ({ getStore }));

function makeStore(initial: Record<string, number> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    async get(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    async setJSON(key: string, value: number) {
      data.set(key, value);
    },
  };
}

function request(method: string, slug?: string) {
  const url = slug
    ? `http://localhost/.netlify/functions/likes?slug=${slug}`
    : 'http://localhost/.netlify/functions/likes';
  return new Request(url, { method });
}

const noopContext = {} as Context;

let store: ReturnType<typeof makeStore>;

beforeEach(() => {
  store = makeStore();
  getStore.mockReturnValue(store);
});

describe('likes function', () => {
  it('returns 400 when the slug parameter is missing', async () => {
    const res = await likes(request('GET'), noopContext);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: '缺少 slug 参数' });
  });

  it('returns 405 for unsupported methods', async () => {
    const res = await likes(request('DELETE', 'post-1'), noopContext);
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: '不支持的请求方法' });
  });

  describe('GET', () => {
    it('returns 0 for a slug with no stored count', async () => {
      const res = await likes(request('GET', 'post-1'), noopContext);
      expect(await res.json()).toEqual({ count: 0 });
    });

    it('returns the stored count for a known slug', async () => {
      store = makeStore({ 'post-1': 5 });
      getStore.mockReturnValue(store);

      const res = await likes(request('GET', 'post-1'), noopContext);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      expect(await res.json()).toEqual({ count: 5 });
    });

    it('falls back to the legacy `.md` key and migrates it to the new key', async () => {
      store = makeStore({ 'post-1.md': 7 });
      getStore.mockReturnValue(store);

      const res = await likes(request('GET', 'post-1'), noopContext);

      expect(await res.json()).toEqual({ count: 7 });
      expect(store.data.get('post-1')).toBe(7);
    });

    it('prefers the new key over the legacy key when both exist', async () => {
      store = makeStore({ 'post-1': 5, 'post-1.md': 7 });
      getStore.mockReturnValue(store);

      const res = await likes(request('GET', 'post-1'), noopContext);
      expect(await res.json()).toEqual({ count: 5 });
    });
  });

  describe('POST', () => {
    it('increments from 0 when no prior count exists', async () => {
      const res = await likes(request('POST', 'post-1'), noopContext);

      expect(res.headers.get('Content-Type')).toBe('application/json');
      expect(await res.json()).toEqual({ count: 1 });
      expect(store.data.get('post-1')).toBe(1);
    });

    it('increments an existing count under the new key', async () => {
      store = makeStore({ 'post-1': 5 });
      getStore.mockReturnValue(store);

      const res = await likes(request('POST', 'post-1'), noopContext);
      expect(await res.json()).toEqual({ count: 6 });
      expect(store.data.get('post-1')).toBe(6);
    });

    it('increments from the legacy count and persists under the new key', async () => {
      store = makeStore({ 'post-1.md': 7 });
      getStore.mockReturnValue(store);

      const res = await likes(request('POST', 'post-1'), noopContext);

      expect(await res.json()).toEqual({ count: 8 });
      expect(store.data.get('post-1')).toBe(8);
    });
  });
});
