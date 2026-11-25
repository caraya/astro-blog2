---
title: "Choosing the right complexity"
date: 2026-12-23
tags:
  - CSS
  - JavaScript
  - complexity
  - decision-making
admonition: true
---

Web development provides many different tools and techniques to solve common problems, but choosing the right level of complexity for a given task can be a balancing act between maintainability, performance, and developer productivity.

This post will explore different levels of complexity in web development, how to make informed decisions, and the trade-offs involved in choosing simpler or more complex solutions.

## The problem: Complexity

In [Modern CSS Might Make Your Front-End More Complex](https://www.smashingmagazine.com/2026/11/modern-css-might-make-your-front-end-more-complex/), the author discusses how new CSS features, while powerful, can introduce additional complexity to front-end development. This highlights the broader challenge of balancing simplicity and capability in web development.

CSS has become a more capable language, replacing the need for many JavaScript-based solutions for layout and styling. However, this increased capability comes with its own set of complexities, and trading one type of complexity for another is not always a straightforward decision.

## Evaluating complexity

When deciding on the appropriate level of complexity for a solution, it's important to consider several factors:

* **Maintainability:** How easy will it be for other developers (or your future self) to understand and modify the code?
* **Performance:** Does the added complexity improve performance, or could a simpler solution achieve similar results?
* **Developer productivity:** Will the complexity save time and effort in the long run, or will it introduce unnecessary overhead?
* **Trade-offs:** Every solution has trade-offs. Understanding the costs and benefits of different approaches is key to making informed decisions.

## AI assistance

AI tools can reduce initial effort by generating boilerplate, automating repetitive tasks, and suggesting implementations. That speed does not eliminate the work; it shifts some of it to reviewing the generated code for correctness, accessibility, and fit with the existing architecture, then testing and maintaining it. If the team does not understand the generated code, later changes can take longer and introduce regressions.

* Does the AI-generated code produce accessible, understandable, and maintainable code?
* Does the AI-generated code pass testing and meet the quality standards and requirements of the project?
* How well does the AI-generated code integrate with the existing codebase and project architecture?

## Examples of complexity trade-offs

All the examples in this section illustrate trade-offs between different approaches to solving common development problems, highlighting the complexity considerations that should guide decision-making.

### Flexbox versus Grid for one-dimensional layouts

Given the following HTML structure:

```html
<nav class="toolbar" aria-label="Project actions">
  <a href="/overview">Overview</a>
  <a href="/activity">Activity</a>
  <a href="/settings">Settings</a>
</nav>
```

Flexbox and Grid can both arrange this toolbar in a single row with consistent spacing.

Flexbox expresses the one-dimensional arrangement directly:

```css
.toolbar {
  display: flex;
  gap: 1rem;
}
```

Grid can express the same row:

```css
.toolbar {
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  gap: 1rem;
}
```

For this one-row toolbar, Flexbox expresses the layout directly. Grid can produce the same result, but needs `grid-auto-flow: column` to place the items in a row and `justify-content: start` to keep the tracks grouped at the start. Flexbox is the simpler fit here; choose Grid if it better matches the team's established approach.

### JavaScript versus CSS for layout

Placing a chart tooltip above the bar it describes shows how the same task can be solved with either technology. The JavaScript approach measures the bar's position and sets the tooltip's coordinates:

```css
.tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
}
```

```js
function positionTooltip(bar, tooltip) {
  const bounds = bar.getBoundingClientRect();
  tooltip.style.left = `${bounds.left + bounds.width / 2}px`;
  tooltip.style.top = `${bounds.top}px`;
}
```

After rendering the bar and tooltip, call the function once and again on scroll or resize:

Assume `bar` and `tooltip` reference the rendered DOM elements.

```js
const updateTooltip = () => positionTooltip(bar, tooltip);

updateTooltip();
window.addEventListener("scroll", updateTooltip, { passive: true });
window.addEventListener("resize", updateTooltip);
```

For a chart with several active tooltips, JavaScript could measure candidate positions and choose the one that minimizes overlap according to chart-specific priorities.

The [CSS anchor positioning API](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) accomplishes the same task declaratively.

The `.bar` rule declares an anchor name with `anchor-name`, and the tooltip positions itself relative to that anchor:

```css
.bar {
  anchor-name: --bar;
}

.tooltip {
  position: fixed;
  position-anchor: --bar;
  position-area: top;
}
```

The browser keeps the tooltip positioned as the page scrolls or resizes, with no measurement code to write or maintain. The core anchor positioning API, used in this example, is supported in all modern browsers; some newer features of the API vary in support, so check [current support](https://caniuse.com/css-anchor-positioning) before using features beyond the core. The JavaScript version makes you responsible for re-running the positioning logic whenever the layout changes.

<custom-admonition type="note" title="Browser versions and update channels">
  <p>Chrome, Edge, and Firefox generally update automatically, so users often receive new features soon after they ship. Safari updates are available through System Settings. However, the latest Safari releases are not available on macOS versions three major releases behind the current one.</p>
  <p>When evaluating support for a newer feature, check your analytics to see which browser versions your audience actually runs, not just whether the latest release of each browser implements it.</p>
</custom-admonition>

<custom-admonition type="note" title="Enterprise considerations">
  <p>Managed browser environments are mostly found in enterprise settings. CSS features are rarely blocked outright, but rollout schedules can postpone their availability.</p>
  <p>Firefox Policy Templates let IT admins use the <code>Preferences</code> policy to lock Firefox preferences, including experimental <code>layout.css.*</code> toggles. Depending on the configured value, this can force a feature on or off and prevent users from changing that preference.</p>
</custom-admonition>

When deciding between using JavaScript or CSS for layout, there are several complexity trade-offs to consider:

* **Maintainability:** The CSS version declares the relationship once and the browser maintains it. The JavaScript version requires you to track every event that can invalidate the position.
* **Performance:** The browser updates anchored elements as part of its normal layout work. JavaScript positioning adds measurement and style updates that can trigger extra reflows, especially on scroll.
* **Developer productivity:** The CSS version is less code to write and test. The JavaScript version requires more code, but allows application-specific placement decisions.
* **Trade-offs:** Prefer CSS when a declarative feature covers the requirement. Use JavaScript when the behavior depends on information or decisions that CSS cannot access.

### Different CSS strategies for the same goal

The same card can be styled with nested CSS selectors or utility classes. With nested CSS, styles live in a stylesheet:

```html
<article class="card">
  <h2>Project updates</h2>
</article>
```

```css
.card {
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;

  & h2 {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
```

In a project that uses Tailwind CSS, utility classes put those styles in the markup:

```html
<article class="rounded-lg border border-gray-300 p-4">
  <h2 class="m-0 text-xl leading-7">Project updates</h2>
</article>
```

Both approaches can produce the same result. Nested CSS keeps presentation separate from markup, following a familiar stylesheet-based workflow. Utility classes keep styles next to the content but tightly couple styling to the markup, and require developers to learn both the framework's utility conventions and the team's conventions for using them.

When choosing between different CSS strategies to achieve the same layout or styling goal, consider the following complexity trade-offs:

* **Maintainability:** Utility classes can be consistent across a project, while nested selectors keep styles separate from markup. Deeply nested selectors can make it harder to trace which rules apply.
* **Performance:** Performance depends on the project's build and runtime setup; the choice of selector style alone does not guarantee a smaller bundle or faster page.
* **Developer productivity:** Utility classes can speed up initial styling when the team knows the system, but they slow down changes: updating a design decision means finding and editing every element that uses the affected classes. With nested CSS, a change to a selector updates every element it matches.

Choosing a CSS strategy involves balancing maintainability, performance, and developer productivity. Understanding the trade-offs helps in selecting the most appropriate approach for a given project.

## Summary

There is no universally right level of complexity, only the right level for a given task, team, and audience. The examples in this post share a common pattern: each approach trades one kind of complexity for another rather than eliminating it.

When choosing between approaches, a few guidelines help:

* **Evaluate against concrete criteria.** Weigh maintainability, performance, and developer productivity rather than defaulting to the most familiar or the newest tool.
* **Prefer declarative solutions when they cover the requirement.** Features like Grid and anchor positioning let the browser do work you would otherwise write, test, and maintain yourself.
* **Reserve imperative code for what declarative features cannot do.** JavaScript earns its complexity when behavior depends on runtime measurements or application state.
* **Account for your audience.** Check your analytics for the browser versions your users actually run before adopting newer features.
* **Consider the whole lifecycle.** An approach that speeds up initial development, such as utility classes or AI-generated code, can shift cost to later changes, reviews, and onboarding.

Complexity is not inherently bad; unexamined complexity is. Making the trade-offs explicit turns the choice from a matter of habit into an informed decision.
