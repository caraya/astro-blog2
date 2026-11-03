---
title: "Building Color Harmonies with CSS @functions"
date: 2026-12-04
tags:
  - css
  - color
  - oklch
  - relative color syntax
---

CSS `@function` lets stylesheets define reusable, typed calculations. This post uses a small OKLCH palette to demonstrate function parameters, return types, composition, and progressive enhancement. The color harmonies are the example; the focus is how the at-rule works in experimental browser implementations.

Relative Color Syntax provides a fallback for browsers that do not support the prototype.

## The example input

The seed is the input to both the fallback expressions and the custom functions:

```css
:root {
  /* Dynamic seed color (OKLCH wide-gamut) */
  --seed: oklch(0.6 0.22 250);
}
```

## Fallback with Relative Color Syntax

Relative Color Syntax exposes a color's channels for calculation. These custom properties provide static fallbacks and a baseline for comparing the `@function` versions:

```css
:root {
  /* Baseline Relative Color Syntax (Production-ready evergreen fallbacks) */
  --complement:    oklch(from var(--seed) l c calc(h + 180));
  --split-1:       oklch(from var(--seed) l c calc(h + 150));
  --split-2:       oklch(from var(--seed) l c calc(h - 150));
  --triad-1:       oklch(from var(--seed) l c calc(h + 120));
  --triad-2:       oklch(from var(--seed) l c calc(h - 120));
  --tetrad-90:     oklch(from var(--seed) l c calc(h + 90));
  --tetrad-180:    oklch(from var(--seed) l c calc(h + 180));
  --tetrad-270:    oklch(from var(--seed) l c calc(h - 90));
  --tint-mid:      oklch(from var(--seed) clamp(0, calc(l + 0.22), 1) c h);
}
```

In `oklch(from var(--seed) l c calc(h + 180))`, `l` and `c` preserve the seed's lightness and chroma, while `h` is rotated by 180 degrees. Hue angles wrap around the 360-degree circle, so `+270deg` is equivalent to `-90deg`.

The offsets below identify the palette examples; their color-theory details are not needed to follow the function syntax:

* **Complementary (`+180deg`):** The hue opposite the seed.
* **Split-complementary (`+150deg`, `-150deg`):** Two hues on either side of the complement.
* **Triadic (`+120deg`, `-120deg`):** Two additional hues equally spaced from the seed.
* **Tetradic Square (`+90deg`, `+180deg`, `+270deg`):** Three additional hues at quarter-turn intervals.
* **Tetradic Rectangle:** A square chord is the equal-spacing case of a tetradic rectangle. With the seed as the starting hue (`0deg`), `α` is the positive hue offset to the next color, not the starting hue; setting `α` to `90deg` gives the square's other offsets: `+90deg`, `+180deg`, and `+270deg`.

## CSS `@function`

The fallback expressions above repeat channel calculations. The [CSS Functions and Mixins Level 1 proposal](https://drafts.csswg.org/css-mixins-1/) adds `@function` so a stylesheet can define reusable, parameterized operations instead. The examples below demonstrate hue rotation, lightness adjustment, and function composition:

The following CSS defines four custom functions:

```css
@function --rotate-hue(--base <color>, --degrees <number>) returns <color> {
  result: oklch(from var(--base) l c calc(h + var(--degrees)));
}

@function --shift-lightness(--base <color>, --delta <number>) returns <color> {
  result: oklch(from var(--base) clamp(0, calc(l + var(--delta)), 1) c h);
}

@function --complement-fn(--base <color>) returns <color> {
  result: --rotate-hue(var(--base), 180);
}

@function --triad-fn(--base <color>, --step <integer>: 1) returns <color> {
  result: --rotate-hue(var(--base), calc(var(--step) * 120));
}
```

A full version of this code was tested in Firefox Nightly and Safari Technology Preview in [this CodePen](https://codepen.io/editor/caraya/pen/01a13166-86bd-70b2-8de5-53a956e6ee2d).

### Syntax breakdown

1. **Parameter signatures:** Arguments are declared using dashed identifiers followed by their explicit CSS type component (such as `<color>`, `<number>`, or `<integer>`).
2. **Default parameters:** Declaring `--step <integer>: 1` provides a fallback value if the caller omits the argument.
3. **Explicit return contracts:** `returns <color>` enforces that the function output conforms to a valid color type.
4. **The `result:` descriptor:** Specifies the computed output returned by the function.
5. **Function composition:** Custom functions can call other custom functions. `--complement-fn` delegates its calculation directly to `--rotate-hue()`.

### Chromium prototype constraints to keep in mind

[Can I Use reports](https://caniuse.com/wf-function) support beginning with Chrome and Edge 139+, Opera 123+, Chrome for Android and Android Browser 156+, and Samsung Internet 30+. Browser versions are informational; the `@supports` query below checks whether the browser accepts a property value that calls a custom function. It does not define or enable `@function`. In Chromium-based browsers, the prototype can be enabled with `chrome://flags#enable-experimental-web-platform-features` or tested in Chrome Canary.

* **No inline conditionals (`if()`):** The draft `if()` syntax is not yet implemented in the rendering engine; function bodies containing `if()` fail to parse.
* **No early returns:** The engine parses the entire block; the cascade determines the final value, meaning the **last valid `result:` descriptor wins**.
* **Brace-grouped arguments:** The specification allows comma-containing values to be passed as a single function argument by wrapping them in `{}`; the current Chromium implementation does not yet support this syntax.

## Progressive enhancement with `@supports`

`@function` defines the custom functions above. The separate `@supports` rule conditionally applies declarations that call them, leaving the Relative Color Syntax fallbacks in place when the browser does not accept the tested function call:

```css
/* Progressive enhancement: override tokens if @function is parsed */
@supports (background-color: --complement-fn(blue)) {
  :root {
    --complement: --complement-fn(var(--seed));
    --triad-1:    --triad-fn(var(--seed), 1);
    --triad-2:    --triad-fn(var(--seed), 2);
    --tint-mid:   --shift-lightness(var(--seed), 0.22);
  }
}
```

1. **Baseline execution:** If the browser rejects the function call in the `@supports` condition, the block is skipped and the Relative Color Syntax fallback tokens declared earlier in `:root` remain in effect.
2. **Enhanced execution:** If the browser accepts the tested function call, it applies the custom-property declarations inside the block, which call the defined functions and override the fallback tokens.

## Key takeaways: CSS `@function`

1. **Declare reusable operations:** `@function` gives a stylesheet named functions with typed parameters and return values.
2. **Compose calculations:** Higher-level functions can reuse lower-level operations such as hue rotation.
3. **Keep a fallback:** Relative Color Syntax supplies baseline values when the experimental function prototype is unavailable.
4. **Check implementation support:** The examples target Chromium's experimental implementation, whose supported syntax may differ from the full proposal.
