---
title: "Building color harmonies with modern CSS: A technical breakdown"
date: 2026-11-27
tags:
  - css
  - color
  - oklch
  - relative-color-syntax
draft: true
status: needs-review
---

For years, generating algorithmic color harmonies required build-time CSS preprocessors like Sass or runtime JavaScript color libraries. With the arrival of Relative Color Syntax (RCS), perceptual color spaces like OKLCH and OKLAB, and experimental CSS `@function` at-rules, modern browsers can now dynamically compute harmonic color palettes directly inside the stylesheet.

This guide breaks down the code behind the standalone reference implementation, exploring how each layer of the CSS architecture works, why specific color spaces were selected, and how to build maintainable, accessible color systems.

## Establishing the base seed token in OKLCH

Everything in the system stems from a single source-of-truth token defined at the `:root` level:

```css
:root {
  /* Dynamic seed color (OKLCH wide-gamut) */
  --seed: oklch(0.6 0.22 250);
}
```

### Why OKLCH instead of HSL or Hex?

Legacy CSS relied on Hex, RGB, or HSL. In HSL (`hsl(hue, saturation, lightness)`), lightness is not perceptually uniform. For example, pure yellow (`hsl(60, 100%, 50%)`) and pure blue (`hsl(240, 100%, 50%)`) have identical nominal lightness values of 50%, yet human eyes perceive yellow as drastically brighter than blue. Rotating hue in HSL causes dramatic swings in perceived brightness and contrast.

OKLCH solves this problem:

* **Lightness (L):** Represents uniform perceived lightness from `0.0` (black) to `1.0` (white). An OKLCH lightness of `0.6` maintains uniform perceived luminance regardless of the hue angle.
* **Chroma (C):** Represents color saturation or purity from `0.0` (achromatic gray) upward into wide-gamut spaces (like Display-P3).
* **Hue (H):** An angle from `0` to `360` degrees corresponding to the perceptual color circle.

By anchoring our system to an OKLCH seed, rotating the hue creates harmonious chords that preserve consistent perceived brightness across all derived swatches.

## Mathematical harmony generation via Relative Color Syntax

Relative Color Syntax (RCS) allows CSS to deconstruct an existing color token into its individual channel components, apply mathematical calculations to those channels, and output a new color.

The system uses RCS to generate classical color chords from `--seed`:

```css
:root {
  /* Baseline Relative Color Syntax (Production-ready evergreen fallbacks) */
  --complement:    oklch(from var(--seed) l c calc(h + 180));
  --split-1:       oklch(from var(--seed) l c calc(h + 150));
  --split-2:       oklch(from var(--seed) l c calc(h + 210));
  --triad-1:       oklch(from var(--seed) l c calc(h + 120));
  --triad-2:       oklch(from var(--seed) l c calc(h + 240));
  --tetrad-90:     oklch(from var(--seed) l c calc(h + 90));
  --tetrad-180:    oklch(from var(--seed) l c calc(h + 180));
  --tetrad-270:    oklch(from var(--seed) l c calc(h + 270));
}
```

### How `oklch(from ...)` evaluates

1. **Origin color deconstruction:** `from var(--seed)` instructs the browser engine to resolve `--seed` and expose its channel values as internal keyword variables: `l` (lightness), `c` (chroma), `h` (hue), and `alpha`.
2. **Channel re-mapping:**
   * Passing `l` and `c` unmodified retains the original brightness and saturation.
   * `calc(h + 180)` rotates the hue angle by 180 degrees, landing directly on the complementary color opposite the seed.
3. **Automatic wrap-around:** The CSS specification dictates that hue angles wrap around the 360-degree circle automatically. If `h + 270` results in `520`, the browser resolves it to `160deg` (520 modulo 360).

### The harmonic formulas explained

* **Complementary (`+180deg`):** Produces maximum color contrast and visual tension while preserving luminance.
* **Split-Complementary (`+150deg`, `+210deg`):** Flanks the direct complement on either side, offering strong visual contrast with reduced chromatic vibration.
* **Triadic Chord (`+120deg`, `+240deg`):** Forms an equilateral triangle across the color wheel. When paired with the base seed (0 degrees), it creates a balanced three-color palette.
* **Tetradic Square Chord (`+90deg`, `+180deg`, `+270deg`):** Divides the color wheel into four equal quadrants, generating two complementary pairs.

## Tonal modulations, tints, shades, and scrims

Harmonies provide hue variety, but functional UI design requires surface tints, interactive shades, and translucent scrims. The stylesheet accomplishes this using a mix of RCS channel manipulation and `color-mix()`:

```css
:root {
  /* Tonal steps via Relative Color Syntax */
  --shade-deep:    oklch(from var(--seed) calc(l * 0.45) c h);
  --shade-mid:     oklch(from var(--seed) calc(l * 0.75) c h);
  --tint-mid:      oklch(from var(--seed) clamp(0, calc(l + 0.22), 0.98) c h);
  --seed-muted:    oklch(from var(--seed) l calc(c * 0.35) h);

  /* Solid and translucent blending */
  --tint-soft:     color-mix(in oklab, var(--seed) 18%, #ffffff);
  --scrim-overlay: color-mix(in oklab, var(--seed) 30%, transparent);
}
```

### Lightness scaling and clamping

* **Shades (`calc(l * 0.45)`):** Multiplying the lightness channel dims the tone proportionally without shifting hue or washing out chroma into muddy gray.
* **Lightness Offset with `clamp()`:** When increasing lightness (`calc(l + 0.22)`), there is a risk of overflowing the maximum lightness threshold of 1.0. Wrapping the expression in `clamp(0, calc(l + 0.22), 0.98)` guards against clipping and keeps the surface slightly off pure white.
* **Chroma Desaturation (`calc(c * 0.35)`):** Multiplying chroma by 0.35 attenuates saturation while preserving exact lightness and hue, creating subtle secondary or disabled states.

### Solid tints vs. translucent scrims

* **`color-mix(in oklab, var(--seed) 18%, #ffffff)`:** Mixing in OKLAB creates an opaque, solid pastel tint. Because OKLAB is perceptually uniform, it prevents the gray desaturation "dead zone" that occurs when interpolating colors in standard sRGB. Because the result is completely opaque, its contrast against other text and surfaces is static and predictable.
* **`color-mix(in oklab, var(--seed) 30%, transparent)`:** Creates a 30% alpha scrim that reveals backdrop surfaces while maintaining the chromatic tint of the seed.

## Native CSS `@function` rules in Chromium

While static custom properties can calculate values once at `:root`, the CSS Functions and Mixins Level 1 specification introduces `@function`, enabling custom, parameterized functions that can be reused anywhere in a stylesheet.

The reference implementation defines four functions targeting Chromium's experimental prototype:

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

### Syntax breakdown

1. **Parameter signatures:** Arguments are declared using dashed identifiers followed by their explicit CSS type component (such as `<color>`, `<number>`, or `<integer>`).
2. **Default parameters:** Declaring `--step <integer>: 1` provides a fallback value if the caller omits the argument.
3. **Explicit return contracts:** `returns <color>` enforces that the function output conforms to a valid color type.
4. **The `result:` descriptor:** Specifies the computed output returned by the function.
5. **Function composition:** Custom functions can call other custom functions. `--complement-fn` delegates its calculation directly to `--rotate-hue()`.

### Chromium prototype constraints to keep in mind

Chromium's initial prototype (available via `chrome://flags#enable-experimental-web-platform-features` or Chrome Canary) supports a subset of the full proposed specification:

* **No inline conditionals (`if()`):** The draft `if()` syntax is not yet implemented in the rendering engine; function bodies containing `if()` fail to parse.
* **No early returns:** The engine parses the entire block; the cascade determines the final value, meaning the **last valid `result:` descriptor wins**.
* **No list parameters:** Proposed list parameters enclosed in `{}` are not yet parsed.

## Progressive enhancement via `@supports`

To ensure the architecture functions seamlessly across all modern browsers while exercising native `@function` in supported environments, the stylesheet applies progressive enhancement:

```css
/* Progressive enhancement: override tokens if @function is parsed */
@supports (background-color: --complement-fn(blue)) {
  :root {
    --complement: --complement-fn(var(--seed));
    --triad-1:    --triad-fn(var(--seed), 1);
    --triad-2:    --triad-fn(var(--seed), 2);
  }
}
```

1. **Baseline execution:** In standard browsers (Safari, Firefox, unflagged Chrome), the `@supports` test returns false. The browser ignores the block and continues using the Baseline Relative Color Syntax tokens declared earlier in `:root`.
2. **Enhanced execution:** In flagged Chromium builds, the browser evaluates the test as true and dynamically overrides the custom properties using the native `@function` declarations.

## Component architecture and separation of concerns

A key architectural goal is keeping presentation logic inside the stylesheet rather than inlining styles into the markup.

### Dedicated swatch modifier classes

Rather than writing `style="background-color: var(--complement)"` across dozens of elements, each swatch is mapped to a dedicated modifier class:

```css
.swatch-seed        { background-color: var(--seed); }
.swatch-complement  { background-color: var(--complement); }
.swatch-split-1     { background-color: var(--split-1); }
.swatch-split-2     { background-color: var(--split-2); }
.swatch-triad-1     { background-color: var(--triad-1); }
.swatch-triad-2     { background-color: var(--triad-2); }
.swatch-tetrad-90   { background-color: var(--tetrad-90); }
.swatch-tetrad-180  { background-color: var(--tetrad-180); }
.swatch-tetrad-270  { background-color: var(--tetrad-270); }
```

### Contrast-conscious text overrides

The base `.swatch` selector assigns a default white text color (`color: #ffffff`), which provides high contrast on dark and mid-tone colors. However, bright tints would cause white text to fail accessibility contrast thresholds.

The stylesheet addresses this by automatically flipping the text color on high-lightness classes:

```css
.swatch-tint-mid {
  background-color: var(--tint-mid);
  color: #0f172a; /* Automatically flipped to dark slate for contrast */
}

.swatch-tint-soft {
  background-color: var(--tint-soft);
  color: #0f172a; /* Automatically flipped to dark slate for contrast */
}
```

### Side-by-side color comparison bars

To evaluate how each generated harmony interacts with the originating anchor, each card contains a split comparison strip:

```css
.pair-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #374151;
  margin-top: 0.5rem;
}

.pair-base {
  width: 50%;
  background-color: var(--seed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
}

.pair-target {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
}
```

In the markup, the harmony swatch class is reused directly on the `.pair-target` half:

```html
<div class="pair-bar">
  <div class="pair-base">Base</div>
  <div class="pair-target swatch-complement">Harmony</div>
</div>
```

This arrangement allows designers and developers to immediately verify color balance, saturation differences, and edge contrast between the seed and its derived harmonic token without needing external design tooling.

## Summary of architectural takeaways

1. **Use OKLCH for generative palettes:** Anchoring mathematical hue offsets in OKLCH ensures perceived lightness remains consistent across rotation angles.
2. **Relative Color Syntax is production-ready today:** The `oklch(from var(--token) ...)` syntax is Baseline Widely Available and replaces preprocessor math across all evergreen browsers.
3. **Use OKLAB for solid tints:** `color-mix(in oklab, var(--token) 20%, white)` creates predictable, opaque UI surfaces without the muddy desaturation of sRGB.
4. **Prepare for `@function` with clean abstraction:** Encapsulate mathematical pipelines cleanly so that as CSS Functions and Mixins Level 1 transitions from Chromium experiments to cross-engine Baseline availability, your design system tokens can adopt native functions with minimal refactoring.

## Appendix: Complete standalone reference implementation

Below is the complete, self-contained reference implementation combining HTML structure and CSS architecture. It is ready for deployment in modern browsers or local test harnesses:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern CSS Color Harmonies & Native Functions: Reference Implementation</title>
  <style>
    /* =========================================================================
       1. HARMONY CALCULATIONS & SEED TOKENS (Baseline Relative Color Syntax)
       ========================================================================= */
    :root {
      /* Base seed token in OKLCH wide-gamut */
      --seed: oklch(0.6 0.22 250);

      /* Production-ready Relative Color Syntax (Baseline Widely Available) */
      --complement:    oklch(from var(--seed) l c calc(h + 180));
      --split-1:       oklch(from var(--seed) l c calc(h + 150));
      --split-2:       oklch(from var(--seed) l c calc(h + 210));
      --triad-1:       oklch(from var(--seed) l c calc(h + 120));
      --triad-2:       oklch(from var(--seed) l c calc(h + 240));
      --tetrad-90:     oklch(from var(--seed) l c calc(h + 90));
      --tetrad-180:    oklch(from var(--seed) l c calc(h + 180));
      --tetrad-270:    oklch(from var(--seed) l c calc(h + 270));

      /* Tonal modulations, tints, shades, and scrims */
      --shade-deep:    oklch(from var(--seed) calc(l * 0.45) c h);
      --shade-mid:     oklch(from var(--seed) calc(l * 0.75) c h);
      --tint-mid:      oklch(from var(--seed) clamp(0, calc(l + 0.22), 0.98) c h);
      --seed-muted:    oklch(from var(--seed) l calc(c * 0.35) h);
      --tint-soft:     color-mix(in oklab, var(--seed) 18%, #ffffff);
      --scrim-overlay: color-mix(in oklab, var(--seed) 30%, transparent);
    }

    /* =========================================================================
       2. EXPERIMENTAL CHROMIUM @function RULES
       ========================================================================= */
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

    /* Progressive enhancement override if @function is parsed by the engine */
    @supports (background-color: --complement-fn(blue)) {
      :root {
        --complement: --complement-fn(var(--seed));
        --triad-1:    --triad-fn(var(--seed), 1);
        --triad-2:    --triad-fn(var(--seed), 2);
      }
    }

    /* =========================================================================
       3. SWATCH CLASSES (No inline styles; contrast-conscious colors)
       ========================================================================= */
    .swatch {
      height: 95px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: 0.02em;
      color: #ffffff; /* High contrast default for saturated and dark tones */
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }

    /* Base anchor swatch */
    .swatch-seed        { background-color: var(--seed); }

    /* Harmonic swatches */
    .swatch-complement  { background-color: var(--complement); }
    .swatch-split-1     { background-color: var(--split-1); }
    .swatch-split-2     { background-color: var(--split-2); }
    .swatch-triad-1     { background-color: var(--triad-1); }
    .swatch-triad-2     { background-color: var(--triad-2); }
    .swatch-tetrad-90   { background-color: var(--tetrad-90); }
    .swatch-tetrad-180  { background-color: var(--tetrad-180); }
    .swatch-tetrad-270  { background-color: var(--tetrad-270); }

    /* Tones and shades */
    .swatch-shade-deep  { background-color: var(--shade-deep); }
    .swatch-shade-mid   { background-color: var(--shade-mid); }
    .swatch-muted       { background-color: var(--seed-muted); }
    .swatch-scrim       { background-color: var(--scrim-overlay); }

    /* High-lightness tints with automatically flipped dark text */
    .swatch-tint-mid {
      background-color: var(--tint-mid);
      color: #0f172a;
      text-shadow: none;
    }

    .swatch-tint-soft {
      background-color: var(--tint-soft);
      color: #0f172a;
      text-shadow: none;
    }

    /* =========================================================================
       4. JUXTAPOSITION PREVIEW BARS
       ========================================================================= */
    .pair-bar {
      display: flex;
      height: 20px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #374151;
      margin-top: 0.5rem;
    }

    .pair-base {
      width: 50%;
      background-color: var(--seed);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pair-target {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* =========================================================================
       5. GENERAL LAYOUT & CARD STYLING
       ========================================================================= */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f3f4f6;
      padding: 2.5rem 1.5rem;
      line-height: 1.5;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 2.5rem;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.85rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }

    p.subtitle {
      color: #9ca3af;
      font-size: 0.95rem;
    }

    .status-badge {
      display: inline-block;
      margin-top: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: #e5e7eb;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.25rem;
    }

    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .card-body {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex-grow: 1;
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f9fafb;
    }

    .card-desc {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .card-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.7rem;
      background: #1f2937;
      padding: 0.35rem 0.5rem;
      border-radius: 4px;
      color: #38bdf8;
      overflow-x: auto;
      margin-top: auto;
    }
  </style>
</head>
<body>

  <div class="container">
    <header>
      <h1>Modern CSS Color Harmonies & Native Functions</h1>
      <p class="subtitle">Mathematical palette generation using OKLCH Relative Color Syntax and native CSS @function rules.</p>
      <div class="status-badge">Baseline Compatible + Progressive @function Support</div>
    </header>

    <!-- 1. BASE ANCHOR -->
    <h2 class="section-title">Base Anchor Token</h2>
    <div class="grid">
      <div class="card">
        <div class="swatch swatch-seed">Base Seed</div>
        <div class="card-body">
          <div class="card-title">Origin Color Token</div>
          <div class="card-desc">The master wide-gamut OKLCH seed from which all mathematical harmonies derive.</div>
          <div class="card-code">--seed: oklch(0.6 0.22 250);</div>
        </div>
      </div>
    </div>

    <!-- 2. COMPLEMENTARY & SPLIT -->
    <h2 class="section-title">Complementary & Split Harmonies</h2>
    <div class="grid">
      <div class="card">
        <div class="swatch swatch-complement">180° Complement</div>
        <div class="card-body">
          <div class="card-title">Complementary</div>
          <div class="card-desc">Exact polar opposite on the 360° color circle. Maximum visual contrast.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-complement">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 180))</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-split-1">+150° Split</div>
        <div class="card-body">
          <div class="card-title">Split-Complementary A</div>
          <div class="card-desc">Adjacent to the direct complement (-30° offset from opposite).</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-split-1">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 150))</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-split-2">+210° Split</div>
        <div class="card-body">
          <div class="card-title">Split-Complementary B</div>
          <div class="card-desc">Adjacent to the direct complement (+30° offset from opposite).</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-split-2">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 210))</div>
        </div>
      </div>
    </div>

    <!-- 3. TRIADIC CHORD -->
    <h2 class="section-title">Triadic Chord (3-Color Equilateral Palette)</h2>
    <div class="grid">
      <div class="card">
        <div class="swatch swatch-seed">Base (0°)</div>
        <div class="card-body">
          <div class="card-title">Triad Anchor (Step 0)</div>
          <div class="card-desc">Origin vertex of the equilateral triangle.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-seed">Base</div>
          </div>
          <div class="card-code">var(--seed)</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-triad-1">+120° Triad</div>
        <div class="card-body">
          <div class="card-title">Triad Step 1 (+120°)</div>
          <div class="card-desc">First 120° rotational step around the perceptual color wheel.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-triad-1">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 120))</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-triad-2">+240° Triad</div>
        <div class="card-body">
          <div class="card-title">Triad Step 2 (+240°)</div>
          <div class="card-desc">Second 120° rotational step completing the balanced triad.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-triad-2">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 240))</div>
        </div>
      </div>
    </div>

    <!-- 4. TETRADIC CHORD -->
    <h2 class="section-title">Tetradic Square Chord (4-Color Quadrant Palette)</h2>
    <div class="grid">
      <div class="card">
        <div class="swatch swatch-seed">Base (0°)</div>
        <div class="card-body">
          <div class="card-title">Square Anchor (0°)</div>
          <div class="card-desc">Origin coordinate of the 4-color square chord.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-seed">Base</div>
          </div>
          <div class="card-code">var(--seed)</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-tetrad-90">+90° Square</div>
        <div class="card-body">
          <div class="card-title">Quadrant Step 1 (+90°)</div>
          <div class="card-desc">First 90-degree quadrant rotation.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-tetrad-90">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 90))</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-tetrad-180">+180° Square</div>
        <div class="card-body">
          <div class="card-title">Quadrant Step 2 (+180°)</div>
          <div class="card-desc">Second 90-degree step (polar complement).</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-tetrad-180">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 180))</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-tetrad-270">+270° Square</div>
        <div class="card-body">
          <div class="card-title">Quadrant Step 3 (+270°)</div>
          <div class="card-desc">Third 90-degree quadrant completing the square.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-tetrad-270">Harmony</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l c calc(h + 270))</div>
        </div>
      </div>
    </div>

    <!-- 5. TONAL SHADES & TINTS -->
    <h2 class="section-title">Tonal Modulations, Tints & Scrims</h2>
    <div class="grid">
      <div class="card">
        <div class="swatch swatch-shade-deep">Deep Shade</div>
        <div class="card-body">
          <div class="card-title">Deep Shade (L × 0.45)</div>
          <div class="card-desc">Proportional lightness reduction preserving hue and chroma purity.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-shade-deep">Shade</div>
          </div>
          <div class="card-code">oklch(from var(--seed) calc(l * 0.45) c h)</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-shade-mid">Mid Shade</div>
        <div class="card-body">
          <div class="card-title">Mid Shade (L × 0.75)</div>
          <div class="card-desc">Interactive hover or active state tone.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-shade-mid">Shade</div>
          </div>
          <div class="card-code">oklch(from var(--seed) calc(l * 0.75) c h)</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-tint-mid">Mid Tint</div>
        <div class="card-body">
          <div class="card-title">Clamped Mid Tint (+0.22 L)</div>
          <div class="card-desc">Perceptual lightness increase safely bounded by clamp().</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-tint-mid">Tint</div>
          </div>
          <div class="card-code">oklch(from var(--seed) clamp(0, calc(l + 0.22), 0.98) c h)</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-tint-soft">Soft Tint</div>
        <div class="card-body">
          <div class="card-title">OKLAB Surface Mix (18% Seed)</div>
          <div class="card-desc">Opaque surface tint interpolated in OKLAB against pure white.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-tint-soft">Tint</div>
          </div>
          <div class="card-code">color-mix(in oklab, var(--seed) 18%, #ffffff)</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-muted">Muted Token</div>
        <div class="card-body">
          <div class="card-title">Chroma Scale (C × 0.35)</div>
          <div class="card-desc">Attenuates chroma while maintaining exact lightness and hue.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-muted">Muted</div>
          </div>
          <div class="card-code">oklch(from var(--seed) l calc(c * 0.35) h)</div>
        </div>
      </div>

      <div class="card">
        <div class="swatch swatch-scrim">Overlay Scrim</div>
        <div class="card-body">
          <div class="card-title">Translucent Scrim (30% Alpha)</div>
          <div class="card-desc">Semi-transparent overlay reveal for modal backdrops.</div>
          <div class="pair-bar">
            <div class="pair-base">Base</div>
            <div class="pair-target swatch-scrim">Scrim</div>
          </div>
          <div class="card-code">color-mix(in oklab, var(--seed) 30%, transparent)</div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
```