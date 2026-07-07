#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import sharp from "sharp";

const [,,postId, sourceFolder] = process.argv;

if (!postId || !sourceFolder) {
  console.error("用法: node scripts/insert-images.mjs <文章id> <图片源文件夹>");
  process.exit(1);
}

const targetDir = path.resolve("src/assets/images");
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const MAX_WIDTH = 1200; // 超过这个宽度会被缩小，按你博客实际展示尺寸调整即可
const JPEG_QUALITY = 80; // 0-100，80 通常是肉眼看不太出差别、但文件明显变小的甜点区间

async function processImage(srcPath, destPath, ext) {
  const pipeline = sharp(srcPath).resize({
    width: MAX_WIDTH,
    withoutEnlargement: true, // 如果原图本来就比 MAX_WIDTH 小，不会被强行放大
  });

  if (/\.(jpe?g)$/i.test(ext)) {
    await pipeline.jpeg({ quality: JPEG_QUALITY }).toFile(destPath);
  } else if (/\.png$/i.test(ext)) {
    await pipeline.png({ quality: JPEG_QUALITY }).toFile(destPath);
  } else if (/\.webp$/i.test(ext)) {
    await pipeline.webp({ quality: JPEG_QUALITY }).toFile(destPath);
  } else {
    // gif 等格式 sharp 处理动图支持有限，直接复制原文件，不压缩
    fs.copyFileSync(srcPath, destPath);
  }
}

async function main() {
  const files = fs
    .readdirSync(sourceFolder)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort();

  const markdownLines = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const ext = path.extname(file);
    const newName = `${postId}-${index + 1}${ext}`;
    const srcPath = path.join(sourceFolder, file);
    const destPath = path.join(targetDir, newName);

    const beforeSize = fs.statSync(srcPath).size;
    await processImage(srcPath, destPath, ext);
    const afterSize = fs.statSync(destPath).size;

    const savedPercent = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);
    console.log(
      `${file} → ${newName} (${(beforeSize / 1024).toFixed(0)}KB → ${(afterSize / 1024).toFixed(0)}KB, 省了 ${savedPercent}%)`
    );

    markdownLines.push(`![](../../assets/images/${newName})`);
  }

  const output = markdownLines.join("\n\n");
  console.log("\n" + output);

  try {
    execSync("pbcopy", { input: output });
    console.log("\n✅ 已复制到剪贴板，可以直接粘贴进文章！");
  } catch {
    // 非 mac 环境忽略
  }
}

main();