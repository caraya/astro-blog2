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
