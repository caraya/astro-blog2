import { z } from 'astro/zod';

/**
 * Publishing Workflow Schema
 * 
 * To use this integration in a host Astro site, you must merge this schema 
 * into your site's existing content collections.
 * 
 * Example usage in your `src/content.config.ts`:
 * 
 * ```typescript
 * import { defineCollection, z } from 'astro:content';
 * import { publishingSchema } from 'your-publishing-integration/schema';
 * 
 * const blog = defineCollection({
 *   schema: z.object({
 *     title: z.string(),
 *     // ... your other fields
 *   }).merge(publishingSchema) // <-- Merge here!
 * });
 * ```
 */

export const publishingSchema = z.object({
  status: z.enum(['first-draft', 'needs-review', 'ready-to-publish']).optional(),
  draft: z.boolean().default(false),
});
