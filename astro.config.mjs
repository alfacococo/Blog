import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeLazyImages } from "./lazy-images.mjs";
import rehypeExternalLinks from 'rehype-external-links';
import tailwindcss from "@tailwindcss/vite";

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  image: {
    // 让 markdown 里的本地图片自动输出多档宽度的 srcset + sizes（响应式图片）。
    // 之前每张配图只有原始 1200px 宽的单一版本，手机按 ~380px 显示也要下载
    // 300KB+ 的大图，图多的文章页光配图就 2.6MB，把慢速网络的带宽全部挤占，
    // LCP 被拖到 8 秒开外；constrained 布局下手机只会取 ~750px 档。
    layout: 'constrained',
  },

  build: {
    // 把构建出的样式表直接内联进每页 HTML，省掉一个渲染阻塞的 CSS 请求。
    // 慢速 4G 下这个请求要 450ms+，是 Lighthouse "渲染阻塞请求" 里最大的一项；
    // 内联后 gzip 体积只多几 KB，但首屏渲染不再等它的往返。
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeLazyImages, [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]],
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      // 关掉 Shiki 默认生成的那套"跟随系统 prefers-color-scheme"切换逻辑——
      // 我们博客的深浅色是靠手动点按钮切 <html class="light">，不是跟系统走的，
      // 用默认的 media query 会导致代码块颜色和站点其他地方的主题各切各的、对不上。
      // 关掉之后 Shiki 只在每个 token 上留 --shiki-light / --shiki-dark 这两个变量，
      // 由 prose.css 里我们自己写的规则决定读哪一个。
      defaultColor: false,
    },
  },

  site: "https://curly-sheep.netlify.app/",
  integrations: [mdx()],
});