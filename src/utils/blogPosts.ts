import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { Temporal } from '@js-temporal/polyfill';

export type BlogPostEntry = CollectionEntry<'blog'>;

export const POSTS_PER_PAGE = 10;

export function toBlogDate(date: string) {
  return Temporal.PlainDate.from(date);
}

export function isPublicBlogPost(post: BlogPostEntry, currentDate = Temporal.Now.plainDateISO()) {
  return !post.data.draft && Temporal.PlainDate.compare(toBlogDate(post.data.date), currentDate) <= 0;
}

export async function getBlogPosts(includeDrafts = false) {
  const posts = await getCollection('blog');

  const visiblePosts = includeDrafts
    ? posts
    : posts.filter((post) => isPublicBlogPost(post));

  return visiblePosts
    .sort((left, right) => Temporal.PlainDate.compare(toBlogDate(right.data.date), toBlogDate(left.data.date)));
}

export function paginateBlogPosts(posts: BlogPostEntry[], currentPage: number, pageSize = POSTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;

  return {
    currentPage: safeCurrentPage,
    totalPages,
    posts: posts.slice(startIndex, startIndex + pageSize),
  };
}

export function getPageHref(pageNumber: number) {
  return pageNumber <= 1 ? '/' : `/page/${pageNumber}`;
}

export function getBlogPostNavigation(currentPost: BlogPostEntry, includeDrafts = false) {
  return getBlogPosts(includeDrafts).then((posts) => {
    const currentIndex = posts.findIndex((post) => post.id === currentPost.id);

    if (currentIndex === -1) {
      return { newerPost: null, olderPost: null };
    }

    return {
      newerPost: posts[currentIndex - 1]
        ? {
            href: `/${posts[currentIndex - 1].id}`,
            title: posts[currentIndex - 1].data.title,
          }
        : null,
      olderPost: posts[currentIndex + 1]
        ? {
            href: `/${posts[currentIndex + 1].id}`,
            title: posts[currentIndex + 1].data.title,
          }
        : null,
    };
  });
}