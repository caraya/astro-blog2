---
title: "Astro Or Eleventy?"
date: 2026-08-14
tags:
  - Web
  - Static Site Generators
  - Astro
  - Eleventy
---

When I first moved away from WordPress, I chose Eleventy for one reason: control. It is flexible and does not force a framework or folder structure.

Over time, though, I started encountering tradeoffs. Some were platform constraints, and some reflected gaps in my own mental model of Eleventy. That led me to evaluate Astro more closely.

This post compares Astro and Eleventy in three layers: architecture, content modeling, and a real-world hydration scenario.

## Key Differences Between Astro and Eleventy

Astro and Eleventy both generate static HTML, CSS, and JavaScript, but they diverge in component architecture, hydration controls, and build ergonomics.

| Feature | Astro | Eleventy |
| --- | --- | --- |
| **Island support** | Native architectural pattern | Opt-in via the `@11ty/is-land` plugin |
| **Component model** | Multi-framework (React, Vue, Svelte, Solid) | Templating languages (Nunjucks, Liquid, Markdown) |
| **Hydration syntax** | Component directives (`client:load`, `client:visible`) | Web components (`<is-land on:visible>`) |
| **Asset bundling** | Built-in (Vite) | Manual configuration |
| **Build speed** | Depends on project size, integrations, and asset pipeline; often slower when shipping framework-heavy islands | Depends on template/data complexity; often fast for content-heavy sites |

### Using Frameworks and JavaScript Libraries

The next difference appears as soon as you add a frontend framework.

In Astro, a single command installs and configures the integration:

```bash
npx astro add react
```

That command installs dependencies and configures the integration with default settings.

Eleventy has no direct equivalent. You can still use React (or another library), but you manage the bundling and integration pipeline yourself. This provides more control over implementation details, while also requiring additional setup and maintenance work.

That tooling difference sets up the next section: content architecture.

### Content Collections and Data Modeling

As a site grows, content organization becomes a bigger concern than initial setup. Astro and Eleventy handle collections in very different ways, and those differences reflect their core philosophies: Astro prioritizes strictness and type-safety, while Eleventy prioritizes flexibility and composability.

#### Eleventy: Tag-Driven and eleventy.config.js

In Eleventy, collections are fluid. At the simplest level, adding `tags: post` in frontmatter creates `collections.post` automatically.

For advanced grouping, you move into `eleventy.config.js` and define custom collections with `eleventyConfig.addCollection()`.

**Eleventy Config Surface**: `eleventy.config.js` is the main configuration file for collections, plugins, shortcodes, filters, and dev server behavior. Because it is plain Node.js, you can split logic into modules as complexity grows. Collection logic is just JavaScript, which makes filtering, sorting, and merging data straightforward.

##### Eleventy's Data Cascade vs. Astro's Schema Transforms

A key difference in collection workflows is how defaults and computed values are applied.

Eleventy relies on the Data Cascade. If you have a `blog/` folder, adding `blog.11tydata.cjs` lets you apply defaults (like `layout: post` or `tags: blog`) and compute values for every file in that directory. This reduces boilerplate, but it is implicit, so debugging can involve tracing cascade precedence.

Astro achieves similar results with centralized schemas in `content.config.ts`. You use Zod's `.default()` for fallback values and `.transform()` for computed fields at build time.

Directory data files like `blog.11tydata.cjs` reinforce Eleventy's file-system-first model. Astro's schema model is more explicit and predictable, while Eleventy stays more open-ended.

#### Astro: Schema-Driven and content.config.ts

Astro's Content Layer API adds strict validation and type-safety for Markdown, MDX, and external sources. Collections are defined in `content.config.ts` (typically inside `src/`).

**The Split Config**: `content.config.ts` handles content structure only, while `astro.config.mjs` handles framework concerns (integrations, output modes, routing, and plugin behavior). In `content.config.ts`, you define collections with `defineCollection()` and validate data with Zod.

This difference in architecture becomes clearer when you compare day-to-day authoring and maintenance.

### How They Compare in Practice

**Validation**: If Astro requires `title` (string) and `date` (Date) in `content.config.ts`, the build fails early when content is invalid. Eleventy has no built-in schema enforcement in `eleventy.config.js`, so data-shape issues typically surface later when templates consume that data.

**Developer Experience (DX)**: Astro's schema validation also generates useful TypeScript types, so your IDE can autocomplete frontmatter fields and catch mistakes earlier in the authoring loop. Eleventy, as a JavaScript/template-first tool, does not provide this by default.

**External Data**: Both can fetch API data. In Eleventy, external data is commonly loaded in global or directory data files (for example, in `_data`) and can also be shaped in custom collections. In Astro, you typically define a loader in `content.config.ts` and validate records with Zod before use.

## Hydration Scenario: Sandpack

To make this comparison concrete, consider a Sandpack integration scenario rather than a full implementation tutorial.

Embedding an interactive playground in a static site can improve reader utility, but it also introduces architectural constraints. For this implementation, we used `@codesandbox/sandpack-react`.

The component includes live previews, a console, a light/dark theme toggle, and a Cmd+S shortcut that formats code in-browser with Prettier. The tradeoff is size and browser coupling: it depends on APIs like `window.addEventListener` and can exceed a 2 MB JavaScript payload.

Because of those constraints, server rendering may fail for browser-dependent code, and eager loading can negatively affect Core Web Vitals. Island architecture addresses this by shipping static HTML first and hydrating the interactive component only when needed.

Here is how each framework handles it.

* **The Astro approach: Transparent wrappers**
Astro handles this natively with `client:only="react"`, which skips server-side rendering (SSR) and mounts the React component on the client. To simplify authoring, you can create a transparent wrapper (`Sandpack.astro`) that forwards `Astro.props` and reuses the React component's TypeScript types. Authors then use a clean `<Sandpack />` tag while hydration details stay encapsulated.
* **The Eleventy approach: `@11ty/is-land`**
After bundling, you place the mount script inside `<template data-island>` and wrap it in `<is-land on:visible>`. The outcome is similar: the large payload waits until the playground enters the viewport.

Both frameworks can support this hydration pattern. Astro offers a more integrated React path, while Eleventy provides lower-level control over delivery and execution timing.

## Conclusion

Both Astro and Eleventy are viable choices. The better fit depends on whether you prefer stronger built-in guardrails or lower-level control.

* If your site depends on heavy client-side components, Astro can reduce integration and hydration complexity.
* If your site is primarily content with light JavaScript, Eleventy can provide a simpler long-term setup.

In practice, this decision is less about which tool is objectively better and more about which constraints you want to optimize for.
