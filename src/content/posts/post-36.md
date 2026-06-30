---
title: '卷毛羊的多图博文工作流程'
author: Curly Sheep
date: '2026-07-01'
tags: ["博客教程"]
description: "一直坚持古法手工作业的羊羊，终于免费了！"
---

<p class='foreword my-3'>如何在博客里面插入多张图片，这个问题其实从第一篇博文开始就一直困扰我，不过我的耐性实在是太好了（？），所以才能忍受这么久低效率的古法手工作业，也没想着去改善一下，直到最近才跟克老师商量出来一个比较省力的办法，在学学的提议下有了这么一期博客！</p>

<div class="divider mb-3 mx-auto"></div>

### 最开始图片是怎么插入的？

说起来还有点丢人，最开始的博文我是手机拍照然后用微信的**文件传输助手**。因为我手机是iOS然后之前电脑是Windows的嘛，很早以前折腾过一次windows端的苹果图库同步发现巨慢巨难用，然后就干脆放弃了，也没有再坚持找其他方法（就是一个这么善于放弃的人）……传图的需求不是很大，微信文件传输助手也够用，所以博客写多图博文一开始是真的把我难住了。

具体来说就是：一张张从手机上选中传过去，再在电脑上一张张点开保存到指定文件夹然后重命名，最后再复制我写好的img标签一个个修改文件路径插入……光是这么说都觉得很累人，但我竟然坚持了这样的作业这么久？！我都不知道自己是怎么想的……

好在这样集中用手机拍照传图的博文也没有几篇，在后面的图文博客基本上就是月总结了，这时至少拍照的功夫我可以省下来了。然后写月总结的时候我习惯写之前过一遍自己的毛象/星屑，基本上想发博客的图都能在上面找着，不用再从手机里面一张张搜寻，只要在毛象/星屑网页端下载下来就可以。而且复习嘟文的时候忘了下载也不要紧，毛象/星屑都有专门的媒体文件页面，从那里点进去看缩略图选取也很方便。

不过这依旧有点麻烦：毛象缩略图固然可以右键点击选择另存为，只是想要高清图片的话就必须点开图片原链接再保存……星屑的网盘界面右键也可以点击下载，但跳出来的不是保存界面而是一个新标签页，依然需要在新标签页再保存一次图片。

好在最近电脑换成Mac Mini后保存图片到指定路径的难题基本上解决了！手机上的照片会同步到电脑端，哪怕是新拍的，同步速度也很快。而我自从买了照片打印机以来，就有每个月整理照片把想打印的照片先加进收藏再打印的习惯，所以选照片也可以直接从里面选，如果有想要补充的其他照片的话额外找或者加也不太麻烦。保存到博客目录的话，只要左边一个图库，右边博客目录，然后选中拖拽即可！

### 改善后的工作流程是什么样的？

选取图片和保存图片到博客目录的难题基本解决了，但还存在很多其他问题：首先是复制粘贴写好的img标签然后再改图片路径好像有点太笨了，难道就没有什么更省力的办法？其次是如何重命名成我想要的格式？这一部分可一直是我手工作业，图片数量来到五六十张的时候，重命名是真的能烦死个人。

前者我一开始跟克老师商量的是，把img标签的样式写到全局css里面，然后用markdown语法（草我问了之后才知道还有这么方便的写法）直接写图片路径就可以了。我想要的懒加载效果的话，让克老师给我写个插件，在markdown渲染成html的时候自动加上。我试了试觉得还行，但一想到图片路径还要我手动输入就有点不爽……再加上重命名的问题也还没解决，就干脆把我的整个图片插入流程给克老师复述了一遍，问它能怎么改善这个流程。

克老师果然很靠谱！直接给我写了个脚本，用了之后只要把选好的图片放到临时文件夹，再跑一条命令，脚本就会自动执行挑图之后的工作：替我重命名并保存到博客的图片目录，再生成markdown的引用代码并自动复制到我的粘贴板，这样我只需要粘贴到文章就可以了！并且还替我考虑到了图片压缩，帮我把这个一起加入到了工作流程里。下面是查老师给我写的脚本代码，大家有需要的话可以拿走让自己的AI老师魔改一下！

```js
#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import sharp from "sharp";

const [, , postId, sourceFolder] = process.argv;

if (!postId || !sourceFolder) {
  console.error("用法: node scripts/insert-images.mjs <文章id> <图片源文件夹>");
  process.exit(1);
}

const targetDir = path.resolve("public/images");
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

    markdownLines.push(`![](images/${newName})`);
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
```

### 卷毛羊博文里的图片放大效果是怎么实现的？

这个其实也是克老师提的附带解决方案的建议之一，我想了下自己博客内容部分的电脑端显示宽度确实很窄，图片就更小了，手机稍微好点但是不能点击放大好像也少了点什么。所以欣然接受了这个建议，并装了medium-zoom这个库！所需的代码也不多，就短短几行，放到自己博文会渲染的地方就行了，如果大家需要的话代码如下：

```js
<script>
  import mediumZoom from "medium-zoom";

  function initImageZoom() {
    mediumZoom(".prose img", {
      background: "rgba(0, 0, 0, 0.8)",
      margin: 24, // 放大后图片跟屏幕边缘留一点呼吸空间
    });
  }

  initImageZoom();
  document.addEventListener("astro:page-load", initImageZoom);
</script>
```

装了mediumZoom之后，再把“.prose img”这个类名改成自己博文对应的图片类名应该就可以了！可能放大后会被其他元素覆盖，这时候可以考虑在css里面手动加上：

```css
.medium-zoom-overlay,
   .medium-zoom-image--opened {
     z-index: 999;
   }
```

<div class="divider my-3 mx-auto"></div>
<p class='foreword'>羊羊的多图博文处理流程就是这么回事啦！其实我感觉文字为主的博文写作流程好像也可以稍微改进一下，不过暂时没办法特定到具体的痛点，等我再好好感受一下，想到什么了再跟克老师商量试试！</p>
