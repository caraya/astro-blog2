// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

import { unified } from '@astrojs/markdown-remark';

// remark plugins
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import { remarkReadingTime } from './src/remark/remark-reading-time.mjs';
import remarkGfm from 'remark-gfm';
import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import publishingWorkflowIntegration from './src/integrations/publishing/index.mjs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';


// https://astro.build/config
export default defineConfig({
  site: 'https://publishing-project.rivendellweb.net',
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: [
        [remarkMath, { singleDollarTextMath: true }],
        remarkDefinitionList,
        remarkReadingTime,
        remarkGfm,
        remarkExtendedTable,
      ],
      rehypePlugins: [
        rehypeKatex,
      ],
      remarkRehype: {
        handlers: {
          ...defListHastHandlers,
          ...extendedTableHandlers,
        },
      },
    }),
  },
  integrations: [
    react(),
    mdx(),
    icon(),
    pagefind(),
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        // Precache only the absolute bare minimum shell assets
        globPatterns: [
          'index.html',
          '404.html',
          'offline/index.html',
          'fonts/recursive.woff2',
          'css/main.css',
          'images/cropped-Long_Room_Interior_Trinity_College_Dublin_Ireland.webp'
        ],
        // Strip out any stragglers caught by public globs or Vite Rollup injection
        manifestTransforms: [
          async (entries) => {
            const manifest = entries.filter((entry) => {
              const url = entry.url;
              if (url.includes('_astro/')) return false;
              if (url.includes('editor/')) return false;
              if (url.includes('calendar/')) return false;
              if (url.includes('pagefind/')) return false;
              if (url.includes('vendor/')) return false;
              if (url.includes('/js/')) return false;
              if (url.endsWith('.js') && !url.includes('sw.js')) return false;
              return true;
            });
            return { manifest, warnings: [] };
          }
        ],
      },
    }),
    publishingWorkflowIntegration(),
  ],
  vite: {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules\/(react|react-dom)/,
                priority: 10
              },
              {
                name: 'sandpack',
                test: /node_modules\/@codesandbox\/sandpack-react/,
                priority: 10
              },
              {
                name: 'temporal-polyfill',
                test: /node_modules\/@js-temporal\/polyfill/,
                priority: 10
              }
            ]
          }
        }
      }
    }
  }
});