import fs from 'node:fs/promises';
import path from 'node:path';
import * as yaml from 'js-yaml';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Only allow in development mode for security
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const data = await request.json();
    const { slug, ext = '.md', originalSlug, originalExt = '.md', frontmatter, body } = data;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug is required' }), { status: 400 });
    }

    // Clean up empty fields from frontmatter
    const cleanedFrontmatter = Object.fromEntries(
      Object.entries(frontmatter).filter(([_, v]) => {
        if (v === '' || v === null || v === undefined) return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      })
    );

    // Ensure date is formatted correctly (YYYY-MM-DD)
    if (cleanedFrontmatter.date) {
        cleanedFrontmatter.date = new Date(cleanedFrontmatter.date).toISOString().slice(0, 10);
    }

    const yamlFrontmatter = yaml.dump(cleanedFrontmatter, {
      lineWidth: -1,
      noRefs: true,
    });

    const fileContent = `---\n${yamlFrontmatter}---\n\n${body}`;
    const postsDir = path.join(process.cwd(), 'src/content/blog');
    
    // Check if renaming or changing extension
    if (originalSlug && (originalSlug !== slug || originalExt !== ext)) {
      const originalPath = path.join(postsDir, `${originalSlug}${originalExt}`);
      try {
        await fs.unlink(originalPath);
      } catch (e) {
        console.warn(`Could not delete original file ${originalPath}`, e);
      }
    }

    const newPath = path.join(postsDir, `${slug}${ext}`);
    await fs.writeFile(newPath, fileContent, 'utf-8');

    return new Response(JSON.stringify({ success: true, path: newPath }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error saving post:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
