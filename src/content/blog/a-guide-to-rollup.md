---
title: "A guide to Rollup.js"
date: 2026-10-02
tags:
  - rollup
  - javascript
  - bundler
---

Rollup is a JavaScript module bundler. It follows imports from an entry module, combines the code into one or more output files, and can remove unused exports from statically analyzable ES modules. Rollup can generate browser-ready bundles and packages in multiple module formats.

Build time and bundle size depend on the project, plugins, and output options. A [2026 bundler comparison](https://strapi.io/blog/modern-javascript-bundlers-comparison-2025) reports workload-specific results and recommends testing tools against your own codebase.

This tutorial will cover:

* Project setup and basic configuration
* Using plugins for common tasks
* Creating separate development and production builds
* Handling CSS and image assets
* Using Rollup with TypeScript
* Code splitting with dynamic imports
* Understanding output formats: `iife` versus `es`

## Project setup and basic configuration

Let's start by setting up a simple project.

### Initialize the project

First, create a new directory for your project and initialize it with npm.

```bash
mkdir rollup-project
cd rollup-project
npm init -y
```

### Install Rollup

Install Rollup as a development dependency.

```bash
npm install --save-dev rollup
```

### Create source files

Create a src directory with a simple main.js file and a helper module to demonstrate bundling.

```js
// src/logger.js

// A simple utility function
export const logMessage = (message) => {
  console.log(`[INFO] ${message}`);
};
```

```js
// src/main.js

import { logMessage } from './logger.js';

const heading = document.createElement('h1');
heading.textContent = 'Hello, Rollup!';
document.body.appendChild(heading);

logMessage('Application has started.');
```

### Create a basic Rollup configuration

Create a file named `rollup.config.mjs` in your project's root directory. This file will tell Rollup how to bundle your code.

The `.mjs` extension addresses how Node.js loads the configuration file. A configuration that uses `import` and `export` must be an ES module, while a `.js` file in a project created with `npm init -y` is treated as CommonJS by default. This does not affect Rollup input files. Running Rollup with command-line options and no configuration file, for example `rollup src/main.js --file dist/bundle.js --format iife`, does not load a config through Node.js.

```js
// rollup.config.mjs

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife' // Immediately Invoked Function Expression - suitable for browsers
  }
};
```

* **input**: The entry point of your application.
* **output.file**: The path where the bundled file will be saved.
* **output.format**: The format of the output bundle. iife is a good choice for a script that will be run in a browser.

### Add a build script

In your package.json, add a script to run Rollup with your configuration file.

package.json:

```json
{
  ...
  "scripts": {
    "build": "rollup --config"
  },
  ...
}
```

The `--config` flag (or `-c`) tells Rollup to look for `rollup.config.mjs`.

### Run the build

Execute the build script from your terminal.

```bash
npm run build
```

This will create a `dist/bundle.js` file. Create an `index.html` file in the `dist` directory to use this bundle.

```html
<!-- dist/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rollup App</title>
</head>
<body>
  <script src="bundle.js"></script>
</body>
</html>
```

If you open `dist/index.html` in a browser, you'll see the "Hello, Rollup!" heading and the message in the console.

## Use plugins for common tasks

Rollup's core is minimal. Its power is extended through plugins. Let's add some essential ones.

Common plugins:

* [@rollup/plugin-node-resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve): Helps Rollup find third-party modules in node_modules.
* [@rollup/plugin-commonjs](https://www.npmjs.com/package/@rollup/plugin-commonjs):  Converts CommonJS modules (used by many older npm packages) to ES modules.
* [@rollup/plugin-babel](https://www.npmjs.com/package/@rollup/plugin-babel): Transpiles your code using Babel.
* [@rollup/plugin-terser](https://www.npmjs.com/package/@rollup/plugin-terser): Minifies your code for production.

### Install plugins

```bash
npm install --save-dev @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-babel @babel/core @babel/preset-env
```

### Configure Babel

Create a `.babelrc` file in your project root.

```js
{
  "presets": ["@babel/preset-env"]
}
```

### Update the Rollup configuration

Modify `rollup.config.mjs` to use these plugins.

```js
// rollup.config.mjs

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true, // Useful for debugging
  },
  plugins: [
    resolve(), // Finds node_modules
    commonjs(), // Converts CommonJS to ES modules
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }) // Transpiles our code
  ]
};
```

* **sourcemap: true**: Generates a source map, which links the bundled code back to your original source files, making debugging much easier.
* **babel({ babelHelpers: 'bundled' })**: Tells Babel to include any necessary helper functions at the top of your bundle, rather than injecting them into every module.

## Development and production configurations

You typically want different builds for development (with source maps, live reloading) and production (minified, optimized).

### Install development and production plugins

For development, we'll use a server with live-reloading. For production, we'll minify the code.

```bash
npm install --save-dev rollup-plugin-serve rollup-plugin-livereload @rollup/plugin-terser cross-env
```

### Create separate configuration files

Let's split our configuration. We'll use a single `rollup.config.mjs` file and check an environment variable to decide which configuration to use.

```js
// rollup.config.mjs

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';

// Check if we are in production mode
const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: !isProduction, // Only generate sourcemaps for development
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),

    // For development: serve the 'dist' folder and enable live reload
    !isProduction && serve({
      contentBase: ['dist'],
      port: 3000,
    }),
    !isProduction && livereload('dist'),

    // For production: minify the bundle
    isProduction && terser()
  ]
};
```

### Update package.json scripts

```json
{
  ...
  "scripts": {
    "build": "cross-env NODE_ENV=production rollup -c",
    "dev": "rollup -c -w"
  },
  ...
}
```

* **build**: Uses `cross-env` to set `NODE_ENV` to production and runs Rollup on Windows, macOS, and Linux. If you run the command from Windows Subsystem for Linux (WSL), the POSIX form, `NODE_ENV=production rollup -c`, also works.
* **dev**: Runs Rollup in watch mode (`-w`), which automatically rebuilds the bundle when source files change. The serve and livereload plugins will then refresh your browser.

Now you can run `npm run dev` for a great development experience and `npm run build` to create an optimized production bundle.

## Handle CSS and images

Bundlers can also process non-JavaScript assets.

### Install asset plugins

We'll use `rollup-plugin-postcss` for CSS and `@rollup/plugin-url` to emit image files.

```bash
npm install --save-dev rollup-plugin-postcss @rollup/plugin-url
```

### Create assets

Complete this section before converting the project to TypeScript in the next section. Create a CSS file and add your own image to the `src` folder. In the following example, `logo.svg` is a placeholder. Either add an image with that name or update the import to match your image's filename.

```css
/* src/styles.css: */

body {
  font-family: sans-serif;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
  text-align: center;
}
```

Now, import the CSS and an image in `src/main.js`.

```js
// src/main.js:

import { logMessage } from './logger.js';
import './styles.css'; // Import the CSS
import logo from './logo.svg'; // Replace with your image filename

const heading = document.createElement('h1');
heading.textContent = 'Hello, Rollup!';

const image = new Image();
image.src = logo; // Use the imported image path

document.body.append(heading, image);
```

### Update the Rollup configuration

Add the new plugins to `rollup.config.mjs`.

```js
// rollup.config.mjs

// ... other imports
import path from 'node:path';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';

// ...
export default {
  // ... input and output
  plugins: [
    url({
      limit: 0,
      destDir: 'dist/assets',
      fileName: '[hash][extname]',
      publicPath: '/assets/',
    }),
    postcss({
      extract: path.resolve('dist/bundle.css'), // Extracts CSS to a separate file
      minimize: isProduction,
    }),
    resolve(),
    // ... other plugins
  ]
};
```

### Load the generated stylesheet

After building, update the `<head>` of `dist/index.html` to load the generated stylesheet.

```html
<link rel="stylesheet" href="bundle.css">
```

* **url({ ... })**: Copies imported images to `dist/assets` with hashed filenames and returns a public path such as `/assets/a1b2c3.svg`. Setting `limit` to `0` prevents the plugin from inlining images as data URLs.
* **postcss({ extract: path.resolve('dist/bundle.css') })**: This plugin will find all imported CSS files, combine them, and write them to `dist/bundle.css`.

## Use Rollup with TypeScript

Integrating TypeScript into your Rollup build process is straightforward with the official TypeScript plugin.

### Install dependencies

First, you need TypeScript, `tslib`, and the Rollup plugin for TypeScript. `tslib` is a required peer dependency of `@rollup/plugin-typescript`.

```bash
npm install --save-dev typescript tslib @rollup/plugin-typescript
```

### Configure TypeScript

Create a `tsconfig.json` file in your project root. This file specifies the root files and the compiler options required to compile the project.

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

### Convert your code to TypeScript

Rename the JavaScript files in the `src` directory to `.ts` files and add types. The following `main.ts` example continues from the CSS and image setup in the previous section.

```ts
// src/logger.ts:

export const logMessage = (message: string): void => {
  console.log(`[INFO] ${message}`);
};
```

```ts
// src/assets.d.ts

declare module '*.css';

declare module '*.svg' {
  const url: string;
  export default url;
}
```

```ts
// src/main.ts

import { logMessage } from './logger.js';
import './styles.css';
import logo from './logo.svg';

const heading = document.createElement('h1');
heading.textContent = 'Hello, Rollup with TypeScript!';

const image = new Image();
image.src = logo;

document.body.append(heading, image);

logMessage('Application has started.');
```

### Update the Rollup configuration

Finally, add the TypeScript plugin to your `rollup.config.mjs` file and update the input file.

```js
// rollup.config.mjs

// ... other imports
import typescript from '@rollup/plugin-typescript';

// ...
const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.ts', // Update the entry point
  output: {
    // ...
  },
  plugins: [
    typescript({ sourceMap: !isProduction }), // Add the typescript plugin
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
    // ... other plugins
  ]
};
```

The `@rollup/plugin-typescript` will use your `tsconfig.json` to transpile your TypeScript code into JavaScript before Rollup bundles it.

## Code splitting with dynamic imports

Code splitting is a technique for splitting your code into smaller chunks, which are then loaded on demand. Code splitting can reduce the JavaScript needed for the initial page load when the deferred module is not needed immediately. Rollup supports code splitting with dynamic `import()`.

### Use a dynamic import

Let's create a module that we only want to load when a user clicks a button.

```ts
// src/dynamic-module.ts:

export const showDynamicMessage = (): void => {
  alert('This module was loaded dynamically!');
};
```

Now, update src/main.ts to load this module on a button click.

```ts
// src/main.ts:

// ... other imports

const button = document.createElement('button');
button.textContent = 'Load Dynamic Module';
button.onclick = () => {
  import('./dynamic-module.js')
    .then(module => {
      module.showDynamicMessage();
    })
    .catch(err => {
      console.error('Failed to load module', err);
    });
};

document.body.append(button);
// ...
```

### Update the Rollup configuration for code splitting

To enable code splitting, change the output format from iife to one that supports multiple chunks, such as es, amd, or system. This browser-focused example uses es so browsers can load the entry file as an ES module. You also need to specify a directory for the output chunks.

```js
// rollup.config.mjs

// ...
export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist', // Output directory for all chunks
    format: 'es', // ES module format
    sourcemap: !isProduction,
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
  },
  // ... plugins
};
```

### Update index.html

Since we are now outputting an ES module, we need to tell the browser by adding type="module" to our script tag.

```html
<!-- dist/index.html -->

<!DOCTYPE html>
<html>
<!-- ... head ... -->
<body>
    <!-- Note the type="module" -->
    <script type="module" src="main.js"></script>
</body>
</html>
```

Now, when you run `npm run dev` or `npm run build`, Rollup will create `dist/main.js` and a hashed chunk for `dynamic-module.ts`, such as `dist/chunks/dynamic-module-a1b2c3.js`. The dynamic module will only be fetched by the browser when you click the button. This pattern defers loading code until the user requests it.

## Complete Rollup configuration

The following `rollup.config.mjs` file combines the configuration from this guide. It assumes that `dist/index.html` is the web root served during development and deployment.

```js
// rollup.config.mjs

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';
import livereload from 'rollup-plugin-livereload';
import path from 'node:path';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: !isProduction,
    entryFileNames: '[name].js',
    chunkFileNames: 'chunks/[name]-[hash].js',
  },
  plugins: [
    url({
      limit: 0,
      destDir: 'dist/assets',
      fileName: '[hash][extname]',
      publicPath: '/assets/',
    }),
    postcss({
      extract: path.resolve('dist/bundle.css'),
      minimize: isProduction,
    }),
    resolve(),
    commonjs(),
    typescript({ sourceMap: !isProduction }),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
    !isProduction && serve({
      contentBase: ['dist'],
      port: 3000,
    }),
    !isProduction && livereload('dist'),
    isProduction && terser(),
  ],
};
```

## Understand output formats: IIFE versus ES modules

Choosing the right output format is crucial for ensuring your bundled code runs correctly in its target environment.

### IIFE (immediately invoked function expression)

**What it is**: Wraps your entire bundle in a function that is executed immediately.

**When to use it**: This is the ideal format for a script that will be included via a `<script>` tag in a traditional browser environment. The IIFE creates a private scope for your code, preventing it from polluting the global namespace (`window` object) and clashing with other scripts.

**Limitation**: It's designed for a single entry bundle. It does not support code splitting, as there's no standard browser mechanism to load additional IIFE chunks on demand.

**Example iife output**

```js
(function () {
  'use strict';
  // ... all your bundled code ...
})();
```

### ES modules

**What it is**: Outputs your bundle using the standard ECMAScript module syntax (import and export).

**When to use it**: This is the modern format for web applications. Use it when your target browsers support ES modules (most modern browsers do) and you want to leverage features like code splitting with dynamic import(). The browser can then efficiently load only the code it needs. It's also the format you'd use if you're building a library that you expect other developers to consume with their own bundlers.

**Requirement**: When using this format for the browser, you must include your script with `<script type="module">`.

**Example es output**:

```js
// main.js
button.onclick = () => {
  import('./chunks/dynamic-module-a1b2c3.js')
    .then(module => module.showDynamicMessage());
};
```

Rollup includes statically imported modules in the bundle. It retains the dynamic `import()` so the browser can fetch the separate chunk only when it is needed.

In summary:

* Use the `iife` format for simple, single-file browser scripts.
* Use the `es` format for modern applications, especially when you need code splitting or are creating a library for others to use.
