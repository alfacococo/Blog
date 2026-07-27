#!/usr/bin/env node
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  chmodSync,
  copyFileSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import matter from "gray-matter";

const POSTS_DIR = path.resolve("src/content/posts");
const IMAGES_DIR = path.resolve("src/assets/images");
// 换电脑或路径不对时，用 OBSIDIAN_VAULT_PATH=你的实际路径 覆盖，不用改代码
const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || "/Users/lanmoya/Obsdian/Mac备份";
const PUBLISHED_DIR = path.join(VAULT_PATH, "Published");
const PUBLISHED_IMAGES_DIR = path.join(PUBLISHED_DIR, "images");
const INDEX_PATH = path.join(PUBLISHED_DIR, ".sync-index.json");
const SITE_URL = "https://curly-sheep.netlify.app/";

const forceAll = process.argv.includes("--all");

if (!existsSync(VAULT_PATH)) {
  console.error(`✗ 找不到 Obsidian vault 路径: ${VAULT_PATH}`);
  console.error("  路径不对的话用 OBSIDIAN_VAULT_PATH=实际路径 node scripts/sync-to-obsidian.mjs 覆盖");
  process.exit(1);
}
if (!existsSync(PUBLISHED_DIR)) mkdirSync(PUBLISHED_DIR, { recursive: true });

// 只同步"这次 commit 里改动过的文章"，不做全量刷新。
// 唯一的例外：仓库只有一个 commit、没有 HEAD~1 可比较时，视为第一次运行，全量同步一次打底。
function getChangedPostFiles() {
  if (forceAll) {
    return readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  }
  try {
    const out = execSync("git diff --name-only HEAD~1 HEAD -- src/content/posts", {
      encoding: "utf-8",
    });
    return out
      .split("\n")
      .map((l) => path.basename(l.trim()))
      .filter((f) => f.endsWith(".md"));
  } catch {
    // 没有 HEAD~1（仓库刚初始化的第一个 commit）
    return readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  }
}

function toObsidianTagsYaml(tags) {
  if (!tags || !tags.length) return "tags: []";
  return `tags:\n${tags.map((t) => `  - ${t}`).join("\n")}`;
}

// 用标题当文件名，去掉文件系统不允许的字符
function sanitizeFilename(title) {
  const cleaned = title
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "未命名文章";
}

function loadIndex() {
  if (!existsSync(INDEX_PATH)) return {};
  try {
    return JSON.parse(readFileSync(INDEX_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveIndex(index) {
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");
}

// 把正文里引用的本地图片复制进 vault，并把链接改写成从 Published/ 出发能显示的相对路径
function localizeImages(content) {
  const imageRefRegex = /!\[([^\]]*)\]\(([^)]*assets\/images\/([^)/]+))\)/g;
  return content.replace(imageRefRegex, (match, alt, _fullPath, imgFilename) => {
    const srcImgPath = path.join(IMAGES_DIR, imgFilename);
    if (existsSync(srcImgPath)) {
      if (!existsSync(PUBLISHED_IMAGES_DIR)) mkdirSync(PUBLISHED_IMAGES_DIR, { recursive: true });
      copyFileSync(srcImgPath, path.join(PUBLISHED_IMAGES_DIR, imgFilename));
      return `![${alt}](images/${imgFilename})`;
    }
    console.warn(`  警告：找不到图片源文件 ${imgFilename}，链接保持原样`);
    return match;
  });
}

const files = getChangedPostFiles();

if (!files.length) {
  console.log("这次 commit 没有改动文章，跳过同步。");
  process.exit(0);
}

const index = loadIndex();
let syncedCount = 0;

for (const file of files) {
  const srcPath = path.join(POSTS_DIR, file);
  if (!existsSync(srcPath)) continue; // 文章被删除了，跳过

  const raw = readFileSync(srcPath, "utf-8");
  const { data, content } = matter(raw);
  const postId = file.replace(/\.md$/, "");
  const title = (data.title || postId).trim();
  const filename = `${sanitizeFilename(title)}.md`;
  const destPath = path.join(PUBLISHED_DIR, filename);
  const liveUrl = `${SITE_URL}posts/${postId}`;

  const rewrittenContent = localizeImages(content);

  const note = `> [!info] 已发布文章的只读同步副本
> 来源: \`src/content/posts/${file}\`
> 在线阅读: ${liveUrl}
> 此文件由脚本自动生成，请勿在此处编辑，改动请回到博客仓库对应文件。

`;

  const body = `---
title: '${title.replace(/'/g, "\\'")}'
date: '${data.date || ""}'
${toObsidianTagsYaml(data.tags)}
postId: ${postId}
source: ${liveUrl}
---

${note}${rewrittenContent.trim()}
`;

  // 如果这篇文章标题变过、文件名跟着变了，删掉旧标题对应的那份副本，避免留孤儿文件
  if (index[postId] && index[postId] !== filename) {
    const oldPath = path.join(PUBLISHED_DIR, index[postId]);
    if (existsSync(oldPath)) {
      try {
        chmodSync(oldPath, 0o644);
        unlinkSync(oldPath);
        console.log(`  （标题变更，已删除旧同步副本《${index[postId]}》）`);
      } catch (e) {
        console.warn(`  警告：旧同步副本删除失败（${index[postId]}），可能需要手动清理: ${e.message}`);
      }
    }
  }
  index[postId] = filename;

  if (existsSync(destPath)) chmodSync(destPath, 0o644); // 先解锁，避免覆盖失败
  writeFileSync(destPath, body, "utf-8");
  chmodSync(destPath, 0o444); // 只读，提醒这是同步副本，改动要回源仓库

  console.log(`✓ 同步 ${file} → Published/${filename}`);
  syncedCount++;
}

saveIndex(index);
console.log(`\n共同步 ${syncedCount} 篇文章到 Obsidian。`);
