import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeLazyImages } from "./lazy-images.mjs";
import rehypeExternalLinks from 'rehype-external-links';
import tailwindcss from "@tailwindcss/vite";

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
  },
  site: "https://curly-sheep.netlify.app/",
});
