import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const RSS_PATH = 'dist/rss.xml';
const POSTS_DIR = 'src/content/posts';

function fail(message) {
  console.error(`✗ RSS check failed: ${message}`);
  process.exit(1);
}

let xml;
try {
  xml = readFileSync(RSS_PATH, 'utf-8');
} catch {
  fail(`${RSS_PATH} not found — did the build run first?`);
}

const dom = new JSDOM();
const doc = new dom.window.DOMParser().parseFromString(xml, 'application/xml');

if (doc.querySelector('parsererror')) {
  fail(`${RSS_PATH} is not well-formed XML`);
}

const channel = doc.querySelector('channel');
if (!channel) fail('missing <channel> element');

const items = Array.from(doc.querySelectorAll('item'));
const postCount = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).length;

if (items.length !== postCount) {
  fail(
    `expected ${postCount} <item> entries (one per markdown post), found ${items.length}`,
  );
}

items.forEach((item, index) => {
  ['title', 'link', 'guid', 'pubDate'].forEach((field) => {
    const el = item.querySelector(field);
    if (!el || !el.textContent?.trim()) {
      fail(`item #${index + 1} is missing a non-empty <${field}>`);
    }
  });

  const link = item.querySelector('link').textContent;
  if (!link.startsWith('http')) {
    fail(`item #${index + 1} has a non-absolute <link>: ${link}`);
  }
});

console.log(`✓ RSS check passed: ${items.length} items, all required fields present`);
