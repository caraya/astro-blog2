import atom from 'astrojs-atom';
import type { APIRoute } from 'astro';
import { getBlogPosts } from '../utils/blogPosts';
import siteData from '../data/site.json';

export const GET: APIRoute = async (context) => {
  const posts = await getBlogPosts();
  const site = context.site?.href || 'https://publishing-project.rivendellweb.net/';
  
  return atom({
    title: siteData.site_name,
    subtitle: 'Writings, tutorials, and projects by Carlos Araya',
    id: site,
    updated: posts.length > 0 ? new Date(posts[0].data.date).toISOString() : new Date().toISOString(),
    entry: posts.map((post) => ({
      title: post.data.title,
      id: new URL(`${post.id}/`, site).href,
      updated: new Date(post.data.date).toISOString(),
      summary: post.data.desc || '',
      link: [
        { href: new URL(`${post.id}/`, site).href, rel: 'alternate' }
      ],
      author: [
        {
          name: 'Carlos Araya',
          email: siteData.email?.replace('mailto:', '') || 'carlos.araya@gmail.com'
        }
      ]
    })),
  });
}
