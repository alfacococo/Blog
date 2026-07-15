import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';
import { postFrontmatterSchema } from './content/postSchema';


const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: postFrontmatterSchema,
});


export const collections = {
  posts: postsCollection
};
