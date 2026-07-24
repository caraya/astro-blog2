---
title: "Building an Interactive Sandpack Playground"
date: 2026-08-17
---

Creating fully interactive, browser-based coding playgrounds is a common requirement for technical blogs, documentation, and tutorials. [Sandpack](https://sandpack.codesandbox.io/) is a popular solution for embedding live code editors and previews directly in the browser.

This post details how to build a fully interactive, browser-based coding environment using Sandpack, and how to seamlessly integrate it into an Astro project.

## Problem Statement and Assumptions

Sandpack relies heavily on browser-specific APIs and ships a significant payload (often 2MB+ including CodeSandbox logic, Prettier, and Babel), it serves as an excellent stress test for Islands Architecture. The goal in both frameworks is to prevent server-side rendering crashes and defer loading until the component is visible.

Island architecture is a design pattern that allows developers to ship static HTML first and hydrate interactive components only when they are needed. This approach improves performance, reduces initial load times, and enhances the user experience.

### Assumptions

This post makes three assumptions:

You've initialized a new Astro project with the following command

```bash
npm create astro@latest
```

You've added the react integration to the Astro project:

```bash
npx astro add react
```

You've installed the required CodeSandbox and Prettier dependencies:

```bash
npm install @codesandbox/sandpack-react prettier
```

With these packages installed, we can build a custom reusable Sandpack component.

## The React Component: What it Does

The CustomSandpack component provides an IDE-like experience embedded directly in the browser. It allows users to write code, see a live UI preview, and monitor a dedicated developer console for output logs.

It includes several quality-of-life enhancements:

* **Auto-formatting**: A button and a keyboard shortcut (Cmd/Ctrl + S) that formats the code using Prettier entirely in the browser.
* **Reset Button**: A Reset button to revert all files back to their initial state.
* **Theme Toggle**: A toggle to switch the playground between light and dark modes dynamically.

## How it Works Under the Hood

* **Sandpack Core**: `SandpackProvider` wraps the environment, managing the state of the files and the bundler configuration.
* **Standalone Console**: Using `<SandpackConsole standalone/>` creates a permanent, dedicated box for console output, mimicking standard browser DevTools rather than overlaying it on the preview.
* **Event Capturing for Shortcuts**: To prevent the underlying CodeMirror editor from swallowing the Cmd+S keyboard shortcut, the event listener uses `{ capture: true }`. This intercepts the keystroke during the downward DOM capture phase, guaranteeing the Prettier formatter runs before the editor can block it.
* **Stale Closures and useRef**: When users type, the code string updates rapidly. If code was placed directly inside the keyboard event listener's dependency array, the listener would tear down and re-bind on every single keystroke, causing severe performance lag. Storing the code in a `useRef` ensures the event listener never has to re-bind while maintaining access to the most recent version of the code.

## The Source Code (CustomSandpack.tsx)

This is the custom Sandpack implementation TSX wrapper.

{% raw %}
```tsx
import React, {
  useEffect,
  useRef,
  useCallback,
  useState
} from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
  useActiveCode,
} from '@codesandbox/sandpack-react';
import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';

// Exported as a type to easily import into your Astro wrapper
export type CustomSandpackProps = {
  files: Record<string, string>;
  template?: 'react-ts' | 'react' | 'vanilla-ts' | 'css' | 'html';
};

const FormatButton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { code, updateCode } = useActiveCode();
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleFormat = useCallback(async () => {
    try {
      const formatted = await prettier.format(codeRef.current, {
        parser: 'babel',
        plugins: [babelPlugin, estreePlugin],
        singleQuote: true,
        trailingComma: 'es5',
      });
      updateCode(formatted);
    } catch (error) {
      console.error('Formatting error:', error);
    }
  }, [updateCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleFormat();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleFormat]);

  return (
    <button
      onClick={handleFormat}
      style={{
        padding: '6px 14px',
        backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0',
        color: isDark ? '#e3e3e3' : '#333',
        border: `1px solid ${isDark ? '#444' : '#ccc'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      Format Code
    </button>
  );
};

const ResetButton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { sandpack } = useSandpack();
  return (
    <button
      onClick={() => sandpack.resetAllFiles()}
      style={{
        padding: '6px 14px',
        backgroundColor: isDark ? '#4a1919' : '#ffcccc',
        color: isDark ? '#e3e3e3' : '#990000',
        border: `1px solid ${isDark ? '#732626' : '#ff9999'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      Reset
    </button>
  );
};

export const CustomSandpack: React.FC<CustomSandpackProps> = ({ files, template = 'react-ts', ...rest }) => {
  const [isDark, setIsDark] = useState(false);

  return (
    <SandpackProvider template={template} files={files} theme={isDark ? 'dark' : 'light'} {...rest}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          background: isDark ? 'linear-gradient(145deg, #1e1e1e, #121212)' : 'linear-gradient(145deg, #f5f5f5, #ffffff)',
          borderRadius: '12px',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              padding: '6px 14px',
              backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0',
              color: isDark ? '#e3e3e3' : '#333',
              border: `1px solid ${isDark ? '#444' : '#ccc'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <FormatButton isDark={isDark} />
          <ResetButton isDark={isDark} />
        </div>

        <SandpackLayout style={{ borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#ccc'}` }}>
          <SandpackCodeEditor showLineNumbers showTabs style={{ minHeight: '350px', flex: 1 }} />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            style={{ minHeight: '350px', flex: 1, borderLeft: `1px solid ${isDark ? '#333' : '#ccc'}` }}
          />
        </SandpackLayout>

        <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#333' : '#ccc'}` }}>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: isDark ? '#222' : '#e8e8e8',
              color: isDark ? '#888' : '#555',
              fontSize: '12px',
              borderBottom: `1px solid ${isDark ? '#333' : '#ccc'}`,
            }}
          >
            Console Output
          </div>
          <SandpackConsole standalone style={{ height: '200px' }} />
        </div>
      </div>
    </SandpackProvider>
  );
};
```
{% endraw %}

## Integration: The Astro Architecture

Astro is a compiler that natively understands .tsx files. When you apply the `client:only="react"` directive, Astro automatically wires up Vite, compiles the TypeScript, transpiles the JSX, and injects the React mounting logic.

Rather than forcing authors to append the `client:only` directive every time they embed a playground, we use a transparent wrapper component.

### The Transparent Wrapper

The Astro wrapper serves as an invisible bridge that automatically applies the hydration directive without duplicating maintenance work:

Single Source of Truth (SSOT): By importing CustomSandpackProps directly from the React component and assigning it to Astro's Props, the wrapper automatically inherits all type definitions. If the API changes in the React component, the Astro wrapper updates instantly.

Property Forwarding: Utilizing const props = Astro.props; and the spread operator ({...props}), the wrapper safely passes all incoming data down to the React layer without requiring manual destructuring of every attribute.

The Source Code (Sandpack.astro)

```tsx
import { CustomSandpack } from './CustomSandpack';
import type { CustomSandpackProps } from './CustomSandpack';

// Inherit the exact types directly from the React component
type Props = CustomSandpackProps;

// Capture all incoming attributes to forward to React
const props = Astro.props;

<CustomSandpack client:only="react" {...props} />
```

## Creating an Astro Integration

To take this a step further and create a reusable Astro integration, we can create an npm package.  This package allows developers to run `npx astro add astro-sandpack`, you can create and publish a specific npm package structure.

When a user runs that command, Astro automatically looks for a default export in your package's main file and injects it into their astro.config.mjs.

### Package Structure

Your integration repository will look like this:

```plaintext
astro-sandpack/
├── package.json
├── index.ts                  # The integration hook
└── components/
    ├── Sandpack.astro        # The transparent wrapper
    └── CustomSandpack.tsx    # The core React logic
```

### The package.json

This file is crucial. It tells npm what your package is, and it explicitly exports the components so they can be imported by the end user via import { Sandpack } from 'astro-sandpack/components'.

Notice the keywords array contains "astro-integration". This is how the Astro CLI discovers your package.

```json
{
  "name": "astro-sandpack",
  "version": "1.0.0",
  "description": "A plug-and-play Sandpack interactive coding environment for Astro.",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./components": "./components/Sandpack.astro"
  },
  "keywords": [
    "astro-integration",
    "astro-component",
    "sandpack",
    "react"
  ],
  "dependencies": {
    "@codesandbox/sandpack-react": "^2.0.0",
    "prettier": "^3.0.0"
  },
  "peerDependencies": {
    "astro": "^7.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### The Integration Hook (`index.ts`)

This is the code that runs when the user's `astro.config.mjs` is evaluated.

Because Sandpack relies on React, we can use the `astro:config:setup` hook to check if the user already has `@astrojs/react` installed and configured. If they don't, our integration can automatically inject it for them!

```ts
import type { AstroIntegration } from 'astro';
import react from '@astrojs/react';

export default function sandpackIntegration(): AstroIntegration {
  return {
    name: 'astro-sandpack',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        // Check if the user already has the React integration configured
        const hasReact = config.integrations.some(
          (integration) => integration.name === '@astrojs/react'
        );

        // If they don't have React, inject it automatically so Sandpack works out of the box
        if (!hasReact) {
          updateConfig({
            integrations: [react()],
          });
        }
      },
    },
  };
}
```

### The End-User Experience

Once you publish this to npm, the developer experience becomes magical.

#### Installation

The user simply runs:

```bash
npx astro add astro-sandpack
```

Astro will automatically install `@codesandbox/sandpack-react` and update their `astro.config.mjs` with the React integration if it's missing.

#### Usage in their project:
They can now drop interactive playgrounds anywhere in their site without writing a single line of React or worrying about hydration directives:

```markdown
---
// src/pages/index.astro
import { Sandpack } from 'astro-sandpack/components';

const myFiles = {
  "App.vue": "<template><h1>Hello from Astro Sandpack!</h1></template>"
};
---

<main>
  <h1>My Coding Blog</h1>
  <Sandpack files={myFiles} template="vue" />
</main>
```
