import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeLazyImages } from "./lazy-images.mjs";
import rehypeExternalLinks from 'rehype-external-links';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
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
