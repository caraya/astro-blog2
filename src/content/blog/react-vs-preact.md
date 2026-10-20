---
title: "React vs. Preact: differences, interchangeability, and migration"
date: 2026-11-23
tags:
  - react
  - preact
  - javascript
  - web-development
mermaid: true
---

React and Preact are both popular, component-based JavaScript libraries used to build user interfaces. While they share a similar API and philosophy, their underlying architectures and target use cases differ significantly. With the releases of [React 19](https://react.dev/blog/2024/12/05/react-19) and [Preact 11](https://preactjs.com/blog/preact-11/), both libraries have modernized their cores, dropped legacy features, and surprisingly aligned on several API choices.

This guide outlines these differences, explains their interchangeability, and provides a step-by-step migration path from React to Preact.

## Key differences

While Preact aims to provide a React-like developer experience, it is not a direct clone. It is a completely separate implementation optimized for size and speed.

### Bundle size and performance

* **React 19:** The React team reduced bundle bloat in v19 by dropping legacy features (like Legacy Context, UMD builds, and module pattern factories). Despite these trims, `react` and `react-dom` combined still weigh around 35-40 KB (minified and gzipped). It includes a robust set of features and Server Components.
* **Preact 11:** Preact remains ultra-lightweight, weighing in at around 3-4 KB (minified and gzipped). Version 11 modernized its distribution by shipping exclusively as ES modules (`.mjs`) and dropping Internet Explorer 11 support entirely. It achieves its size by stripping out non-essential features, making it ideal for performance-critical applications.

### Reactivity and optimization

* **React Compiler:** Its public beta shipped in October 2024, and version 1.0 became stable in October 2025. The compiler is a build-time tool integrated into the app's build pipeline, not a feature bundled with `react` or `react-dom`, although some framework templates enable it by default. It automatically memoizes components and hooks, reducing the need for manual memoization with `useMemo` and `useCallback`. It supports React 17, 18, and 19; React 17 and 18 require a matching compiler target and the `react-compiler-runtime` package.

* **Preact 11:** Does not use a compiler for component memoization. Instead, the Preact ecosystem uses **Preact Signals** for fine-grained reactivity. Passing a signal directly into a JSX text position or DOM prop can update the DOM without re-rendering the component; reading `signal.value` during render subscribes the component and re-renders it when the value changes.

### Rendering and server integration

* **React 19:** Supports Server Components (RSC) and Server Actions, but applications generally need a compatible framework or build-tool integration to use them. These features can enable server-rendered content and server-side form mutations; any SEO or load-time benefits depend on the application's architecture and implementation.

* **Preact 11:** Uses a simpler Virtual DOM diffing algorithm. However, v11 introduces **Hydration 2.0**, allowing components that suspend during hydration to return zero or multiple DOM nodes, better supporting modern async rendering patterns. Portals are also now available directly in the core without needing the compatibility layer.

### API alignments (the "ref" revolution)

One of the biggest pain points for developers used to be handling `ref`. Historically, `ref` was treated as a special keyword by React (and thus by Preact). If you wanted to pass a `ref` down to a child component, you couldn't just pass it as a prop; you had to wrap the child component in the cumbersome `forwardRef` higher-order component.

**React 19 and Preact 11 let function components receive `ref` as a prop, so new components no longer need `forwardRef`. React has deprecated `forwardRef`, but it remains supported for now.**

In both libraries, function components can receive `ref` as a prop. This simplifies component creation and reduces boilerplate, though other differences between the libraries can still require compatibility wrappers.

Here is a comparison of how this cleans up your code:

**The Old Way (React 18 / Preact 10):**

```javascript
import { forwardRef } from 'react'; // Or 'preact/compat'

// You had to wrap the entire function and accept ref as a second argument
const CustomInput = forwardRef(function CustomInput(props, ref) {
  return (
    <div className="input-wrapper">
      <label>{props.label}</label>
      <input ref={ref} placeholder={props.placeholder} />
    </div>
  );
});
```

**The New Way (React 19 / Preact 11):**

```javascript
// No imports needed!
// 'ref' is simply destructured from the props object just like 'label' or 'placeholder'
export default function CustomInput({ ref, label, placeholder }) {
  return (
    <div className="input-wrapper">
      <label>{label}</label>
      <input ref={ref} placeholder={placeholder} />
    </div>
  );
}
```

Furthermore, Preact 11 aligned with React 19 by requiring an initial value for `useRef` (e.g., `useRef(null)` instead of just `useRef()`). This TypeScript signature change improves type inference and avoids some typing issues.

## Interchangeability and the React ecosystem

Preact and React are highly interchangeable, but not perfectly identical out of the box. Because Preact drops features like Synthetic Events and strict `PropTypes` to save space, directly using React libraries in a vanilla Preact project will often cause errors.

To solve this, the Preact team maintains **`preact/compat`**.

### What is `preact/compat`?

`preact/compat` is a compatibility layer that translates React API calls into Preact API calls. By aliasing `react` and `react-dom` to `preact/compat` in your build tool, you trick third-party React libraries into using Preact under the hood.

**Updates in Preact 11:** `preact/compat` has been updated to support new React 19 APIs, including the `use()` hook for reading Promises and Context, and `useEffectEvent()`. To keep the core small, Preact 11 also moved legacy features like automatic `px` suffixing and `defaultProps` directly into `preact/compat`.

### Performance impact of `preact/compat`

While `preact/compat` provides excellent interoperability, it does increase your bundle size. The compatibility layer adds approximately 2 KB, meaning **a Preact project utilizing the React ecosystem will have a baseline framework size of roughly 5-6 KB** (minified and gzipped).

Even with `preact/compat`, that estimated 5-6 KB framework bundle is smaller than React 19's estimated 35-40 KB for `react` and `react-dom` combined (both minified and gzipped).

`preact/compat` adds runtime work to emulate some React APIs, and its impact depends on which APIs an app uses. Under comparable build, network, and device conditions, a smaller framework bundle means less JavaScript to download and parse, which can improve startup time. Bundle size alone does not guarantee faster rendering or interactions, which also depend on runtime work and the application workload.

### Can you use the React ecosystem?

**Yes.** When utilizing `preact/compat` (and accepting the minor size increase), you can use the vast majority of the React ecosystem within a Preact project. This includes state management, routing, and UI libraries (like Material-UI or Tailwind UI).

**Limitations:** Libraries relying heavily on React 19's deeper compiler optimizations, experimental Server Component APIs, or deep internals might exhibit unexpected behaviors. Because `preact/compat` cannot achieve 100% parity without becoming as large as React itself, you may occasionally encounter edge cases with highly complex UI libraries (like certain components within Radix UI).

## Why Preact can be a good fit for progressive web apps (PWAs)

Preact may suit PWAs where reducing client-side JavaScript is a priority. Its smaller runtime can help reduce the JavaScript an app needs to download and execute, but the effect on performance depends on the app, build output, network, and device.

1. **Potentially faster startup:** A smaller framework bundle may reduce download and parse time, which can improve Time to Interactive (TTI). The actual effect depends on the size of the rest of the app and the user's network and device.

2. **Potentially less framework overhead:** Preact uses native browser events and a Virtual DOM. These choices may reduce framework work in some apps, but total CPU and battery use depends on the app's workload and the device; choosing Preact alone does not prevent battery drain.

3. **Tree-shaking support:** Preact 11's ES module distribution can help bundlers remove unused code. The amount removed depends on the app's imports and build configuration.

### Considerations for extreme constraints

Even a small framework bundle may be too large for strictly constrained environments, and bundle size alone does not determine whether an app will perform well.

For applications targeting extremely low-end mobile devices, emerging markets, or scenarios where unreliable 2G/3G networks are the primary bottleneck, downloading, parsing, and executing *any* JavaScript framework can cause unacceptable delays. In these extreme situations, relying on a client-side Virtual DOM—even a tiny one like Preact—might not be the right choice. Developers facing strict network limits may need to opt for zero-JS architectures (like Astro or pure Server-Side Rendering) or use Vanilla HTML and JavaScript to achieve acceptable performance.

## How to migrate from React to Preact

Migrating an existing React application to Preact is usually straightforward, thanks to `preact/compat`.

### Install Preact and remove React

First, add Preact to your dependencies and remove React.

```bash
npm install preact
npm uninstall react react-dom
```

### Configure build tool aliasing

If your bundler does not provide Preact aliases automatically, configure `react` and `react-dom` imports to resolve to `preact/compat`. For example, the `@preact/preset-vite` plugin configures these aliases for Vite, so you do not need to add them manually.

#### Vite configuration (JavaScript or TypeScript)

Install the Vite preset before using this configuration:

```bash
npm install -D @preact/preset-vite
```

```javascript
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
});
```

### Configure TypeScript (if applicable)

Preact 11 requires TypeScript 5.1 or newer. Instruct the compiler to use Preact's types to prevent errors. Furthermore, Preact 11 significantly reduced the size of its global `JSX` namespace to improve editor auto-imports.

**`tsconfig.json`:**

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "baseUrl": "./",
    "paths": {
      "react": ["./node_modules/preact/compat/"],
      "react/jsx-runtime": ["./node_modules/preact/jsx-runtime"],
      "react-dom": ["./node_modules/preact/compat/"],
      "react-dom/*": ["./node_modules/preact/compat/*"]
    }
  }
}
```

### Component examples

Once the alias is set up, your existing React components will continue to work without modification. However, if you are writing new components natively for Preact, notice the slight import differences for hooks.

**Preact Native Implementation (TypeScript):**

```tsx
import type { VNode } from 'preact';
import { useState } from 'preact/hooks';

export default function Counter(): VNode {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <p>Count: {count}</p>
      {/* Notice the use of native standard events */}
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Conclusion

Preact 11 continues to provide an excellent pathway for developers who love the React ecosystem but require the smallest possible footprint. With both libraries maturing and aligning on features like standard `ref` props, migrating via `preact/compat` is smoother than ever. However, it is vital to carefully evaluate your target audience's device and network constraints before choosing between a lightweight Virtual DOM library and a zero-JS approach.
