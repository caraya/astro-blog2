import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { devSavePostPlugin } from './devSavePost.mjs';

export default function publishingWorkflowIntegration(options = {}) {
  return {
    name: 'astro-publishing-workflow',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        // Resolve absolute path to current directory of the integration
        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        // Inject Editor Route
        injectRoute({
          pattern: '/editor',
          entrypoint: path.join(__dirname, 'editor.astro')
        });

        // Inject Calendar Route
        injectRoute({
          pattern: '/calendar',
          entrypoint: path.join(__dirname, 'calendar.astro')
        });

        // Add Vite plugin for backend saving functionality
        updateConfig({
          vite: {
            plugins: [devSavePostPlugin()]
          }
        });
      }
    }
  };
}
