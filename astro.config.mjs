// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';
import mermaid from 'astro-mermaid';

import { unified } from '@astrojs/markdown-remark';

// remark plugins
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import { remarkReadingTime } from './src/remark/remark-reading-time.mjs';
import remarkGfm from 'remark-gfm';
import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import { devSavePostPlugin } from './src/plugins/devSavePost.mjs';


// https://astro.build/config
export default defineConfig({
  site: 'https://publishing-project.rivendellweb.net',
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [
      remarkDefinitionList,
      remarkReadingTime,
      remarkGfm,
      remarkExtendedTable,
    ],
    remarkRehype: {
      handlers: {
        ...defListHastHandlers,
        ...extendedTableHandlers,
      },
    },
  },
  integrations: [
    react(),
    mdx(),
    icon(),
    pagefind(),
    sitemap(),
    mermaid(),
  ],
  vite: {
    plugins: [
      devSavePostPlugin()
    ]
  }
});