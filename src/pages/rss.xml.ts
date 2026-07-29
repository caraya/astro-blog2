import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getBlogPosts } from '../utils/blogPosts';
import siteData from '../data/site.json';

export const GET: APIRoute = async (context) => {
  const posts = await getBlogPosts();
  return rss({
    title: siteData.site_name,
    description: 'Writings, tutorials, and projects by Carlos Araya',
    site: context.site || 'https://publishing-project.rivendellweb.net',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.desc || '',
      link: `/${post.id}/`,
    })),
  });
}
