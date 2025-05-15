import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');

  return rss({
    title: 'Curly Sheep | Blog',
    description: '卷毛羊的博客~！',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
      description: post.data.description || '',
    })),
    customData: `<language>zh-cn</language>`,
  });
}
