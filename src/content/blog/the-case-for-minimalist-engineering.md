---
title: "The Case for Minimalist Engineering"
date: 2026-08-26
author: Carlos Araya
tags:
  - software engineering
  - web development
---

The software engineering industry is constantly tempted by the new. Whenever a new framework, database, or library appears, it quickly becomes the default recommendation for projects of all sizes. That temptation leads to premature optimization and over-engineering from day one.

A growing counter-movement argues for a more radical form of restraint. By revisiting the "You Might Not Need" era of frontend development and applying its lessons to modern backend architecture, especially through the lens of "[Postgres is Enough](https://postgresisenough.dev/)", teams can reclaim productivity, simplify infrastructure, and focus on solving real business problems.

This post makes that case in four steps. First, it traces how the "You Might Not Need" philosophy emerged on the frontend and why it still matters. Next, it applies the same logic to backend systems through the Postgres-centric approach. Then it examines the real scaling limits and practical trade-offs, before closing with a framework for deciding when to stay minimal and when complexity is actually justified.

## The "You Might Not Need" Progression

The pushback against default, heavyweight tooling began on the frontend more than a decade ago. In the early 2010s, jQuery was almost mandatory in every web project. It smoothed over browser inconsistencies and offered a pleasant developer experience. But as standard web APIs improved, developers launched [You Might Not Need jQuery](https://youmightnotneedjquery.com/), showing that native JavaScript could handle DOM manipulation just as elegantly. Instead of loading a library for `$.ajax()`, developers could use the native `fetch()` API. Instead of `$('.button')`, they could use `document.querySelectorAll('.button')`. The browser had caught up.

Still, minimalism is not about abandoning tools blindly. You still need to understand your requirements. As the You Might Not Need jQuery site points out:

> "At the very least, make sure you know what [jQuery is doing for you](https://docs.google.com/document/d/1LPaPA30bLUB_publLIMF0RlhdnPx_ePXm7oW02iiT6o) and what it is not. Some developers believe jQuery is protecting them from a great demon of browser incompatibility, when in truth, post-IE8, browsers are fairly easy to deal with on their own."

This philosophy expanded quickly. [You Might Not Need JS](http://youmightnotneedjs.com/) showed how modern CSS and HTML could handle interactive states that once required heavy JavaScript payloads. A classic example is the modal or dropdown menu: instead of writing JavaScript to toggle display classes, developers can use the CSS `:target` pseudo-class or hidden checkbox patterns to achieve the same functionality natively, with zero JavaScript overhead.

More recently, the conversation has shifted toward massive single-page application (SPA) frameworks such as React, Angular, or Vue. Across the web, writers have argued both for [not needing a front-end framework](https://dev.to/bbarbour/you-probably-don-t-need-a-front-end-framework-26o6) and for [stopping the default to frameworks](https://medium.com/@TusharKanjariya/stop-defaulting-to-frameworks-most-projects-dont-need-one-dcb04e98e0a9). The result is a familiar pattern: teams reach for complexity before they have proven that they need it, and then spend the rest of the project paying for that decision. Defaulting to these tools often introduces unnecessary build steps, hydration issues, and client-side performance bottlenecks. For heavily content-driven sites such as blogs or marketing pages, shipping megabytes of JavaScript just to render static text is overkill. Often, a [minimal viable framework](https://mattrickard.com/minimal-viable-frameworks/)—or simply plain HTML and web components—is all a project actually requires. As Maximiliano Firtman [points out](https://master.dev/blog/you-might-not-need-that-framework/), understanding the core language is far more valuable than learning the ephemeral syntax of a framework.

## Postgres Is Enough: Simplifying the Backend

This minimalist mindset is no longer confined to the browser; it is actively reshaping backend architecture. For years, the standard advice was "polyglot persistence": adopting a specialized database for every distinct problem domain. A typical startup stack might include:

* **Redis** for caching and session management.
* **RabbitMQ** or **Kafka** for background job queues.
* **MongoDB** for flexible, unstructured document storage.
* **Elasticsearch** for full-text search.
* **PostgreSQL** for relational user data.

While these specialized tools excel at enormous scale, they introduce significant operational complexity. You have to monitor five systems, manage five deployment pipelines, and keep data consistent across them all—for example, ensuring a user deleted in PostgreSQL is also purged from Elasticsearch.

The [Postgres is Enough](https://postgresisenough.dev/) movement and its [community resources](https://postgresisenough.dev/resources) argue that for most applications, PostgreSQL is more than capable of handling these workloads natively:

* **You might not need MongoDB**: PostgreSQL offers robust `JSONB` support, letting you store unstructured document data and query it quickly using GIN indexes (`SELECT * FROM users WHERE data @> '{"role": "admin"}';`).
* **You might not need RabbitMQ**: You can build a highly concurrent background job queue directly in PostgreSQL using the `FOR UPDATE SKIP LOCKED` clause, allowing multiple workers to pull jobs from a table without locking one another out.
* **You might not need Elasticsearch**: PostgreSQL has built-in full-text search using `tsvector` and `tsquery`, with stemming, ranking, and fuzzy matching available out of the box—more than enough for most application search bars.
* **You might not need Redis**: For simple caching, you can use PostgreSQL `UNLOGGED` tables, which bypass the write-ahead log (WAL) to provide exceptionally fast read and write performance for ephemeral data.

By consolidating infrastructure into a single, reliable relational database, engineering teams can reduce deployment overhead and avoid the dreaded "distributed systems" tax.

## The Scaling Caveat: What About Resource Contention?

A common critique of this database-centric approach is resource contention. If a single database engine is simultaneously handling heavy relational joins, background job polling, full-text search indexing, and cache reads, won't it eventually become a bottleneck?

The short answer is yes, eventually. A single database engine will absolutely buckle at extreme scale. But long before you exhaust the physical hardware—CPU, RAM, or disk I/O—you are likely to hit software-level architectural limits. Because PostgreSQL uses a process-per-connection model, high concurrency can exhaust connection slots and increase memory overhead. Using the database as a high-frequency job queue can cause lock contention, and rapid, continuous updates such as cache invalidation can trigger MVCC (multiversion concurrency control) bloat, forcing the autovacuum daemon to work overtime. At that point, you may need to decouple the architecture and offload specialized workloads to dedicated tools like Redis or Elasticsearch.

However, the "eventually" is much farther away than most teams realize. Modern PostgreSQL is remarkably efficient, and vertical scaling—simply upgrading to a larger database server—is cheaper than ever. When you begin to brush up against software limits, intermediate solutions can bridge the gap. Connection poolers such as PgBouncer can dramatically increase the number of concurrent clients without exhausting database processes. And when read-heavy queries start to cause friction, you can implement read replicas to distribute the load before abandoning the single-database approach entirely.

The minimalist argument is not that PostgreSQL is the only tool you will ever need until the end of time. It is that you should defer the immense operational cost of distributed systems until you have a real scaling problem that a larger database architecture can no longer solve.

## Choose Boring Technology and Innovation Tokens

At the core of this minimalist approach is the concept of "boring technology," famously championed by Dan McKinley in his essay, "Choose Boring Technology." "Boring" does not mean bad; it means the technology's capabilities—and more importantly, its failure modes—are well understood. When PostgreSQL or standard CSS fails, millions of developers have likely encountered and solved that exact error before.

This ties directly to Matt Rickard's ideas on innovation tokens. The premise is simple: every engineering team has a finite capacity for dealing with the unknown. You get, say, three innovation tokens to spend on a project. You should spend those tokens on the core innovation of your actual business product, not on infrastructure. If you are building a revolutionary AI scheduling app, spend your tokens on the AI. If you spend them adopting a bleeding-edge micro-frontend framework and a distributed multi-model database topology, you will have no cognitive bandwidth left for your users.

When you over-complicate your stack, you end up engineering against the grain. You spend all your time fighting your tools rather than shipping features.

## The Case for Minimalism

Minimalism in software engineering is not about being a luddite; it is about rigorous evaluation. It forces developers to justify the inclusion of every new dependency, service, and build step.

Before reaching for the next big framework or spinning up a highly specialized data store, ask whether the tools you already have can solve the problem. By looking at what the native web platform offers today and exploring the hidden depths of PostgreSQL, you will often find that standard web APIs and a single, battle-tested relational database are all you need. True engineering maturity lies in doing more with less—and in knowing when less is enough.