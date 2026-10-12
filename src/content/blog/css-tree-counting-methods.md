---
title: "CSS Tree-Counting Methods"
date: 2026-11-13
tags:
  - CSS
  - Layout
draft: true
status: needs-review
---

The [CSS Values and Units Module Level 5](https://www.w3.org/TR/css-values-5/) defines native CSS tree-counting functions: [sibling-index()](https://www.w3.org/TR/css-values-5/#sibling-index) and [sibling-count()](https://www.w3.org/TR/css-values-5/#sibling-count). In supported browsers, these functions can replace inline custom properties whose only purpose is to pass an element's sibling index or sibling count into CSS. They do not replace custom properties used for other values, such as data supplied by application logic. Check browser compatibility before relying on these functions in production.

Until their introduction, building staggered entrance animations, radial dials, or dynamic distribution bars in pure CSS required one of two cumbersome workarounds:

**A brittle wall of nth-child rules:**

```css
.item:nth-child(1) { --i: 1; }
.item:nth-child(2) { --i: 2; }
.item:nth-child(3) { --i: 3; }
/* ...and hoping your list never grows past your last selector */
```

**Injecting variables directly into HTML markup:**

```html
<li style="--i: 1; --total: 10;">Item</li>
```

This guide explores what "inline variables" actually are and why developers were forced to rely on them, breaks down the core syntax of `sibling-index()` and `sibling-count()`, and walks through practical animation and layout patterns alongside essential accessibility guardrails. Finally, we examine how these primitives level up when paired with CSS `@function` and Houdini `@property`, before looking at future-facing proposals like selector filtering and vertical tree counting.

## What Are "Inline Variables"?

Before diving into tree-counting functions, it helps to understand the exact problem pattern they replace: the pervasive practice of **inline variables**.

In modern web development, "inline variables" refers to injecting CSS custom properties directly into an element's HTML `style` attribute during templating or component rendering:

```html
<ul class="stagger-list">
  <li style="--i: 1; --total: 4;">First Item</li>
  <li style="--i: 2; --total: 4;">Second Item</li>
  <li style="--i: 3; --total: 4;">Third Item</li>
  <li style="--i: 4; --total: 4;">Fourth Item</li>
</ul>
```

In the style sheet, developers consume these custom properties inside `calc()` expressions to calculate staggered animation delays, grid coordinates, or overlapping z-indexes:

```css
.stagger-list li {
  animation: fade-in 400ms ease forwards;
  animation-delay: calc(var(--i) * 80ms);
  z-index: var(--i);
}
```

### The Architectural Problem with Inline Variables

While effective, this pattern introduces significant architectural friction:

1. **Markup Pollution:** Templating engines (React, Vue, Svelte, Astro, Jinja, etc.) must calculate array indices and array lengths during markup generation, littering the DOM with repetitive inline style declarations.
2. **Coupling Presentation to Markup:** Presentation logic leaks out of CSS and into HTML templates. If a design requirement changes how items are calculated or staggered, markup templates must often be updated alongside styles.
3. **Dynamic Mutation Brittleness:** If items are added, removed, or reordered client-side via JavaScript, every subsequent element's inline `--i` and `--total` attributes must be recalculated and rewritten to avoid stale index bugs.
4. **Content Security Policy (CSP) Friction:** A strict CSP can block style attributes through `style-src` or, in CSP Level 3, `style-src-attr`. A hash can allow a specific style attribute only when the policy also includes `'unsafe-hashes'`; nonces do not authorize style attributes. This can make inline custom properties harder to use under a strict policy.

Where supported, tree-counting functions replace manually maintained indices and totals when those custom properties only pass sibling position or count into CSS. They do not replace custom properties that carry other values, such as application data.

## The `sibling-index()` Function

The `sibling-index()` function returns the 1-based index of the current element among its sibling elements sharing the same parent.

This CSS fragment assumes multiple `.card` elements share a parent; the HTML is omitted.

```css
.card {
  z-index: sibling-index();
  animation-delay: calc(sibling-index() * 75ms);
}
```

### Key Technical Characteristics

* **1-Based Indexing:** The first child element receives an index of `1`, the second child `2`, and so forth. This matches the established index convention used by `:nth-child()` in CSS.
* **Element Sibling Context:** Counting operates across sibling *elements*. Text nodes, comments, and whitespace in the DOM tree are ignored.
* **Return Type:** Resolves to a CSS `<integer>` at computed-value time, meaning it can be plugged directly into `calc()` expressions alongside units of time, length, or angle.

## The `sibling-count()` Function

The `sibling-count()` function returns the total number of sibling elements within the parent container (including the element itself).

This CSS fragment assumes multiple `.segment` elements share a parent; the HTML is omitted.

```css
.segment {
  /* Divide a full 360-degree circle evenly among all siblings */
  --slice-angle: calc(360deg / sibling-count());
}
```

### Key Technical Characteristics

* **Dynamic Total:** If a container has five child elements, every single child element receives a `sibling-count()` value of `5`.
* **Zero Avoidance:** If an element is the only child of its parent, `sibling-count()` returns `1`. This eliminates accidental division-by-zero errors when calculating fractions like `calc(100% / sibling-count())`.
* **Return Type:** Like `sibling-index()`, it resolves to a pure `<integer>`.

## Practical Use Cases

The combination of `sibling-index()` and `sibling-count()` enables layout and animation patterns that previously required extensive JavaScript or brittle CSS scaffolding.

### Staggered Entrance Animations

Staggered transitions are one of the most common UI animation patterns. Instead of manually declaring delay increments for every child element or injecting `--i`, you calculate delays directly:

```css
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item {
  animation: slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  /* Stagger each item by 60ms based on its position */
  animation-delay: calc((sibling-index() - 1) * 60ms);
}
```

### Radial Distribution and Circular Layouts

Placing items around a circle or wheel requires two pieces of geometric information: how many items there are in total (`sibling-count()`), and which slice the current element occupies (`sibling-index()`).

```css
.orbit-container {
  position: relative;
  width: 400px;
  height: 400px;
}

.orbit-item {
  --radius: 160px;
  --angle: calc((360deg / sibling-count()) * (sibling-index() - 1));

  position: absolute;
  top: 50%;
  left: 50%;
  transform:
    rotate(var(--angle))
    translate(var(--radius))
    rotate(calc(-1 * var(--angle)));
}
```

Every item evenly distributes itself around the circle automatically. If a CMS outputs 3, 6, or 12 items, the layout adapts without modifying CSS or JavaScript.

### Dynamic Stacking and Overlapping Card Decks

Creating layered "fanned" card stacks requires incrementing `z-index`, horizontal offsets, and subtle rotations for each card:

```css
.card-stack {
  position: relative;
  min-height: 320px;
}

.card-stack .card {
  position: absolute;
  top: 0;
  left: 0;
  width: 240px;
  height: 320px;

  /* Stack later cards above earlier ones */
  z-index: sibling-index();

  /* Fan cards out across an arc */
  --center-offset: calc(sibling-index() - ((sibling-count() + 1) / 2));
  transform:
    translateX(calc(var(--center-offset) * 24px))
    rotate(calc(var(--center-offset) * 4deg));
}
```

## Accessibility Considerations: Visual Order Versus Document Order

While tree-counting functions make it easy to dynamically rearrange, reposition, or stack elements, authors must be mindful of how visual alterations impact accessibility.

### Visual Reordering Does Not Change DOM Order

Manipulating `order` in flexbox/grid or shifting positions with `transform: translate(...)` via `sibling-index()` alters only the **visual rendering**, not the underlying DOM source order:

```css
/* Caution: Inverting visual position does not invert tab order */
.item {
  order: calc(sibling-count() - sibling-index());
}
```

Keyboard focus order and screen reader reading sequence are related but distinct. [WCAG 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html) requires focus order to preserve meaning and operability. When visual placement differs from DOM order, sighted keyboard users may find the focus movement difficult to follow.

CSS visual reordering does not, by itself, change the DOM order that screen readers commonly use. When content sequence affects meaning, [WCAG 1.3.2: Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) requires the correct reading sequence to be programmatically determinable.

Where visual reordering is necessary in modern CSS grids and flex containers, `reading-flow` can synchronize reading sequences in supporting Chromium browsers. Support is currently limited to Chromium-based browsers, so treat it as progressive enhancement and preserve a logical DOM order:

```css
.flex-container {
  display: flex;
  reading-flow: flex-visual;
}
```

### Motion Sensitivity and Reduced Motion Guardrails

Staggered entrance animations calculated via `sibling-index()` can cause discomfort or disorientation for users sensitive to motion. When long lists compute cascading delays, animations may run continuously for several seconds.

Always wrap staggered animations in a `@media (prefers-reduced-motion: reduce)` block to eliminate or collapse the calculated delay:

```css
.stagger-card {
  animation: reveal 350ms ease both;
  animation-delay: calc(sibling-index() * 70ms);
}

@media (prefers-reduced-motion: reduce) {
  .stagger-card {
    animation-delay: 0ms;
    animation-duration: 0.01ms;
    transition-duration: 0.01ms;
  }
}
```

## Leveling Up: Pairing Tree-Counting with CSS `@function`

Tree-counting functions provide DOM context, but complex calculations can still produce verbose `calc()` chains. The CSS `@function` rule provides custom, reusable functions directly within your style sheets, but browser support is currently limited to Chromium-based browsers. Treat the examples in this section as progressive enhancement and provide a fallback for other browsers.

In browsers that support both features, they work together: `@function` abstracts the mathematical logic, while `sibling-index()` and `sibling-count()` supply the dynamic values.

```css
/* Define reusable math functions */
@function --stagger(--index, --step: 50ms, --base: 0ms) {
  result: calc(var(--base) + (var(--index) - 1) * var(--step));
}

@function --radial-angle(--index, --total) {
  result: calc((360deg / var(--total)) * (var(--index) - 1));
}

/* Consume them cleanly in selectors */
.menu-item {
  animation-delay: --stagger(sibling-index(), 75ms, 100ms);
}

.pie-slice {
  --angle: --radial-angle(sibling-index(), sibling-count());
  transform: rotate(var(--angle));
}
```

In browsers that support tree-counting functions but not `@function`, write the calculations inline:

```css
.menu-item {
  animation-delay: calc(100ms + (sibling-index() - 1) * 75ms);
}

.pie-slice {
  --angle: calc((360deg / sibling-count()) * (sibling-index() - 1));
  transform: rotate(var(--angle));
}
```

This keeps individual rules declarative and clean while centralizing complex math routines in reusable utility functions.

## Tree-Counting Meets `@property`

Registering custom properties with `@property` (part of [CSS Properties and Values API Level 1](https://drafts.css-houdini.org/css-properties-values-api/)) introduces explicit type checking, defined inheritance, and default **values**. Combining `@property` with `sibling-index()` and `sibling-count()` unlocks several key architectural benefits:

### Type Safety with `<integer>`

Registering properties as `<integer>` ensures that tree-counting values are strictly validated:

```css
@property --item-index {
  syntax: "<integer>";
  inherits: false;
  initial-value: 1;
}

@property --item-total {
  syntax: "<integer>";
  inherits: false;
  initial-value: 1;
}

.gallery-card {
  --item-index: sibling-index();
  --item-total: sibling-count();
}
```

### Preventing Unintended Inheritance

By setting `inherits: false`, registered properties stay scoped strictly to the target elements. This prevents nested component trees (such as a dropdown menu inside a list item) from accidentally inheriting the parent element's sibling coordinates.

### Interpolating Computed Values

Unregistered custom properties evaluate as raw token streams and cannot be interpolated smoothly in CSS transitions or `@keyframes`. When you register a custom property with a defined type (such as `<angle>` or `<percentage>`), the browser can smoothly transition values computed from tree-counting functions:

```css
@property --rotation {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.dial-item {
  --rotation: calc((360deg / sibling-count()) * sibling-index());
  transform: rotate(var(--rotation));
  transition: --rotation 400ms cubic-bezier(0.2, 0, 0, 1);
}

.dial-item:hover {
  --rotation: calc(((360deg / sibling-count()) * sibling-index()) + 15deg);
}
```

## Filtering the Count

One limitation of baseline `sibling-index()` and `sibling-count()` is that they count *all* sibling elements unconditionally. In real-world layouts, however, sibling lists frequently contain mixed elements:

```html
<ul class="product-feed">
  <li class="product">Laptop</li>
  <li class="ad-banner">Sponsored Ad</li>
  <li class="product">Keyboard</li>
  <li class="separator">Divider</li>
  <li class="product">Mouse</li>
</ul>
```

If you calculate column placement or staggering specifically for `.product` elements, `sibling-index()` treats `.ad-banner` as index `2`, shifting the subsequent product to index `3` instead of `2`.

To address this, [CSSWG Issue #9572](https://github.com/w3c/csswg-drafts/issues/9572) proposes extending both functions with an optional selector filter:

```css
/* Proposed filtered syntax mirroring :nth-child(An+B of S) */
.product {
  --filtered-index: sibling-index(of .product);
  --filtered-count: sibling-count(of .product);
}
```

### The Non-Matching Element Question

A primary discussion point in Issue #9572 is how the function should behave when evaluated on an element that does not match the selector argument. For example:

```css
* {
  --card-rank: sibling-index(of .featured-card);
}
```

Two main behaviors have been debated:

1. **Returning `0`:** Matching elements receive `1`, `2`, `3`, while non-matching elements receive `0`. This gives authors a clean boolean-like integer to branch logic inside `calc()`.
2. **Invalid at Computed-Value Time (IACVT):** Treating non-matches as invalid allows the property to fall back to an inherited or initial value.

### Implementation and Boundary Challenges

Evaluating selectors within value functions poses non-trivial challenges for browser layout engines:

* **Style Invalidation:** If a sibling gains or loses a class name, the browser must identify every other sibling whose computed values depend on that selector filter and re-evaluate their styles.
* **Shadow DOM Scoping:** The working group is examining how selector filters operate across shadow roots and slotted content boundaries.

## Beyond Siblings: Proposals for `children-count()` and `descendant-count()`

Because `sibling-index()` and `sibling-count()` execute on child elements, they cannot directly set layout rules on the parent container. For instance, a parent grid cannot automatically set its own column count based on how many children it holds:

```css
/* Not possible with sibling functions alone: */
.container {
  /* sibling-count() here counts .container's siblings, not its children */
  grid-template-columns: repeat(sibling-count(), 1fr);
}
```

To solve this container-side challenge, Roman Komarov proposed two companion functions to the CSS working group:

### `children-count()` (CSSWG Issue #11068)

[CSSWG Issue #11068](https://github.com/w3c/csswg-drafts/issues/11068) proposes `children-count()`, allowing an element to inspect the number of immediate child elements it contains.

```css
.auto-grid {
  /* Build a perfectly balanced square grid based on child count */
  grid-template-columns: repeat(calc(round(up, sqrt(children-count()))), 1fr);
}

.gallery {
  /* Switch layout modes automatically based on child density */
  --density: calc(children-count() / 10);
}
```

### `descendant-count()` (CSSWG Issue #11069)

[CSSWG Issue #11069](https://github.com/w3c/csswg-drafts/issues/11069) expands this concept to arbitrary descendants across a subtree:

```css
.nav-folder {
  /* Display a count badge reflecting matching descendants */
  --badge-val: descendant-count(of .unread-item);
}
```

While currently in early discussion, these proposals illustrate the long-term direction of CSS: moving from rigid external scripting toward fully self-aware, container-driven layout engines.

## Progressive Enhancement and Fallbacks

Because browser adoption of newly specified values is ongoing, use feature queries via `@supports` to provide resilient fallbacks for production code:

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Fallback styles using standard CSS */
.gallery-item {
  opacity: 1;
  transform: none;
}

/* Enhanced tree-counting styles */
@supports (animation-delay: calc(sibling-index() * 1ms)) {
  .gallery-item {
    animation: fade-in 300ms ease both;
    animation-delay: calc(sibling-index() * 50ms);
  }
}
```

For environments where tree counting is not yet available, standard `:nth-child()` ranges or build-time script injection provide reliable baselines.

## Summary

Where supported, CSS `sibling-index()` and `sibling-count()` can replace manually injected custom properties when their only purpose is to pass sibling position or count into CSS.

Where browser support permits, tree-counting primitives and Houdini `@property` can help build responsive, mathematically driven layouts in CSS. CSS `@function` is currently limited to Chromium-based browsers, and selector filtering (`sibling-index(of S)`) remains proposed. Check compatibility and provide fallbacks before using these features in production. Preserve logical focus and reading order, and account for reduced-motion preferences.
