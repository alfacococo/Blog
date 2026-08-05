#!/usr/bin/env node
import { readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const POSTS_DIR = path.resolve("src/content/posts");

const [, , ...args] = process.argv;
const title = args.find((a) => !a.startsWith("--"));
const tagsArg = args.find((a) => a.startsWith("--tags="));
const descArg = args.find((a) => a.startsWith("--desc="));
const useMdx = args.includes("--mdx");

if (!title) {
  console.error('用法: node scripts/new-post.mjs "文章标题" [--tags=标签1,标签2] [--desc="一句话简介"] [--mdx]');
  process.exit(1);
}

if (!existsSync(POSTS_DIR)) mkdirSync(POSTS_DIR, { recursive: true });

// 沿用仓库里 post-N.md / post-N.mdx 的顺序编号，自动找下一个可用编号，
// .md 和 .mdx 混在一起统一编号，不然两种格式各编各的号会撞车
const existingIds = readdirSync(POSTS_DIR)
  .map((f) => f.match(/^post-(\d+)\.mdx?$/))
  .filter(Boolean)
  .map((m) => Number(m[1]));

const nextId = (existingIds.length ? Math.max(...existingIds) : 0) + 1;
const postId = `post-${nextId}`;
const ext = useMdx ? "mdx" : "md";
const filePath = path.join(POSTS_DIR, `${postId}.${ext}`);

const today = new Date().toISOString().slice(0, 10);

const tags = tagsArg
  ? tagsArg
      .replace("--tags=", "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  : [];
const description = descArg ? descArg.replace("--desc=", "") : "";

const tagsYaml = tags.length ? `[${tags.map((t) => `"${t}"`).join(", ")}]` : "[]";

const content = `---
title: '${title.replace(/'/g, "\\'")}'
author: Curly Sheep
date: '${today}'
tags: ${tagsYaml}
description: "${description}"
---

<p class='foreword my-3'></p>

`;

writeFileSync(filePath, content, "utf-8");

console.log(`已创建 ${filePath}`);
console.log(`文章 ID: ${postId}`);
console.log(`配图时用: node scripts/insert-images.mjs ${postId} <图片源文件夹>`);

// 顺手用 VS Code 打开，没装 code 命令行工具就静默跳过
try {
  execSync(`code "${filePath}"`, { stdio: "ignore" });
} catch {
  // 忽略，手动打开即可
}
