import { defineCollection } from 'astro:content';

import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { publishingSchema } from './integrations/publishing/schema';

const blogSchema = z.object({
  title: z.string(),
  author: z.string().optional().default('Carlos Araya'),
  date: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
    .transform((value) =>
      typeof value === 'string' ? value : value.toISOString().slice(0, 10)
    ),
  categories: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  language: z.string().optional(),
  desc: z.string().optional(),
  baseline: z.boolean().optional().default(false),
  colorjs: z.boolean().optional().default(false),
  youtube: z.boolean().optional().default(false),
  vimeo: z.boolean().optional().default(false),
  mavo: z.boolean().optional().default(false),
  mermaid: z.boolean().optional().default(false),
  math: z.boolean().optional().default(false),
  sandpack: z.boolean().optional().default(false),
  codeSnippets: z.record(z.string(), z.record(z.string(), z.string())).optional(),
}).merge(publishingSchema);

const blog = defineCollection({
  loader: glob({ pattern: '[^_]*.{md,mdx}', base: 'src/content/blog' }),
  schema: blogSchema,
});

export const collections = {
  blog,
};
