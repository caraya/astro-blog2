import fs from 'node:fs/promises';
import path from 'node:path';
import * as yaml from 'js-yaml';

export function devSavePostPlugin() {
  return {
    name: 'vite-plugin-dev-save-post',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/save-post') {
          try {
            let bodyStr = '';
            for await (const chunk of req) {
              bodyStr += chunk;
            }
            const data = JSON.parse(bodyStr);
            const { slug, ext = '.md', originalSlug, originalExt = '.md', frontmatter, body } = data;

            if (!slug) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Slug is required' }));
              return;
            }

            // Clean up empty fields from frontmatter
            const cleanedFrontmatter = Object.fromEntries(
              Object.entries(frontmatter).filter(([_, v]) => {
                if (v === '' || v === null || v === undefined) return false;
                if (Array.isArray(v) && v.length === 0) return false;
                return true;
              })
            );

            // Ensure date is formatted correctly (YYYY-MM-DD) without timezone shifts
            if (cleanedFrontmatter.date) {
              const rawDate = String(cleanedFrontmatter.date).trim();
              if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
                cleanedFrontmatter.date = rawDate;
              } else if (rawDate.includes('/')) {
                const parts = rawDate.split('/');
                if (parts.length === 3) {
                  cleanedFrontmatter.date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                }
              } else {
                try {
                  cleanedFrontmatter.date = new Date(rawDate).toISOString().slice(0, 10);
                } catch {
                  // Keep as-is if parsing fails
                }
              }
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

            // Force Astro Content Layer cache invalidation by updating content.config.ts mtime
            const configPath = path.join(process.cwd(), 'src/content.config.ts');
            try {
              const now = new Date();
              await fs.utimes(configPath, now, now);
            } catch (e) {
              // Ignore if utimes is unsupported
            }

            // Notify Vite HMR client to reload data
            if (server?.ws) {
              server.ws.send({ type: 'full-reload' });
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, path: newPath }));
          } catch (error) {
            console.error('Error saving post:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
          return;
        }
        next();
      });
    }
  };
}
