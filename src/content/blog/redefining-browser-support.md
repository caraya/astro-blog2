---
title: "Redefining browser support"
date: 2026-09-11
tags:
  - browser support
  - web development
youtube: true
---

Rachel Andrew's talk at Pixel Pioneers 2026, "A Pragmatic Guide to Browser Support," provides a useful overview of the state of browser support and the trade-offs developers face when choosing what to build on top of the web platform. The talk emphasizes that browser support is not a single, universal rule: it depends on the browsers your audience uses, the feature in question, and the goals of the project.

<lite-youtube videoid="uOtxiH3QiPg" title="A Pragmatic Guide to Browser Support - Rachel Andrew - Pixel Pioneers 2026"></lite-youtube>

This post does not aim to prescribe one right way to handle browser support. Instead, it asks a few practical questions: how to define a baseline for a project, how to reason about a feature that works in one browser but not another, how to track standards positions, and how to use the tooling available to evaluate support and weigh fallback options. The goal is not to declare a universal policy, but to offer a framework for making informed decisions in context.

## The naive question: Does it work everywhere?

The most common mistake when evaluating browser support is asking, "Does it work everywhere?" This question naively assumes that all browsers support the same features equally.

Even when a feature becomes part of an official web standard, browser engines adopt it at different speeds, or may decline to implement it entirely. Developers must account for these inconsistencies when building web applications.

### Progressive enhancement rather than graceful degradation

Progressive enhancement focuses on building a solid foundation that works across all browsers, and then adding advanced features that enhance the experience in browsers that support them. This approach ensures that your web application remains functional even in environments with limited support for newer features.

Not all CSS is essential for the functionality of a page or app. Focus on ensuring that the core functionality works across all browsers first and then layer on enhancements for browsers that support them. This approach is more effective than graceful degradation, which starts with a complex experience and then attempts to make it work in less capable browsers.

### Code defensively

When writing code, assume that not all browsers will support every feature you use. Use feature detection, polyfills, and fallbacks to ensure that your application remains functional even in browsers with limited support. This defensive approach helps maintain a consistent user experience across different environments.

## Defining our baseline

Before we start working on a project, we should define our baseline for browser support. This involves identifying the minimum set of browsers and versions that our application must support, ensuring that we can deliver a consistent experience to the majority of our users. Establishing a baseline helps guide decisions about which features to use and which polyfills or fallbacks may be necessary.

### The baseline initiative

The Baseline initiative is a framework, created by the Google Chrome Team and now maintained by the [Web DX Community Group](https://www.w3.org/community/webdx/) for defining and maintaining a consistent level of browser support across web projects. It helps developers determine which browsers and versions should be considered the minimum requirement for their applications, ensuring a reliable and predictable user experience.

Baseline is based on support in the following browsers:

* Apple Safari (iOS)
* Apple Safari (macOS)
* Google Chrome (Android)
* Google Chrome (desktop)
* Microsoft Edge (desktop)
* Mozilla Firefox (Android)
* Mozilla Firefox (desktop)

Feature Definitions:

* **Newly available**: Features listed as newly available work in the latest stable version of each of the Baseline browsers, but may not work with older browsers and devices.
* **Widely available**: Features listed as widely available have a consistent history of support in each of the Baseline browsers for at least 2.5 years (30 months).

### An alternative approach: Group by year

Grouping by year instead of feature maturity is a more pragmatic approach to defining browser support and similar to what TC39 does with the ECMAScript specification. It allows developers to focus on the capabilities of browsers released within a specific timeframe, rather than trying to support every feature across all browsers.

My [CSS Feature Viewer](https://css-feature-viewer.rivendellweb.net/#baseline) includes a group by year view, allowing developers to see which features are supported in browsers released in a given year. This approach is parallel to what TC39 does with the ECMAScript specification, where features are considered based on the year of their inclusion rather than their maturity across all browsers.

### Caniuse.com

[Caniuse.com](https://caniuse.com/) approaches browser compatibility differently than the Baseline initiative. While Baseline indicates whether a feature meets a unified cross-browser interoperability threshold (Newly available or Widely available), Can I Use provides granular, version-by-version compatibility matrices, usage share statistics, and known caveats—including features that have only shipped in a single browser engine.

If you need to audit specific browser release versions, evaluate global or regional audience reach, or identify vendor-specific quirks across past and preview releases, Can I Use remains the better resource.

## The feature is only available in one browser

Perhaps the hardest question to answer is, "What do I do when a feature is only available in one browser?" This situation can arise when a new feature is implemented in one browser but not yet adopted by others or when one or more browsers have decided not to implement a feature at all. In these cases, developers must weigh the benefits of using the feature against the potential drawbacks of limited support.

The best examples of this are the hardware web APIs (WebUSB, WebHID, WebNFC) Google implemented as part of the capabilities project (also known as [Project Fugu](https://developer.chrome.com/blog/capabilities)). Both Apple and Mozilla are opposed to these APIs, citing security and privacy concerns and will not implement them.

These oppositions leave developers with a difficult decision: use the feature and limit their audience to users of the supporting browser, or avoid the feature and potentially miss out on its benefits. The decision is not only about whether a feature is available, but also who is using it, on what device, and how critical that feature is to the core experience. A browser support policy for a desktop-heavy audience can look very different from one for a mobile-first audience, and the numbers can change significantly when those audiences are considered separately. In practice, browser support is a product decision as much as a technical one: it depends on user distribution, device capabilities, and the cost of excluding unsupported browsers.

### Track browsers' standards positions

Both [WebKit](https://webkit.org/standards-positions/) and [Mozilla](https://github.com/mozilla/standards-positions) have public repositories for their positions on emerging web standards. These repositories provide insight into the browsers' stances on various features and their implementation plans.

This is a good first step in determining whether a feature is likely to be supported across different browsers. Neutral and negative/oppose positions indicate that a feature is unlikely to be supported, while positive/accept positions indicate that a feature ***may*** be supported in the future.

### Code defensively

When using features that are not widely supported yet, but where standards positions indicate that they are likely to be supported in the future, developers should code defensively using `@supports` at-rules in CSS or feature detection in JavaScript to provide fallbacks for browsers that do not support the feature.

| Technique | Best for | Typical use case | When to choose it | Notes |
| --- | --- | --- | --- | --- |
| `@supports` | CSS-level capability checks | Switching layouts, gradients, grid, or selector features at the stylesheet level | You need to apply different CSS rules based on what the browser can parse | Best for progressive enhancement without running JavaScript |
| `CSS.supports()` | JavaScript-driven CSS capability checks | Enabling UI logic or toggling classes when a CSS feature is available | You need the same capability check in script, not just in CSS | Works well when the decision is tied to DOM behavior |
| Feature detection | Browser API and runtime capability checks | Checking whether `IntersectionObserver`, `navigator.share`, or `HTMLDialogElement` exists | You need to call a method or API only if it exists | Most flexible approach for JavaScript APIs |
| Polyfills | Missing feature support across browsers | Loading Temporal, `fetch`, or other APIs in older browsers | The feature is valuable enough to support, but the browser does not provide it natively | Use selectively; they can add weight and complexity |

### CSS @supports at-rule

Basic Property-Value Pair
Tests support for a single property and value combination.

```css
@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

#### Logical Operators (not, and, or)

Combine or invert multiple feature conditions.

* **not**: Applies rules when a feature is unsupported.
* **and**: Applies rules only when all enclosed conditions evaluate to true.
* **or**: Applies rules when at least one condition evaluates to true.

```css
/* Negation (not) */
@supports not (display: grid) {
  .container {
    display: flex;
    flex-wrap: wrap;
  }
}

/* Conjunction (and) */
@supports (display: flex) and (gap: 1rem) {
  .row {
    display: flex;
    gap: 1rem;
  }
}

/* Disjunction (or) */
@supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
}

/* Grouped complex conditions */
@supports ((display: grid) and (grid-template-areas: "head head")) or (display: flex) {
  .layout {
    margin: 0 auto;
  }
}
```

#### Function Syntax: selector()

Tests whether the browser supports a specific selector syntax (e.g., :has(), :is(), or custom pseudo-elements).

```css
@supports selector(:has(> .active)) {
  .nav-item:has(> .active) {
    border-bottom: 2px solid blue;
  }
}

@supports not selector(:focus-visible) {
  .button:focus {
    outline: 2px solid orange;
  }
}
```

#### Function Syntax: font-tech() & font-format()

Tests whether the browser supports specific font technologies (like color fonts, variable fonts, or palettes) and formats.

```css
/* Testing font technology */
@supports font-tech(color-COLRv1) {
  @font-face {
    font-family: "ColorfulFont";
    src: url("colorful.woff2") format("woff2") tech(color-COLRv1);
  }
}

/* Testing font format */
@supports font-format(woff2) {
  @font-face {
    font-family: "ModernFont";
    src: url("modern.woff2") format("woff2");
  }
}
```

#### Custom Property Syntax (CSS Variables)

Checks if the engine parses custom property definitions.

```css
@supports (--custom-property: true) {
  :root {
    --theme-color: #3b82f6;
  }
}
```

### Feature Detection in JavaScript

#### CSS Feature Detection (`CSS.supports`)

The CSS.supports static method mirrors @supports queries directly in scripts using two method signatures.

```ts
// Guard check to ensure CSS.supports itself exists
const isCssSupportsAvailable = typeof CSS !== "undefined" && typeof CSS.supports === "function";

if (isCssSupportsAvailable) {
  // Method 1: (property, value) pair
  const supportsSubgrid: boolean = CSS.supports("grid-template-columns", "subgrid");

  // Method 2: Condition text string (logical operators, selector(), etc.)
  const supportsHas: boolean = CSS.supports("selector(:has(> .active))");
  const supportsColorMix: boolean = CSS.supports("color", "color-mix(in srgb, red, blue)");
  const supportsP3: boolean = CSS.supports("(color: color(display-p3 1 1 1)) and (display: grid)");

  if (supportsHas) {
    document.documentElement.classList.add("has-selector-support");
  }
}
```

#### Global Object & Window Property Checks (`in` and `typeof`)

Tests whether a browser API, interface, or global namespace is defined.

```ts
// Checking modern Web APIs on window / global scope
const hasIntersectionObserver: boolean = "IntersectionObserver" in window;
const hasResizeObserver: boolean = typeof window.ResizeObserver !== "undefined";
const hasWebGPU: boolean = "gpu" in navigator;
const hasWebWorker: boolean = typeof Worker !== "undefined";

// Safe conditional execution
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position: GeolocationPosition) => {
      console.log(position.coords.latitude, position.coords.longitude);
    },
    (error: GeolocationPositionError) => {
      console.error(error.message);
    }
  );
}
```

#### DOM & Element Prototype Feature Checks

Determines whether an HTML element or prototype supports specific attributes, properties, or methods.

```ts
// Attribute reflection test (e.g., native lazy loading on <img>)
const supportsLazyLoading: boolean = "loading" in HTMLImageElement.prototype;

// Method support on elements (e.g., popover, dialog, fullscreen)
const supportsDialog: boolean = typeof HTMLDialogElement !== "undefined" && "showModal" in HTMLDialogElement.prototype;
const supportsPopover: boolean = "popover" in HTMLElement.prototype;

// ElementInternals support for Custom Elements
const supportsElementInternals: boolean = typeof HTMLElement.prototype.attachInternals === "function";

if (supportsLazyLoading) {
  const img = document.createElement("img");
  img.loading = "lazy";
  img.src = "hero.jpg";
  document.body.appendChild(img);
}
```

#### Media Queries via JavaScript (`window.matchMedia`)

Detects hardware capabilities and user preferences such as color schemes, reduced motion, and pointer precision.

```ts
// Query prefers-reduced-motion
const motionQuery: MediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");

if (motionQuery.matches) {
  // Disable non-essential animations
}

// React to live changes
motionQuery.addEventListener("change", (event: MediaQueryListEvent) => {
  if (event.matches) {
    // User enabled reduced motion
  }
});

// Dynamic viewport / display gamut queries
const p3Query: MediaQueryList = window.matchMedia("(color-gamut: p3)");
const hasTouchPointer: boolean = window.matchMedia("(pointer: coarse)").matches;
```

#### Canvas & WebGL Feature Detection

Uses a temporary in-memory canvas element to check for 2D rendering capabilities, WebGL contexts, or specific extensions.

```ts
function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

function supportsWebGLExtension(extensionName: string): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return Boolean(gl && (gl as WebGLRenderingContext).getExtension(extensionName));
  } catch {
    return false;
  }
}
```

#### Idiomatic TypeScript Feature Detector Pattern

Create reusable, type-guarded detector utilities using TypeScript user-defined type predicates.

```ts
interface WebShareNavigator extends Navigator {
  share(data?: ShareData): Promise<void>;
  canShare?(data?: ShareData): boolean;
}

// Type guard for Web Share API
function canUseWebShare(nav: Navigator): nav is WebShareNavigator {
  return "share" in nav && typeof (nav as WebShareNavigator).share === "function";
}

// Type guard for ElementInternals
function supportsFormAssociatedCustomElements(
  element: HTMLElement
): element is HTMLElement & { attachInternals(): ElementInternals } {
  return "attachInternals" in element && typeof element.attachInternals === "function";
}

// Usage with automatic type narrowing
async function handleShare(data: ShareData): Promise<void> {
  if (canUseWebShare(navigator)) {
    // TypeScript now recognizes navigator.share() safely
    await navigator.share(data);
  } else {
    // Fallback logic: copy link to clipboard or open modal
    await navigator.clipboard.writeText(data.url ?? window.location.href);
  }
}
```

### Is there a polyfill for that?

Polyfills can be used to do a variety of things including:

* Adding support for modern web features in older browsers that don't support them
* Providing consistent behavior across different browsers (think of jQuery 1.0 as a normalization polyfill for DOM manipulation)
* Validating the API during development to ensure that the code works as expected
* Providing a fallback for features that are not yet widely supported in modern browsers

While polyfills can be useful, they should be used carefully. Overusing polyfills can lead to increased bundle sizes, potential performance issues, and maintenance challenges as browsers evolve and native support improves.

One way to address this is to use feature detections to conditionally load polyfills only when necessary. This approach ensures that users with modern browsers benefit from native implementations, while those with older browsers receive the necessary polyfills.

The `getTemporal` function demonstrates how to conditionally load a polyfill for the [Temporal API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) in browsers that don't natively support it. It leverages [globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) to check for the existence of the `Temporal` object, dynamically import the polyfill only when needed, and bind it to the `Temporal` global object so your code continues to work regardless.

```ts
// Type-only import: adds zero bytes to the bundle
import type { Temporal as TemporalType } from "@js-temporal/polyfill";

declare global {
  var Temporal: typeof TemporalType;
}

export async function getTemporal(): Promise<typeof TemporalType> {
  // 1. If natively supported, return the global reference immediately
  if (typeof globalThis.Temporal !== "undefined") {
    return globalThis.Temporal;
  }

  // 2. Otherwise, dynamically fetch and load the polyfill chunk on demand
  const { Temporal } = await import("@js-temporal/polyfill");

  // Ensure it is bound to globalThis for the rest of the application
  if (typeof globalThis.Temporal === "undefined") {
    globalThis.Temporal = Temporal;
  }

  return Temporal;
}
```

In code where we want to use the Temporal API, we can call `await getTemporal()` inside an `async` function to ensure that we have a valid reference to the Temporal object, whether it's the native implementation or the polyfill.

```ts
// polyfills.ts
import type { Temporal as TemporalType } from "@js-temporal/polyfill";

declare global {
  var Temporal: typeof TemporalType;
}

if (typeof globalThis.Temporal === "undefined") {
  const { Temporal } = await import("@js-temporal/polyfill");
  globalThis.Temporal = Temporal;
}
```

If you have code that uses the Temporal API, you can use the standard syntax and not worry about whether the browser supports it natively or not. The polyfill will ensure that the API is available.

```ts
// utils.ts (Synchronous, direct standard usage)
export function getIsoTime(): string {
  return Temporal.Now.instant().toString();
}

// calendar.ts
export function createZonedDateTime(isoString: string, timeZone: string) {
  return Temporal.Instant.from(isoString).toZonedDateTimeISO(timeZone);
}
```

You can import `polyfills.ts` as the first import in your main entry point so the dynamic polyfill loads before any other code that relies on it. Dynamic imports let you load a polyfill only when needed, which reduces the initial bundle size and can improve performance. The trade-off is that top-level `await` only works inside ES Modules, so you need to confirm that your build system supports it. If it does not, wrap the dynamic import in an `async` function and call it at the appropriate point in your application lifecycle.

```ts
// Loads the temporal polyfill if needed and sets it on globalThis.Temporal
import "./polyfills.ts";
// Temporal API is now available globally, either natively or via polyfill
import "./utils.ts";
import "./calendar.ts";
```

Polyfills are a powerful tool for developers, but they are not a silver bullet. Philip Walton's talk on the dark side of polyfilling CSS highlights some of the challenges and trade-offs involved in using polyfills effectively.

<lite-youtube videoid="ZskP7cvj3WA" title="dotCSS 2016 - Philip Walton - The Dark Side of Polyfilling CSS"></lite-youtube>

## Conclusion

This post has explored a few ways to think about browser support for modern features and APIs, including Baseline, standards positions, feature detection, and polyfills. The key point is that there is no single answer for every project. The right choice depends on your audience, the feature, the risk you are willing to take, and the experience you are trying to deliver.

These tools and techniques are best understood as a set of options for evaluating trade-offs rather than a universal rulebook. In some cases, browser detection or a fallback is the right answer. In others, a feature can be safely ignored or delayed. The goal is not to pick a single correct policy, but to make deliberate, context-aware decisions based on the realities of the web platform.

A simple checklist can help keep the decision grounded in reality:

* Who is the primary audience, and what devices do they use?
* Is the feature necessary for the core experience or just an enhancement?
* What happens if the browser does not support it?
* Are there reasonable fallback behaviors that preserve the core task?
* Do the browser and platform data justify the trade-off, or is the decision driven by preference alone?

The answer will almost always be different from project to project, and that is precisely the point.
