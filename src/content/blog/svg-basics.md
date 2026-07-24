---
title: SVG Basics
date: 2026-06-13
tags:
  - SVG
  - Web
  - Graphics
baseline: true
draft: true
---

Scalable Vector Graphics (SVG) is an XML-based markup language for describing two-dimensional vector graphics.

It's designed specifically to work well with other web standards including CSS, DOM, JavaScript, and SMIL. SVG is to graphics what HTML is to text.

Unlike raster images (PNG, WebP, AVIF, JPG) SVG images are smaller (since they are text) and can be resized to larger sizes without losing quality.

Because SVG images are defined in XML  files, they can be searched, indexed, scripted, and compressed. Additionally, this means they can be created and edited with any text editor or with drawing software.

This post will provide a brief introduction to what SVG is and what it can do. It will avoid going into details about the XML syntax and focus on the practical aspects of using SVG.

!!! note  Note
This post will cover things that are in the SVG 1.1 specification. The SVG 2 specification is still a work in progress and not all browsers support it yet.
!!!

## General concepts

Before we talk about the basic techniques for creating SVG content, we'll talk about some general concepts that are important to understand.

### Position

SVG uses a coordinate system to position elements on the canvas. The origin of the coordinate system is at the top-left corner of the canvas. The x-axis increases to the right and the y-axis increases downwards.

This is different than the standard graphics coordinate system so it's important to keep this in mind when creating SVG content.

#### Physical dimensions versus viewBox size

In an SVG document, the viewport is the visible area of the SVG image. You can set any height and width on an SVG, but the whole image might not be visible. The area that is visible is called the viewport. The size of the viewport can be defined using the width and height attributes of the `svg` element.

```xml
<svg width="800" height="600" viewBox="0 0 800 600">
  <!-- SVG content goes here -->
</svg>
```

In this example, the viewport has an aspect ratio of 4:3 and is, by default, 800 by 600 units, with a unit generally being a CSS pixel.

SVG also has an internal coordinate system defined via the `viewBox` attribute, which is not related to this viewport discussion.

The value of the `viewBox` attribute is a list of four numbers separated by whitespace and/or a comma:

* min-x
* min-y
* width
* height

min-x and min-y represent the smallest X and Y coordinates that the viewBox may have (the origin coordinates of the viewBox).

The width and height specify the viewBox size.

The resulting viewBox is a rectangle in user space mapped to the bounds of the viewport of an SVG element (not the browser viewport).

### Colors

CSS supports a variety of colors, but not the latest CSS Colors level 3  and 4 specs.

The list of supported colors:

* **Named Colors**: red, blue, darkorange
* **Hex**: #ff0000, #0f0
* **RGB / RGBA**: rgb(255, 0, 0) or rgba(255, 0, 0, 0.5)
* **HSL / HSLA**: hsl(0, 100%, 50%) or hsla(0, 100%, 50%, 0.5)

Sadly, OKLCH or LAB colors are not supported in SVG 1.1.

### Stroke and fill

There are two SVG properties that are used to define colors for an element: `fill` and `stroke`.

**fill** is the color used to fill the inside of a shape.

The **stroke** color is used on the outline the shape.

## Reusing content

SVG provides to ways to reuse content: `defs` and `symbol`.

### defs

The &lt;defs> element is used to define reusable graphical elements, such as gradients, patterns, symbols, filters, and more. These definitions are not rendered directly in the output, but they can be referenced and used by other SVG elements throughout the document.

You reference elements you defined in `defs` by their id using `url(#id)` or `<use xlink:href="#id">`

In this example, we define a gradient with an ID attribute.

```xml
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="myGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="red" />
      <stop offset="100%" stop-color="blue" />
    </linearGradient>
  </defs>
```

Whenever we need to use the element, we can reference by its ID (`#myGradient`).

```xml
  <rect width="200" height="200" fill="url(#myGradient)" />
</svg>
```

### Symbol

the `<symbol>` element is used to define reusable graphical objects. Once a symbol is defined, you can instantiate it anywhere in the document using the `<use>` element. This helps keep the SVG DRY (Don't Repeat Yourself) and efficient.

First we define the element we want to reuse in the `defs` section of the SVG document but use `symbol`.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="display: none;">
  <symbol id="icon-star" viewBox="0 0 24 24">
    <path d="..." />
  </symbol>
</svg>
```

#### Symbol Attributes

id
: A unique identifier used to reference the symbol.

viewBox
: Defines the position and dimension in user space. Important for scaling.

preserveAspectRatio (optional)
: Controls how the viewBox is scaled.

You cannot position or size the content inside the `<symbol>` directly &mdash; this is done when it’s used via `<use>`.

An example of using the `<use>` element to reference the symbol:

```xml
<svg width="24" height="24">
  <use href="#icon-star" />
</svg>
```

### Grouping items

The `<g>` element is used to group multiple SVG elements together. This allows you to apply transformations, styles, and attributes to the entire group as a single unit if you choose to do so.

```xml
<svg width="100" height="100" viewBox="0 0 100 100">
  <g fill="white" stroke="green" stroke-width="5">
    <circle cx="40" cy="40" r="25" />
    <circle cx="60" cy="60" r="25" />
  </g>
</svg>
```

## Drawing primitives

SVG provides a variety of drawing primitives for creating shapes and lines. Here are some of the most common ones:

### Rectangle

Draws a rectangle of the specified width and height with the top-left corner at the `x / y` coordinates.

```xml
<rect x="10" y="10" width="100" height="50" />
```

### Circle

Draws a circle with a radius `r` and center coordinates `cx` and `cy`.

You don't need `x` and `y` attributes; they are replaced by `cx` and `cy`.

```xml
<circle cx="60" cy="60" r="50" fill="red" />
```

### Ellipse

Draws an elipse centerd at `cx / cy` with a radius of `rx` and `ry`. For an elipse, these radii can be different.

You cannot specify the orientation of an ellipses (for example, if you wanted to draw an ellipse tilted at a 45 degree angle), but it can be rotated by using the transform attribute.

```xml
<ellipse cx="100" cy="50" rx="80" ry="30" fill="green" />
```

### Line

Draws a line connecting two points, starting at `x1 / y1` and ending at `x2 / y2`.

If you don't specify a `stroke` attribute, the line will not be visible.

```xml
<line x1="0" y1="0" x2="200" y2="200" stroke="black" stroke-width="2" />
```

### Polygon

Draws a polygon with a series of points. The polygon is closed by default.

Each point is defined by a pair of number representing a X and a Y coordinate in the user coordinate system. If the attribute contains an odd number of coordinates, the last one will be ignored.

```xml
<polygon points="100,10 40,198 190,78 10,78 160,198" fill="orange" />
```

### Polyline

Draws a polygon with a series of points that **is not** closed by default

```xml
<polyline points="0,0 50,50 100,0" stroke="purple" fill="none" stroke-width="2" />
```

### Text

Will render the text contained inside the element. The text is rendered in the font specified in `font-family` and at the size indicated in `font-size`.

```xml
<text
  x="10"
  y="50"
  font-family="Arial"
  font-size="24"
  fill="black">Hello SVG</text>
```

## Paths and Curves

The `path` element allows you to draw arbitrary shapes and curves. This is allows you to create more complex shapes with standard elements.

### Basic Path Syntax

The path syntax uses the `d` attribute. It contains a series of commands that define the shape.

!!! note **Note:**
Path commands are case sensitive and mean different things
!!!

1. MoveTo
     * `M x,y`: Moves to the absolute coordinates (x, y)
     * `m x,y`: Moves to coordinates relative to the current point.
2. LineTo
      * `L x,y`: Draws a line to the absolute coordinates (x, y)
      * `l x,y`: Draws a line to coordinates relative to the current point
      * `H x`: Draws a horizontal line to the absolute x coordinate
      * `h x`: Draws a horizontal line to the relative x coordinate
      * `V y`: Draws a vertical line to the absolute y coordinate
      * `v y`: Draws a vertical line to the relative y coordinate
3. ClosePath:
      * `Z`: Closes the path by drawing a line from the current point to the starting point of the current subpath
      * `z`: Closes the path by drawing a line from the current point to the starting point of the current subpath.

```xml
<path
  d="M10 10 H 90 V 90 H 10 Z"
  stroke="black"
  fill="transparent" />
```

Path is not always intuitive to use. I keep Chris Coyier's [SVG Path Syntax Illustrated Guide](https://css-tricks.com/svg-path-syntax-illustrated-guide/)  open when I need to use paths.

### Curves in Paths

In addition to basic path commands, you can also use curves to create the shapes.

The curves defined in the SVG 1.1 specification are:

1. Cubic Bézier curve
   * `C x1,y1 x2,y2 x,y`: Draws a cubic Bézier curve to the absolute coordinates (x, y), using (x1, y1) and (x2, y2) as control points
   * `c x1,y1 x2,y2 x,y`: Draws a cubic Bézier curve to coordinates relative to the current point
   * `S x2,y2 x,y`: Draws a smooth cubic Bézier curve to the absolute coordinates (x, y)
   * `s x2,y2 x,y`: Draws a smooth cubic Bézier curve to coordinates relative to the current point
2. Quadratic Bézier curve:
   * `Q x1,y1 x,y`: Draws a quadratic Bézier curve to the absolute coordinates (x, y), using (x1, y1) as a control point
   * `q x1,y1 x,y`: Draws a quadratic Bézier curve to coordinates relative to the current point
   * `T x,y`: Draws a smooth quadratic Bézier curve to the absolute coordinates (x, y)
   * `t x,y`: Draws a smooth quadratic Bézier curve to coordinates relative to the current point
3. Elliptical arc curve:
   * `A rx,ry x-axis-rotation large-arc-flag sweep-flag x,y`: Draws an elliptical arc to the absolute coordinates (x, y)
   * `a rx,ry x-axis-rotation large-arc-flag sweep-flag x,y`: Draws an elliptical arc to coordinates relative to the current point

With a combination of path commands and curves, you can create complex shapes to match the needs of your project. Something beyond what you can do with CSS alone. Canvas may come close to the same functionality but their use cases are different.

## SMIL Animations

<baseline-status featureid="smil-svg-animations"></baseline-status>

SVG has a built-in animation system using the [Synchronized Multimedia Integration Language (SMIL)](https://www.w3.org/TR/SMIL3/). While you can also animate SVG graphics with the [Web Animations API (WAAPI)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), SMIL is baked into the SVG specification.

The following table shows the differences between SMIL and the WAAPI:

| Feature / Concern | SMIL (SVG Animation Elements) | Web Animations API (WAAPI) |
| --- | --- | --- |
| Native to SVG | ✅ Yes – part of the SVG spec | ❌ No – applies JS animation to SVG DOM elements |
| Declarative | ✅ Yes – uses `<animate>`, `<animateTransform>` tags | ❌ No – imperative, requires JavaScript |
| JS-Free Use | ✅ Works without JS | ❌ Needs JS to run |
| Chaining Animations | ✅ Built-in via begin="otherAnim.end" | ✅ Via onfinish or async/await in JS |
| Targeting Attributes | ✅ Animate SVG-specific attributes (like cx, r, d) | ⚠️ Partial – can animate styles and some presentation attributes, but not all SVG-specific ones like d for `<path>` |
| Timing Functions | ✅ Uses dur, repeatCount, begin, etc. | ✅ Uses easing, duration, delay, etc. |
| Runtime Control | ❌ Limited – static once defined | ✅ Full control – pause, reverse, scrub, remove dynamically |
| Reusability | ⚠️ Limited to copy-pasting | ✅ Functions or shared keyframes |
| Browser Support | ✅ Widely supported (Chrome, Firefox, Safari) | ✅ Widely supported (Evergreen browsers since ~2018) |
| Debugging | ❌ Harder – no dev tools or inspection | ✅ DevTools integration (Chrome, Firefox) |
| Spec Status | ❌ Deprecated (still widely implemented) | ✅ Actively developed standard |

### **Example**: Animating a Circle

```xml
<circle
	cx="50"
	cy="50"
	r="30"
	fill="blue">
  <animate
		attributeName="cx"
		from="50"
		to="150"
		dur="2s"
		repeatCount="indefinite" />
</circle>
```

SMIL syntax Breakdown:

`<animate>`
: The animation tag.

`attributeName`
: The attribute to animate (cx in this case).

`from / to`
: Start and end values.

`dur`
: Duration (2s = 2 seconds).

`repeatCount`
: Repeats forever with "indefinite".

### **Example**: Animate Color

```xml
<rect x="10" y="10" width="100" height="100" fill="red">
  <animate
		attributeName="fill"
		values="red;blue;red"
		dur="3s"
		repeatCount="indefinite" />
</rect>
```

In the `<animate>` element, the `values` attribute specifies a semicolon-separated list of values to animate between.

### **Example**: Animate Rotation with `animateTransform`

```xml
<rect x="70" y="20" width="60" height="60" fill="green">
  <animateTransform attributeName="transform"
    type="rotate"
    from="0 100 100"
    to="360 100 100"
    dur="4s"
    repeatCount="indefinite"/>
</rect>
```

The `animateTransform` SVG element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing.

`attributeName="transform"`
: The attribute to animate (transform in this case).

`type="rotate"`
: Defines the type of transformation, whose values change over time.

`from="0 100 100"`
: Initial value of the attribute that will be modified during the animation.

`to="360 100 100"`
: Final value of the attribute that will be modified during the animation.

You can also chain multiple animations using the `begin` and `end` attributes to control the sequence of animations.

```xml
<svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
  <!-- Circle 1 -->
  <circle cx="30" cy="50" r="10" fill="red">
    <animate
      attributeName="cx"
      from="30"
      to="100"
      dur="1s"
      fill="freeze"
      id="anim1"
    />
  </circle>

  <!-- Circle 2 -->
  <circle cx="30" cy="50" r="10" fill="green">
    <animate
      attributeName="cx"
      from="30"
      to="100"
      dur="1s"
      fill="freeze"
      begin="anim1.end"
      id="anim2"
    />
  </circle>

  <!-- Circle 3 -->
  <circle cx="30" cy="50" r="10" fill="blue">
    <animate
      attributeName="cx"
      from="30"
      to="100"
      dur="1s"
      fill="freeze"
      begin="anim2.end"
    />
  </circle>
</svg>
```

You can do a lot more with animations. A good tutorial is [A Guide to SVG Animations (SMIL)](https://css-tricks.com/guide-svg-animations-smil/) by Sara Soueidan

## Filters

In SVG, each filter element contains one or more filter primitives as its children. Each primitive performs a graphical operation on one or more inputs, producing a result that can be used as an input for subsequent elements on the chain. They all share the same prefix: **fe**, which is short for "filter effect" and use a name that references its purpose (for example `feGausianBlur` for the primitive that creates a Gaussian blur).

Filter primitives take a source graphic as input and outputting another one as the result. You chain the output of one effect as the input of another one; this flexibility gives you an almost endless combination of filter primitives producing an endless number of effects

Each primitive can take one or two inputs and output only one result. The inputs of a filter primitive are defined in attributes called `in` and `in2`. The result of an operation is defined in the `result` attribute. If you don’t specify the result of a primitive, its result will automatically be used as input to the primitive that follows.

A filter primitive also accepts other types of inputs, the most important of which are:

* **SourceGraphic**: the actual element that we're applying the filter to, for example, an image or a piece of text
* **SourceAlpha**: the alpha channel for the element

```xml
<svg width="600" height="400" viewBox="0 0 600 400">
  <filter id="myFilter">

    <feFlood flood-color="navy" flood-opacity=".15" result="flood"></feFlood>

    <feMerge>
      <feMergeNode in="flood" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>

  </filter>
  <image xlink:href="https://s3-us-west-2.amazonaws.com/s.cdpn.io/32795/octotron.jpg"
    width="100%"
		height="100%"
		x="0"
		y="0"
    filter="url(#myFilter)"></image>
</svg>
```

There are [17 filter primitives](https://www.w3.org/TR/filter-effects-1/#FilterPrimitivesOverview) available in the Filter Effects Module Level 1 specification.

## Accessing and Manipulating SVG with JavaScript

Because SVG is XML, you can manipulate it using DOM APIs. This means you can use JavaScript to create, modify, and remove SVG elements in the same way you would with HTML elements.

This may help when you need dynamic SVG content or when you want to add interactivity to your SVG graphics.

### Create SVG Elements

Creating SVG elements use [createElementNS](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS) instead of `createElement`. This is because SVG elements are in a different namespace than HTML elements.

Since we're creating multiple elements, we set the SVG namespace in a constant and use it to create the elements.

```ts
  // Create the SVG namespace
  const svgNS = "http://www.w3.org/2000/svg"

  // Create the main SVG element
  const svg = document.createElementNS(svgNS, "svg")

  const circle = document.createElementNS(svgNS, "circle")
```

This creates a single element. We will look at a way to create a function to generate elements.

### Get SVG Elements

Getting a reference to an SVG element is the same as getting a reference to an HTML element. You can use [getElementById](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById), [getElementByTagName](https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName), [querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) or [querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll).

```ts
const svg = document.getElementById('mySVG') as SVGSVGElement
const circle = document.querySelector('#myCircle') as SVGCircleElement
```

### Adding, Modifying and Removing Attributes

The [setAttribute()](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute) method of the Element interface sets the value of an attribute on the specified element. If the attribute already exists, the value is updated; otherwise a new attribute is added with the specified name and value.

```ts
const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')

// Set attributes using setAttribute
circle.setAttribute('cx', '100')
circle.setAttribute('cy', '100')
circle.setAttribute('r', '50')
circle.setAttribute('fill', 'skyblue')
circle.setAttribute('stroke', 'black')
circle.setAttribute('stroke-width', '2')
```

[getAttribute()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute) returns the value of the specified attribute on the element. If the attribute does not exist, it returns null.

```html
<!-- example div in an HTML DOC -->
<div id="div1">Hi Champ!</div>
```

```ts
const exampleAttr = div1.getAttribute("id");
```

To remove an attribute, call removeAttribute(). This is recommended over setting the attribute value to null, which may cause unexpected results.

Given this HTML fragment:

```html
<div id="div1" disabled width="200px"></div>
```

We can remove the `disabled` attribute byy running `removeAttribute("disabled")` on the element.

```ts
document.getElementById("div1").removeAttribute("disabled");
```

The HTML now looks like this:

```html
<div id="div1" width="200px"></div>
```


### Creating SVG Elements Dynamically

Rather than create the SVG elements manually, we can create a function that automates the process. This is useful if you need to create multiple elements with the same attributes.

```ts
function createCircle(cx: number, cy: number, r: number, color: string): SVGCircleElement {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', cx.toString())
  circle.setAttribute('cy', cy.toString())
  circle.setAttribute('r', r.toString())
  circle.setAttribute('fill', color)
  return circle
}

const newCircle = createCircle(150, 100, 40, 'green')
```

### Adding Event Listeners

You can add [event listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) to SVG elements in the same way you would with HTML elements.

This allows you to add user-initiated interactivity to your SVG graphics.

```ts
circle.addEventListener('click', () => {
  alert('Circle clicked!')
})
```

### Example JS Animation

ANother use for Javascript when working with SVG and Javascript is add interactivity to SVG elements

```ts
// Get SVG and circle elements with type assertions
const svg = document.querySelector('svg') as SVGSVGElement | null
const circle = document.querySelector('circle') as SVGCircleElement | null

if (!svg || !circle) {
  console.error('SVG or circle element not found in the DOM.')
} else {
  svg.addEventListener('mousemove', (event: MouseEvent) => {
    const rect = svg.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    circle.setAttribute('cx', x.toString())
    circle.setAttribute('cy', y.toString())
  })
}
```

### Use third party tools for Complex SVG Manipulations

If you're building data visualizations, D3.js makes SVG scripting much more powerful.

Rather than creating SVG and adding attributes and interactivy by hand, you can use D3.js to hide SVG complexity and make it easier to create visualizations.

```ts
import * as d3 from 'd3'

export function renderBarChart(containerId: string, data: number[]): void {
  const width = 500
  const height = 300
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const x = d3.scaleBand()
    .domain(data.map((_, i) => i.toString()))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data) ?? 0])
    .nice()
    .range([height - margin.bottom, margin.top])

  svg.append('g')
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (_, i) => x(i.toString())!)
    .attr('y', d => y(d))
    .attr('height', d => y(0) - y(d))
    .attr('width', x.bandwidth())
    .attr('fill', 'steelblue')

  // X Axis
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => `#${i}`))

  // Y Axis
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
}
```

## Clipping and Masking in SVG

SVG gives you two ways to control visibility of parts of shapes:

| Technique | What it does |
| --- | --- |
| clipPath | Shows only the parts of an element that fall inside a shape |
| mask | Uses transparency/opacity to control what is visible |

### Clipping with &lt;clipPath>

You define a shape (circle, rect, path, etc.) and apply it to another element — only the area inside that shape is rendered.

**Example**: Clipping an Image to a Circle

```xml
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="circleClip">
      <circle cx="100" cy="100" r="80" />
    </clipPath>
  </defs>

  <image href="https://via.placeholder.com/200" width="200" height="200" clip-path="url(#circleClip)" />
</svg>
```

Syntax Explanation

`<defs>`
: Contains reusable definitions.

`<clipPath>`
: The clipping region.

`clip-path="url(#id)"`: Apply the clip path.

**Example**: Clip Complex Shape with Path

```xml
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="starClip">
      <polygon
				points="150,
				25 179,
				111 269,
				111 197,
				165 223,
				251 150,
				200 77,
				251 103,
				165 31,
				111 121,
				111" />
    </clipPath>
  </defs>

  <rect
		width="300"
		height="200"
		fill="gold"
		clip-path="url(#starClip)" />
</svg>
```

### Masking with &lt;mask>

Masks use grayscale or alpha to define visibility. White = fully visible, black = fully transparent.

**Example**: Basic Mask Gradient

```xml
<svg
	width="300"
	height="200"
	xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="fadeMask">
      <linearGradient id="fadeGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0">
        <stop offset="0" stop-color="white" />
        <stop offset="1" stop-color="black" />
      </linearGradient>
      <rect width="300" height="200" fill="url(#fadeGradient)" />
    </mask>
  </defs>

  <rect
		width="300"
		height="200"
		fill="blue"
		mask="url(#fadeMask)" />
</svg>
```

`mask`: Used like clip-path, but allows gradients and opacity.

Mask content can include any SVG — not just shapes, but gradients, images, etc.

**Example**: Masking an Image with a Circle

```xml
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="circleMask">
      <rect width="200" height="200" fill="black" />
      <circle cx="100" cy="100" r="80" fill="white" />
    </mask>
  </defs>

  <image
	href="https://via.placeholder.com/200"
	width="200"
	height="200"
	mask="url(#circleMask)" />
</svg>
```

The white circle in the mask makes that part of the image visible.

The black background hides everything else.

### JavaScript Example: Apply Clip via Script

Assuming that the `clip-path` is already defined in the SVG, you can apply it to a dynamically generated SVG element using Javascript.

```ts
const svg = document.getElementById('mySVG') as SVGSVGElement
const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
image.setAttribute('href', 'https://via.placeholder.com/200')
image.setAttribute('width', '200')
image.setAttribute('height', '200')
image.setAttribute('clip-path', 'url(#circleClip)')
svg.appendChild(image)
```

## Links and Resources

* Specifications
  * [SVG](https://developer.mozilla.org/en-US/docs/en-US/docs/Web/SVG) &mdash; MDN
  * [SVG Specification](https://www.w3.org/TR/SVG11/)
  * [SVG Animation Specification](https://www.w3.org/TR/SVG/animate.html)
  * [SMIL Specification](https://www.w3.org/TR/REC-smil/)
  * [SVG Filters](https://www.w3.org/TR/filter-effects-1/)
* Animations
  * <https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL>
  * <https://css-tricks.com/animating-svg-css/>
* Third party libraries
  * [svg.js](https://svgjs.dev/docs/3.2/)
* [CSS viewport units used on an SVG are relative to the SVG instead of the viewport](https://geoffgraham.me/css-viewport-units-used-on-an-svg-are-relative-to-the-svg-instead-of-the-viewport/)
* [Viewport concepts](https://developer.mozilla.org/en-US/docs/Web/CSS/Viewport_concepts)
* [viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox)
* [Mastering SVG Arcs](https://www.smashingmagazine.com/2024/12/mastering-svg-arcs/)
* [SVG Coding Examples: Useful Recipes For Writing Vectors By Hand](https://www.smashingmagazine.com/2024/09/svg-coding-examples-recipes-writing-vectors-by-hand/)
* [paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) &mdash; MDN
* [A Practical Guide To SVG And Design Tools](https://www.smashingmagazine.com/2019/05/svg-design-tools-practical-guide/)
