import { defineConfig } from 'astro/config';
import { rehypeLazyImages } from "./lazy-images.mjs";
import rehypeExternalLinks from 'rehype-external-links';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeLazyImages, [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]],
  },
  site: "https://curly-sheep.netlify.app/",
});
