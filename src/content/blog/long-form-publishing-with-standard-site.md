---
title: "Long-form publishing with standard.site"
date: 2026-12-09
tags:
  - publishing
  - at proto
---

The decentralized social web has grown beyond short microblogging updates. With the rise of the **AT Protocol** (the decentralized foundation powering Bluesky), developers and writers are reimagining how long-form articles, newsletters, and independent publications live and travel across the internet.

At the center of this evolution is [Standard.site](https://standard.site/), a shared, open standard designed to turn regular websites into first-class citizens across the "ATmosphere."

In this post, we’ll explore what Standard.site is, why it matters, how it interacts with the AT Protocol, and, most importantly, **how you can automate publishing both your long-form document records and your Bluesky broadcast posts.**

## What is Standard.site?

When you publish a blog post normally, it lives in isolation on your server, relying on Open Graph tags, web scrapers, or RSS readers to be discovered.

**Standard.site** provides a set of open, shared [AT Protocol lexicons](https://standard.site/) (data schemas) for long-form publishing. Instead of every blogging platform inventing its own proprietary data structure, Standard.site provides a unified schema for publications and articles.

### Core principles

1. **Unified Discovery:** Indexers, readers, and social clients only need to support one schema rather than a dozen platform-specific APIs.
2. **Content Portability:** Your identity, documents, audience, and metadata live in your personal repository, allowing you to move hosts without losing followers or archives.
3. **Community Ownership & Minimal Governance:** Maintained collaboratively by developers building in the ecosystem rather than controlled by a single corporate entity.

### Where does your content appear?

When your site implements Standard.site:

* **Bluesky:** Standard.site records may be consumed by compatible clients. Sharing an article on Bluesky is separate: publish an `app.bsky.feed.post` with an external embed that points to the article URL. Standard.site does not automatically create Bluesky posts or link cards.
* **AT Protocol Readers & Apps:** Content can appear in readers and aggregators such as *Leaflet*, *Docs.surf*, *potatonet*, *pckt*, and professional identity directories like *Sifa ID*.

## Understanding the AT Protocol basics

To understand how Standard.site works, it helps to understand a few core concepts of the AT Protocol:

* **PDS (Personal Data Server):** The server that hosts your account repository. Most users use Bluesky's default (`bsky.social`), but you can host your own.
* **DID (Decentralized Identifier):** Your permanent, globally unique ID (e.g., `did:plc:7qg6mz2xtzozx...`).
* **Collections & Records:** Every action in the AT Protocol, such as a post, a like, or a blog document, is stored as a JSON **Record** inside a specific **Collection** (identified by an NSID, or Namespace Identifier).
* **Lexicons:** The formal schema definitions that validate the JSON records.


## The anatomy of Standard.site

Standard.site relies on two primary collections in your repository:

### The publication record (`site.standard.publication`)

Defines the publication itself (name, base URL, optional theme colors, and icons). You only generate this **once**.

```json
{
  "$type": "site.standard.publication",
  "url": "https://example.com",
  "name": "My Tech Journal",
  "basicTheme": {
    "$type": "site.standard.theme.basic",
    "background": {
      "$type": "site.standard.theme.color#rgb",
      "r": 255,
      "g": 255,
      "b": 255
    },
    "foreground": {
      "$type": "site.standard.theme.color#rgb",
      "r": 17,
      "g": 17,
      "b": 17
    },
    "accent": {
      "$type": "site.standard.theme.color#rgb",
      "r": 0,
      "g": 133,
      "b": 255
    },
    "accentForeground": {
      "$type": "site.standard.theme.color#rgb",
      "r": 255,
      "g": 255,
      "b": 255
    }
  }
}
```

*Verification:* You prove ownership by hosting a route returning the publication's AT-URI at:
`https://example.com/.well-known/site.standard.publication`

### The document record (`site.standard.document`)

Represents individual articles or posts. Each article has its own record linking back to the publication.

```json
{
  "$type": "site.standard.document",
  "site": "at://did:plc:.../site.standard.publication/<rkey>",
  "title": "Automating Long-Form Publishing on Bluesky",
  "publishedAt": "2026-11-03T20:00:00.000Z",
  "path": "/posts/automating-standard-site",
  "description": "A deep dive into Standard.site and AT Protocol automation."
}
```

*Verification:* The HTML `<head>` of your webpage includes a link tag pointing back to the AT-URI:

```html
<link rel="site.standard.document" href="at://did:plc:.../site.standard.document/<rkey>" />
```

## Implementing Standard.site in Astro

If you run an [Astro](https://astro.build) site with content collections or Markdown/MDX files, implementing both records is straightforward.

### Setting up environment credentials

Create an app password in Bluesky under **Settings → Privacy & Security**. Add your credentials to your `.env` file (never commit your app password):

```bash
BSKY_SERVICE="https://bsky.social"
BSKY_HANDLE="your-handle.bsky.social"
BSKY_APP_PASSWORD="your-app-password"
PUBLIC_SITE_URL="https://example.com"
```

Install the packages used by the scripts in this guide before running them:

```bash
npm install @atproto/api @atproto/common-web dotenv gray-matter
```

`gray-matter` is only used by the Markdown sync script.

### Generating the publication record (one-time setup)

Because a publication record only needs to be registered once, create a one-off utility script (e.g., `scripts/create-publication.mjs`):

```javascript
// scripts/create-publication.mjs
import { AtpAgent } from "@atproto/api";
import * as dotenv from "dotenv";
dotenv.config();

const agent = new AtpAgent({ service: process.env.BSKY_SERVICE });

async function initPublication() {
  await agent.login({
    identifier: process.env.BSKY_HANDLE,
    password: process.env.BSKY_APP_PASSWORD,
  });

  const did = agent.session.did;

  const publicationRecord = {
    $type: "site.standard.publication",
    url: process.env.PUBLIC_SITE_URL,
    name: "My Astro Blog",
    description: "Writing about web development, open web protocols, and design.",
    basicTheme: {
      $type: "site.standard.theme.basic",
      background: {
        $type: "site.standard.theme.color#rgb",
        r: 15,
        g: 23,
        b: 42,
      },
      foreground: {
        $type: "site.standard.theme.color#rgb",
        r: 248,
        g: 250,
        b: 252,
      },
      accent: {
        $type: "site.standard.theme.color#rgb",
        r: 56,
        g: 189,
        b: 248,
      },
      accentForeground: {
        $type: "site.standard.theme.color#rgb",
        r: 15,
        g: 23,
        b: 42,
      },
    },
  };

  const response = await agent.com.atproto.repo.createRecord({
    repo: did,
    collection: "site.standard.publication",
    record: publicationRecord,
  });

  console.log("✅ Publication record created successfully!");
  console.log("Your Publication AT-URI is:", response.data.uri);
  console.log("\nSave this URI as STANDARD_SITE_PUB_URI in your .env file!");
}

initPublication().catch(console.error);
```

Run the script once:

```bash
node scripts/create-publication.mjs
```

Add the generated URI to your `.env` file:

```bash
STANDARD_SITE_PUB_URI="at://did:plc:abc123.../site.standard.publication/3mn2c332ulp2u"
```

### Setting up the Astro `.well-known` route

To satisfy the verification step, place a plain text file directly inside your Astro `public/` folder so it is served verbatim at the root:

```text
public/.well-known/site.standard.publication
```

Inside that file, paste your publication AT-URI:

```text
at://did:plc:abc123.../site.standard.publication/3mn2c332ulp2u
```

### Generating document records for Astro posts

Because static sites require the HTML to contain the `<link rel="site.standard.document" href="...">` tag at build time, you have two flexible options for generating document records:

#### Approach 1: Storing AT-URIs in frontmatter (recommended for Git workflows)

For Astro 8, add a `standardSiteUri` field to your collection schema in `src/content.config.ts`. Keep your existing loader and match the schema keys to your frontmatter. This example uses `description` and `pubDate`; if your posts use different names, such as `desc` and `date`, use those names in both the schema and the publishing script.

```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    standardSiteUri: z.string().optional(),
  }),
});

export const collections = { blog };
```

Render the verification link tag in your article layout (`src/layouts/BlogPostLayout.astro`):

```astro
---
// src/layouts/BlogPostLayout.astro
interface Props {
  title: string;
  description: string;
  standardSiteUri?: string;
}

const { title, description, standardSiteUri } = Astro.props;
---

<html lang="en">
  <head>
    <title>{title}</title>
    <meta name="description" content={description} />
    {standardSiteUri && (
      <link rel="site.standard.document" href={standardSiteUri} />
    )}
  </head>
  <body>
    <slot />
  </body>
</html>
```

Use an Astro build/prep script to skip unpublished posts, create records for posts without a `standardSiteUri`, and update existing records using their saved AT-URIs. This example treats a post as unpublished while it has `draft: true` or any editorial `status` value; remove those fields when the post is ready to publish.

```javascript
// scripts/generate-astro-document.mjs
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { AtpAgent } from "@atproto/api";
import * as dotenv from "dotenv";
dotenv.config();

const agent = new AtpAgent({ service: process.env.BSKY_SERVICE });

async function syncDocuments() {
  await agent.login({
    identifier: process.env.BSKY_HANDLE,
    password: process.env.BSKY_APP_PASSWORD,
  });

  const postsDir = path.resolve("./src/content/blog");
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith(".md") || file.endsWith(".mdx"));

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(content);

    if (parsed.data.draft === true || parsed.data.status) {
      console.log(`Skipping unpublished post: ${parsed.data.title}`);
      continue;
    }

    const existingUri = parsed.data.standardSiteUri;
    const existingRkey = existingUri?.split("/").at(-1);

    const slug = file.replace(/\.(md|mdx)$/, "");
    const docRecord = {
      $type: "site.standard.document",
      site: process.env.STANDARD_SITE_PUB_URI,
      title: parsed.data.title,
      description: parsed.data.description,
      publishedAt: new Date(parsed.data.pubDate).toISOString(),
      path: `/blog/${slug}`,
    };

    const res = existingRkey
      ? await agent.com.atproto.repo.putRecord({
          repo: agent.session.did,
          collection: "site.standard.document",
          rkey: existingRkey,
          record: docRecord,
        })
      : await agent.com.atproto.repo.createRecord({
          repo: agent.session.did,
          collection: "site.standard.document",
          record: docRecord,
        });

    if (!existingUri) {
      parsed.data.standardSiteUri = res.data.uri;
      fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data));
    }

    console.log(`${existingUri ? "Updated" : "Created"} ${file}: ${res.data.uri}`);
  }
}

syncDocuments().catch(console.error);
```

#### Approach 2: Using the Sequoia CLI

If you prefer not to manage custom scripts, the [Sequoia CLI quickstart](https://sequoia.pub/quickstart) guides you through configuring a static site generator, publishing document records from your Markdown content, and adding verification links. After publishing and building your site, run `sequoia inject` to add the document AT-URI links to the generated HTML.

## Can we automate Bluesky posts alongside Standard.site?

Standard.site does not publish posts to Bluesky. To share an article automatically, wire your CMS's publish webhook or deployment workflow to call a script with the newly published article's URL, title, description, cover image, and post text. The script below creates the Standard.site document record and then creates a separate Bluesky post whose external embed points to the canonical article URL. The external embed's title, description, and thumbnail are supplied explicitly; Bluesky link-card behavior is independent of Standard.site records.

### The complete automated flow

The automated workflow has two parts, with an additional verification step for Standard.site:

1. **Triggers on publication**: The CMS webhook or deployment workflow calls `publish.mjs` after the article has a public URL.
2. **Publishes to AT Protocol**: `publish.mjs` creates the `site.standard.document` record and the `app.bsky.feed.post`, using the canonical URL as the Bluesky external embed URI.
3. **Adds the verification link**: Separately, your CMS/build process must add `<link rel="site.standard.document" href="DOCUMENT_AT_URI">` to the article's HTML `<head>`. You can also add the returned URI to your content or template manually and rebuild or redeploy. The document is not verified until the page is served with this link.

## The publishing script and verification step

The following Node.js example uses the official `@atproto/api` package to create a document record and a Bluesky feed post. It does not read or modify CMS files or Astro output, and it does not insert the Standard.site verification link into HTML. Complete that separate step as described above. To make retries safe even if a request succeeds but its response is lost, the script allocates TID record keys and requires a durable `persistRecordKeys` callback to store them before either record is written. On retry, load the saved keys and pass them back so both writes target the same records. Replace the illustrative `cms` calls below with your CMS or database operations, and serialize simultaneous first-time publish jobs for the same article.

### Prerequisites

The shared dependencies were installed above. `publish.mjs` uses `@atproto/api`, `@atproto/common-web`, and `dotenv`, but not `gray-matter`.

### Automation script (`publish.mjs`)

```javascript
import fs from "node:fs";
import { AtpAgent, RichText } from "@atproto/api";
import { TID } from "@atproto/common-web";
import * as dotenv from "dotenv";

dotenv.config();

// 1. Initialize Agent
const agent = new AtpAgent({ service: process.env.BSKY_SERVICE });

const CONFIG = {
  handle: process.env.BSKY_HANDLE,       // e.g. "alice.bsky.social"
  appPassword: process.env.BSKY_APP_PASSWORD, // Generated in Settings -> Privacy & Security
  publicationAtUri: process.env.STANDARD_SITE_PUB_URI, // at://did:plc:.../site.standard.publication/<rkey>
};

async function publishArticleAndPost({
  title,
  description,
  canonicalUrl,
  publishedAt = new Date().toISOString(),
  coverImagePath,
  postText,
  documentRkey,
  postRkey,
  persistRecordKeys,
}) {
  if (typeof persistRecordKeys !== "function") {
    throw new Error("A durable persistRecordKeys callback is required");
  }

  // 2. Authenticate
  await agent.login({
    identifier: CONFIG.handle,
    password: CONFIG.appPassword,
  });

  const stableDocumentRkey = documentRkey ?? TID.nextStr();
  const stablePostRkey = postRkey ?? TID.nextStr();
  await persistRecordKeys({
    documentRkey: stableDocumentRkey,
    postRkey: stablePostRkey,
  });

  let coverBlob = null;

  // 3. Optional: Upload Cover Image as a Blob
  if (coverImagePath && fs.existsSync(coverImagePath)) {
    const fileBytes = fs.readFileSync(coverImagePath);
    const { data } = await agent.com.atproto.repo.uploadBlob(fileBytes, {
      encoding: "image/jpeg",
    });
    coverBlob = data.blob;
  }

  // 4. Create the Standard.site Document Record
  const documentRecord = {
    $type: "site.standard.document",
    site: CONFIG.publicationAtUri,
    title,
    description,
    path: new URL(canonicalUrl).pathname,
    publishedAt,
    ...(coverBlob ? { coverImage: coverBlob } : {}),
  };

  const documentAtUri = await writeRecord(
    "site.standard.document",
    stableDocumentRkey,
    documentRecord,
  );
  console.log(`✅ Standard.site Document published: ${documentAtUri}`);

  // 5. Build and Resolve the Bluesky Status Post
  const rt = new RichText({ text: postText });
  await rt.detectFacets(agent); // Automatically parses URLs, mentions, and tags

  // 6. Create the Bluesky Post with an External Embed
  // Embed metadata is explicit here; this does not add the verification link to the HTML.
  const postRecord = {
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        uri: canonicalUrl,
        title: title,
        description: description,
        ...(coverBlob ? { thumb: coverBlob } : {}),
      },
    },
  };

  const postAtUri = await writeRecord(
    "app.bsky.feed.post",
    stablePostRkey,
    postRecord,
  );

  console.log(`🚀 Automated Bluesky post live: ${postAtUri}`);

  return {
    documentAtUri,
    postAtUri,
  };
}

async function writeRecord(collection, rkey, record) {
  const response = await agent.com.atproto.repo.putRecord({
    repo: agent.session.did,
    collection,
    rkey,
    record,
  });

  return response.data.uri;
}

// Example Execution
const articleId = "standard-site-guide";
const savedState = await cms.getArticleRecordKeys(articleId);

publishArticleAndPost({
  title: "Building on the ATmosphere: Standard.site Explained",
  description: "Learn how the open standard enables seamless cross-platform publishing on Bluesky.",
  canonicalUrl: "https://mysite.com/posts/standard-site-guide",
  coverImagePath: "./assets/cover.jpg",
  postText: "Just published a new guide on Standard.site and decentralized long-form writing! Check it out below 👇 #atproto #webdev",
  documentRkey: savedState?.documentRkey,
  postRkey: savedState?.postRkey,
  persistRecordKeys: (keys) => cms.saveArticleRecordKeys(articleId, keys),
}).catch(console.error);
```

## No-code and CMS automated integrations

If you prefer an existing tool, these integrations provide different parts of the workflow:

* **WordPress:** [ATmosphere](https://wordpress.org/plugins/atmosphere/) automatically cross-posts published WordPress articles to Bluesky and stores long-form content on the account's AT Protocol repository. [Wireservice](https://wordpress.org/plugins/wireservice/) creates and syncs Standard.site publication and document records and adds their verification links; it does not publish to Bluesky.
* **Craft CMS:** The [Standard.site Craft plugin](https://plugins.craftcms.com/standard-site?craft5) creates a publication record, publishes Craft entries as document records, syncs record changes and deletions, and serves the publication discovery endpoint.
* **Static sites:** [Sequoia](https://sequoia.pub/quickstart) is a CLI for creating Standard.site document records from Markdown content and injecting verification links into built HTML.
* **Obsidian:** [Standard.site Publisher for Obsidian](https://github.com/SootyOwl/obsidian-standard-site) publishes notes as Standard.site documents, pulls documents into a vault, and syncs updates.

## Validating your setup

Once automated, you should verify that your publication and document links resolve properly:

1. **Standard.site Validator:** Use the [Standard.site Validator](https://site-validator.fly.dev/) to test your verification tags and endpoints.
2. **PDS Explorers:** Inspect your raw records using developer tools like **[PDSLS](https://pdsls.dev)** or [Taproot](https://atproto.at/) by looking up your DID. Under your collections, you should see both `site.standard.document` and `app.bsky.feed.post` entries neatly organized.

## Conclusion

Standard.site transforms how content creators interact with decentralized social networks. By decoupling your content from closed platforms and treating articles as first-class schemas on the AT Protocol, you own your archive while gaining native distribution.

With tools like the `@atproto/api` SDK or ecosystem CMS plugins, automating your publishing workflow to Bluesky and the broader ATmosphere is direct, lightweight, and completely under your control.
