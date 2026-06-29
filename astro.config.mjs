import { defineConfig } from 'astro/config';
import { rehypeLazyImages } from "./lazy-images.mjs";
import tailwindcss from "@tailwindcss/vite";
// import rss from "@astrojs/rss";

// https://astro.build/config
export default defineConfig({
  // integrations: [rss()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeLazyImages],
  },
  site: "https://curly-sheep.netlify.app/",
});
