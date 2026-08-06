---
title: "CSS @function"
date: 2026-08-12
---

In this post, we'll explore the new CSS @function at-rule. It gives us a native way to package repeated value logic directly in CSS, without reaching for a preprocessor first.

For years, tools like Sass and LESS were the default way to create reusable function-like patterns. They're still useful, but they require a build step. The CSS Working Group is bringing similar ideas into the platform itself, which makes some workflows simpler and more direct.

<custom-admonition type="tip" title="Browser Support Warning">
    <p>The <code>@function</code> at-rule is experimental. Support is currently limited and can change quickly, so we should verify compatibility for our target browsers and always include fallbacks.</p>
</custom-admonition>

## What is @function?

`@function` lets us define custom CSS value functions. We call them with dashed-function syntax like `--scale(2rem)`. Inside the function body, we can reference arguments, define local variables, and return a final value with `result`.

If we already use custom properties heavily, this feels like a natural extension: custom properties give us reusable values, while custom functions give us reusable value logic.

### Formal syntax

According to the CSSWG draft, the syntax supports typed parameters, default values, and an optional return type.

```css
@function --function-name(--arg1 <type>: default, --arg2) returns <type> {
  /* Function body with logic */
  result: /* some computed value */;
}
```

* `--function-name`: The function name we'll call, for example `--my-function()`.
* `--arg1 <type>: default`: A parameter that can include a type (like `<length>` or `<color>`) and a default value.
* `returns <type>`: Optional return type information.
* `result: ...`: The descriptor that returns the final value.

### Implementation status (current Chromium subset)

The full spec is still in progress, and current implementations expose a subset of the draft behavior.

* Supported:
	* Basic function definitions
	* Positional arguments
	* `result`
	* Local custom properties in the function body
* Not fully available in current implementations:
	* Typed parameters
	* Default parameter values in the prelude
	* `returns`
	* Named arguments at call site

## Default value workaround

Until default parameters are broadly implemented, we can use a local variable plus `var()` fallback inside the function body.

```css
/* Not broadly supported yet: */
/* @function --scale(--size: 1rem) { ... } */

@function --scale(--size) {
    --safe-size: var(--size, 1rem);
    result: calc(var(--safe-size) * 1.5);
}

.box-1 {
    width: --scale(); /* 1.5rem */
}

.box-2 {
    width: --scale(2rem); /* 3rem */
}
```

This keeps `result` readable while still giving us sane defaults.

## Fallbacks for unsupported browsers

Because `@function` is experimental, we should layer fallbacks first.

### Use the cascade first

We define a plain value first, then override it with a function call.

```css
.element {
  --border-color: #cc0000;
  --border-color: --generate-shade(crimson, 10%);
}
```

Browsers that cannot use the function declaration keep the earlier value.

### Add `@supports` for stricter gating

For more complex usage, we can gate advanced declarations behind `@supports`.

```css
.another-element {
    --padding-large: 32px;
}

@supports (padding: --calculate-spacing(1rem, 2)) {
    .another-element {
        --padding-large: --calculate-spacing(var(--base-spacing), 2);
    }
}
```

As a baseline, rely on the cascade fallback and treat `@supports` as an extra guard.

## Example 1: Styled borders

This function combines multiple arguments into a single border shorthand value.

```css
@function --create-styled-border(--width, --style, --color) {
    result: var(--width) var(--style) var(--color);
}

.styled-border-example-1 {
    border: --create-styled-border(2px, solid, crimson);
}

.styled-border-example-2 {
    border: --create-styled-border(5px, dashed, limegreen);
}
```

<custom-admonition type="note">
	<p>In current implementations, pass arguments positionally and in order.</p>
</custom-admonition>

## Example 2: Color theming helpers

We can wrap `color-mix()` to generate shades and tints from one base color.

```css
@function --generate-shade(--base-color, --percentage) {
    result: color-mix(in srgb, var(--base-color), black var(--percentage));
}

@function --generate-tint(--base-color, --percentage) {
    result: color-mix(in srgb, var(--base-color), white var(--percentage));
}

:root {
    --base-color: #3b82f6;
}

.themed {
    --primary-color: var(--base-color);
    --primary-color-dark: --generate-shade(var(--base-color), 20%);
    --primary-color-light: --generate-tint(var(--base-color), 20%);
    --primary-color-lighter: --generate-tint(var(--base-color), 80%);
}
```

<custom-admonition type="tip" title="Key Concept: Evaluation Timing">
    <p>Function definitions are parsed with the stylesheet, but function calls are resolved during value computation, similar to how <code>var()</code> participates in substitution.</p>
	<p>That means a function result can still respond when its inputs change, as long as the returned expression depends on those changing values.</p>
</custom-admonition>

## Example 3: Spacing system

A spacing function keeps our spacing scale consistent and removes repeated math.

```css
@function --calculate-spacing(--base-unit, --multiplier) {
    result: calc(var(--base-unit) * var(--multiplier));
}

:root {
    --base-spacing: 1rem;
}

.dynamic-spacing {
    --spacing-sm: --calculate-spacing(var(--base-spacing), 0.5); /* 8px */
    --spacing-md: var(--base-spacing); /* 16px */
    --spacing-lg: --calculate-spacing(var(--base-spacing), 2); /* 32px */
    --spacing-xl: --calculate-spacing(var(--base-spacing), 4); /* 64px */
}
```

## Example 4: Fluid typography

Fluid type is a good match for `@function` because the formula is verbose but reusable.

```css
@function --fluid-typography(--min-size, --max-size, --min-vw, --max-vw) {
    result: clamp(var(--min-size),
                   calc(var(--min-size) + (var(--max-size) - var(--min-size)) * ((100vw - var(--min-vw)) / (var(--max-vw) - var(--min-vw)))),
                   var(--max-size));
}

.fluid-text-container {
    --fluid-font-size: --fluid-typography(1rem, 3rem, 320px, 1200px);
    font-size: var(--fluid-font-size);
}
```

<custom-admonition type="tip" title="Key Concept: Returning Dynamic CSS">
	<p>A custom function can return native dynamic constructs like <code>clamp()</code>. If the returned expression uses viewport units or live custom properties, the used value can update as those inputs change.</p>
</custom-admonition>

## Conclusion

`@function` gives CSS a native abstraction layer for repeated value logic. The big wins are readability, reuse, and keeping more logic in plain CSS.

The practical limitation today is support and incomplete implementation coverage, not the concept itself. If we pair function calls with clear fallbacks, we can start experimenting safely while the feature matures.
