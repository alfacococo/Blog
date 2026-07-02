import { z, defineCollection } from "astro:content";
import { glob } from 'astro/loaders';


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
  posts: postsCollection
};
