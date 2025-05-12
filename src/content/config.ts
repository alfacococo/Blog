import { z, defineCollection } from "astro:content";
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }),
    worksImage1: z.object({
      url: z.string(),
      alt: z.string()
    }),
    worksImage2: z.object({
      url: z.string(),
      alt: z.string()
    }),
    platform: z.string(),
    stack: z.string(),
    website: z.string(),
    github: z.string(),
  })
});

const postsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    author: z.string().optional(),
    date: z.string().or(z.date()),
    updateDate: z.string().or(z.date()).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
  }),
});


export const collections = {
  projects: projectsCollection,
  posts: postsCollection
};
