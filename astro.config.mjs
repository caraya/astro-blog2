// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';

import { unified } from '@astrojs/markdown-remark';

// remark plugins
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';
import { remarkReadingTime } from './src/remark/remark-reading-time.mjs';
import remarkGfm from 'remark-gfm';
import { remarkExtendedTable, extendedTableHandlers } from 'remark-extended-table';
import { devSavePostPlugin } from './src/plugins/devSavePost.mjs';
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
  ],
  vite: {
    plugins: [
      devSavePostPlugin()
    ],
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