---
title: "A deep dive into the Wayback machine"
date: 2026-12-07
tags:
  - web archiving
  - wayback machine
  - link rot
---

Link rot is a common problem on the web, where URLs become inaccessible over time.

This phenomenon poses challenges for researchers, archivists, and everyday users who rely on stable web references. The Wayback Machine offers a solution by preserving snapshots of web pages over time, allowing users to access content even after the original URLs have become unavailable.

This post explores how the Wayback Machine works, including its automated crawling mechanisms, user-driven inputs, and programmatic APIs for archiving web content, and ways to leverage these tools for preserving and accessing web content.

## The Wayback Machine

Sites like the [Internet Archive's Wayback Machine](https://archive.org/web/) provide a valuable resource for analyzing historical web content and detecting link rot.

The Wayback Machine decides what sites to crawl using a mix of automated discovery, seed lists, partnership data, and direct user inputs.

### Automated Web Crawlers

* **Link Following**: Automated bots start from "seed" websites and discover new pages and sites by following hyperlinks found within the HTML code, much like a standard web browser or search engine.
* **Link-Based Discovery**: The [Internet Archive says its crawls tend to find sites that are well linked from other sites](https://help.archive.org/help/using-the-wayback-machine/). This describes how crawlers discover sites, not a published formula for ranking domains or setting revisit frequency.
* **Cloudflare URL Submissions**: When Always Online integration is enabled, [Cloudflare shares popular URL paths with the Internet Archive](https://developers.cloudflare.com/cache/how-to/always-online/). It identifies these paths from successful `GET` requests that returned HTTP `200` during the previous five hours. This is a specific integration, not a general Wayback prioritization rule.
* **Partner and Third-Party Contributions**: The Internet Archive hosts an [Archive Team collection](https://archive.org/details/archiveteam), and the [Common Crawl Foundation says its crawl data is included in the Wayback Machine](https://commoncrawl.org/blog/common-crawl-celebrates-world-digital-preservation-day).

### Manual and User-Driven Inputs

* **Save Page Now**: Users can manually submit individual URLs using the Wayback Machine "Save Page Now" feature to request archiving of a specific page that might otherwise be missed or deleted. This request is not instantaneous and may take time to process or fail depending on various factors.

You can also programmatically check snapshot availability or request captures using the Wayback APIs:

```bash
# Check if a snapshot exists for a given URL via the Availability API
curl -s "https://archive.org/wayback/available?url=https://example.com"
```

An `available: true` result means a capture exists, not that it contains a successful page. The captured response may be a redirect (301 or 302) or an error such as 404; a redirect destination may not have been captured, so replay may not reach usable content.

```javascript
// Run in Node.js 22.12+ as an ES module; this uses global fetch and top-level await.
// Check snapshot availability and trigger archival via the Wayback API
async function checkAndArchive(targetUrl) {
  try {
    // 1. Check if a recent snapshot already exists
    const checkUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(targetUrl)}`;
    const checkRes = await fetch(checkUrl);
    if (!checkRes.ok) {
      throw new Error(`Availability check failed with status: ${checkRes.status}`);
    }

    // An OK status does not guarantee valid JSON or the expected response shape.
    const checkData = await checkRes.json();
    if (
      !checkData ||
      typeof checkData !== 'object' ||
      Array.isArray(checkData) ||
      !checkData.archived_snapshots ||
      typeof checkData.archived_snapshots !== 'object' ||
      Array.isArray(checkData.archived_snapshots)
    ) {
      throw new Error('Availability API returned an unexpected response');
    }

    const closest = checkData.archived_snapshots.closest;
    if (
      closest !== undefined &&
      (!closest ||
        typeof closest !== 'object' ||
        Array.isArray(closest) ||
        typeof closest.available !== 'boolean' ||
        (closest.available && typeof closest.url !== 'string'))
    ) {
      throw new Error('Availability API returned an invalid closest snapshot');
    }

    if (closest?.available) {
      console.log(`Snapshot exists: ${closest.url}`);
      return closest;
    }

    console.log('No recent snapshot found. Submitting to Save Page Now...');

    // 2. Request a fresh capture via the Save Page Now endpoint
    const saveUrl = `https://web.archive.org/save/${targetUrl}`;
    const saveRes = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!saveRes.ok) {
      throw new Error(`Archival request failed with status: ${saveRes.status}`);
    }

    const saveData = await saveRes.json();
    console.log('Archival job submitted:', saveData);
    return saveData;
  } catch (err) {
    console.error('Error during archival workflow:', err);
  }
}

// Example invocation
await checkAndArchive('https://example.com');
```

* **Specialized Projects**: Curated lists, community requests, and institutional programs can direct crawlers to specific collections. Schedules may differ by collection: a [survey of cultural heritage institutions](https://europepmc.org/articles/PMC8218557) reports that France's National Library ran an event-focused news and social-media crawl twice daily. This is an institution-specific example, not a Wayback-wide schedule.

### Limitations and Restrictions

* **Capture Barriers**: Crawlers can capture only content available to them. Robots.txt exclusions, authentication, paywalls, private dashboards, interactive form submissions, and publisher blocks can prevent capture. The following robots.txt example restricts the Internet Archive crawler:

```txt
# Allow general search engines, but restrict Wayback Machine from specific sections
User-agent: archive.org_bot
Disallow: /internal-api/
Disallow: /staging/

# Alternatively, block the Internet Archive bot entirely
# User-agent: archive.org_bot
# Disallow: /
```

* **Incomplete Archiving**: Even when pages are captured, some resources like images, videos, or embedded content may not be fully archived, leading to incomplete representations of the original page. It also won't fully capture dynamic content generated on the client side.
* **Technical Limitations**: Dynamic pages relying heavily on complex JavaScript, Flash, or real-time third-party widgets often fail to capture correctly or render as blank/broken snapshots.
* **Replay and Removal Restrictions**: A capture may later be hidden or unavailable in replay because of a site-owner request or legal or safety action, including requests involving doxxing.


### What It Actually Captures

The Wayback Machine acts like a "snapshot" camera rather than a live mirror.

* **Static Content Only**: It saves individual files—HTML, CSS, JavaScript, images, and PDFs—as they existed at a specific moment.
* **Browser-Rendered Captures**: Browser-based crawlers can execute client-side JavaScript and capture some of the resulting requests and responses. These remain records of what the crawler observed during that crawl, not a live connection to the site.
* **No Database Mirroring**: It cannot look behind the curtain. It does not copy SQL databases, user accounts, backend PHP, or server-side logic. It only records what the server outputs to a public user.

### The Problem with Modern Dynamic Sites

Because it only saves static files, modern websites often break when archived:

* **Missing API Data**: If a webpage relies on a database to load content dynamically via JavaScript after the page opens (like a search bar, a dynamic dashboard, or an endless-scroll feed), those elements usually appear blank or broken in the archive.
* **Broken Single Page Apps (SPAs)**: Modern frameworks (like React or Angular) that pull data on-demand from a backend API frequently fail to render fully because the Wayback Machine didn't capture the specific API responses.

```html
<!-- Archives cleanly: Content is present in the initial server response -->
<article>
  <h1>Static Blog Post</h1>
  <p>This text is preserved directly in the static HTML snapshot.</p>
</article>

<!-- May not replay correctly: Content depends on client-side runtime fetching -->
<div id="feed-container"></div>
<script>
  // If the crawler doesn't record the /api/feed payload, this renders empty in replay
  fetch('/api/feed')
    .then(res => res.json())
    .then(data => renderFeed(data));
</script>
```

### How It Handles Dynamic Elements Today

Brozzler is a separate browser-based crawler for higher-fidelity capture of dynamic and multimedia content. The Internet Archive also says its [Save Page Now service is based on Brozzler](https://blog.archive.org/2019/10/23/the-wayback-machines-save-page-now-is-new-and-improved/). See the [Archive-It crawler overview](https://support.archive-it.org/hc/en-us/articles/115001081186-Archive-It-Crawling-Technology) for details about Heritrix, Umbra, and Brozzler.

* **Automated Browser**: Instead of just downloading raw HTML code, Brozzler uses a real, automated browser (Chrome) to open the page.
* **JavaScript Execution**: Running client-side JavaScript can expose rendered content and additional resources for capture, but it does not guarantee that every application state or response will be captured.
* **WARC Output**: When configured with [`warcprox`](https://github.com/internetarchive/warcprox), Brozzler can record browser-server exchanges in WARC files, as described in the [Brozzler documentation](https://github.com/internetarchive/brozzler).
* **Data and Network Capture**: It then saves the resulting data and network requests.

While this allows the Wayback Machine to replay some dynamic elements and animations, it still only plays back a static recording of that specific interaction. You still cannot use a search bar to query the original database or access personalized, logged-in content.

The following Playwright example illustrates browser rendering with a general-purpose automation tool, not the Wayback crawler workflow.

This Playwright example records browser traffic to `capture.har`, including response content, and inspects the rendered DOM. A HAR is a useful supplemental record, but it is not a WARC archive and does not guarantee replay like a web archive.

To run it, install the `playwright` package and Chromium by following [Playwright's installation instructions](https://playwright.dev/docs/intro).

```javascript
import { chromium } from 'playwright';

async function captureDynamicPage(targetUrl) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordHar: { path: 'capture.har', content: 'embed' },
  });
  const page = await context.newPage();

  // Log response metadata alongside the HAR recording.
  page.on('response', response => {
    console.log(`Captured asset: ${response.url()} [${response.status()}]`);
  });

  // Navigate and wait for network activity to settle (allowing client-side JS to execute)
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  // Extract the fully hydrated DOM snapshot
  const hydratedHtml = await page.content();
  console.log(`Captured ${hydratedHtml.length} bytes of rendered DOM`);

  await context.close();
  await browser.close();
}

// Example invocation
await captureDynamicPage('https://example.com');
```
