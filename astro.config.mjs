import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
// import rss from "@astrojs/rss";

// https://astro.build/config
export default defineConfig({
  // integrations: [rss()],
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://curly-sheep.netlify.app/",
});
