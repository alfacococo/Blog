import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import subsetFont from 'subset-font';

const DIST_DIR = 'dist';
const POSTS_DIR = 'src/content/posts';
const SOURCE_FONT = 'public/fonts/LXGWNeoXiHei.ttf';
const OUTPUT_FONT = 'dist/fonts/LXGWNeoXiHei.subset.woff2';

const HTML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function walk(dir, exts) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full, exts));
    } else if (exts.includes(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

function decodeEntities(text) {
  return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const codePoint =
        entity[1] === 'x' || entity[1] === 'X'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }
    return HTML_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function extractVisibleText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

// 用到的字符集来自两个来源取并集：
// 1. dist/**/*.html —— 实际渲染出来的最终文本，最准确，覆盖所有 UI 文案 + 文章正文
// 2. src/content/posts/**/*.md —— 文章 Markdown 源文件兜底，防止极端情况下有文字
//    没有被渲染进静态 HTML（目前站点是纯 SSG，理论上不会发生，多扫一遍成本很低）
// 不特意按 Unicode 区块过滤"是不是中文"——直接把扫到的每个字符都塞进子集，
// 简单可靠，多出来的几十个 ASCII 字形几乎不占体积，比自己猜标点符号区间安全得多。
const chars = new Set();

for (const file of walk(DIST_DIR, ['.html'])) {
  const text = extractVisibleText(readFileSync(file, 'utf-8'));
  for (const ch of text) chars.add(ch);
}

for (const file of walk(POSTS_DIR, ['.md', '.mdx'])) {
  const text = readFileSync(file, 'utf-8');
  for (const ch of text) chars.add(ch);
}

const text = Array.from(chars).join('');
const originalFont = readFileSync(SOURCE_FONT);
const subsetBuffer = await subsetFont(originalFont, text, { targetFormat: 'woff2' });

mkdirSync('dist/fonts', { recursive: true });
writeFileSync(OUTPUT_FONT, subsetBuffer);

const originalKiB = (originalFont.length / 1024).toFixed(0);
const subsetKiB = (subsetBuffer.length / 1024).toFixed(0);
console.log(
  `✓ Font subset: ${chars.size} unique characters, ${originalKiB} KiB → ${subsetKiB} KiB`,
);
