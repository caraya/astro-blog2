---
title: "Organizing code effectively"
date: 2026-11-18
tags:
  - Code Organization
  - Best Practices
  - Software Development
admonition: true
---

One of the most deceptive challenges in software development is how to organize the codebase. Unless there are conventions to follow, the structure can quickly become chaotic and difficult to maintain.

This post outlines my research and preferences for vendoring, packaging, and structuring code in vanilla TypeScript projects, React applications, and Go projects.

## General question: to vendor or not to vendor

When managing dependencies, one of the first decisions is whether to vendor them (include them directly in your repository in a separate `vendor` directory) or rely on external package managers.


| Strategy | Definition | Pros | Cons |
| --- | --- | --- | --- |
| Vendoring | Copying a specific version of an external library into a folder (like `/vendor`) inside your project repository. | <ul><li>Provides a fixed source snapshot for reproducible builds and compliance review</li><li>Protection against deleted upstream packages</li><li>Can support offline builds</li></ul> | <ul><li>Greatly increases repository size</li><li>Makes updating libraries manual and tedious</li><li>Clutters code diffs</li></ul> |
| Package Managers | Declaring dependencies in a manifest (like package.json, Gemfile, or go.mod) and resolving them through a registry, with resolved versions recorded in a lockfile or equivalent. | <ul><li>Keeps repository size small</li><li>Update commands and automation make newer versions, including security fixes, easier to adopt</li><li>Cleaner code version control</li></ul> | <ul><li>Depends on internet access/registry uptime</li><li>Risk of "left-pad" incidents (upstream deletion)</li><li>Requires a checked-in lockfile or equivalent to pin versions for reproducible builds</li></ul> |

Licensing obligations also matter. Vendoring a dependency or installing it through a package manager does not transfer or remove those obligations; they depend on the license and how the software is used and distributed. Copyleft licenses such as the MPL, GPL, and AGPL have different requirements.

When you distribute a work covered by the GPL, you must make its complete corresponding source code available to recipients under the GPL's terms. This is a condition of distribution, not a requirement to publish the source to everyone. If you use GPL software privately and do not convey it to others, the GPL does not require you to release its source.

Distributing an independent GPL program alongside another program as an aggregate does not, by itself, extend the GPL's source or licensing requirements to the other program. The GPL program remains subject to its own license terms and source requirements.

The Free Software Foundation considers a program that links to a GPL library, statically or dynamically, to be a combined work subject to the GPL. Under this interpretation, distributing the linked program requires releasing the combination under the GPL and making its complete corresponding source code available to recipients. Whether software forms a combined work can depend on the facts and applicable law.


| Compliance Area | Vendoring | Package Manager |
| --- | --- | --- |
| License Attribution | Keep required upstream license files and notices with the vendored source; record its origin and version for review. | License files included in published packages remain available after installation; scan them along with package metadata and the lockfile. |
| Copyleft Exposure | High Risk. If you combine your project with GPL-covered code and distribute the resulting work, the FSF's interpretation is that the combination must be released under the GPL, with corresponding source available to recipients. | High Risk. The same GPL obligations apply when the dependency comes from a package manager; the package manager does not change the license requirements. |
| Scanning & Audits | Keeping vendored source together provides a predictable place for scanners and reviewers to check; record package origins and versions to identify the snapshots. | Lockfiles and registry metadata help scanners identify packages; review scan results and license data. |

Keeping vendored dependencies in one `/vendor` directory makes the source snapshots easier to locate and gives tools and reviewers a predictable place to scan them. Because vendoring pins the checked-in source, it can support reproducible builds and compliance reviews. Include package-manager dependencies in the inventory too, and update vendored snapshots deliberately when new versions are adopted.

For this post, we will maintain a separate vendor folder for third-party dependencies where possible to make them easier to locate and review.

## Vanilla TypeScript

For most projects I prefer to use TypeScript for its static typing and better developer experience. This project structure includes a clear separation between source code, third-party dependencies, and build artifacts, making it easier to manage and audit the codebase.

```text
├── dist/
├── vendor/
├── src/
│   ├── __tests__/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── .env # (gitignored)
├── .env.example # .env template
├── .gitignore
├── package.json
└── tsconfig.json
```

This example keeps third-party dependencies in `vendor/` instead of installing them in `node_modules/`. The `package.json` file can still define project metadata and scripts.

### Letting Vite do the work

`npm create vite@latest my-app -- --template vanilla-ts` creates a standard npm-based Vite starter. The tree below adapts it to this post's vendoring approach by adding `vendor/` for third-party application code; Vite and its build-tool dependencies remain npm-managed development dependencies.

```text
├── public/
│   └── vite.svg
├── vendor/
├── src/
│   ├── counter.ts
│   ├── main.ts
│   ├── style.css
│   ├── typescript.svg
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts  (Optional)
```

Note how all the source code resides directly under the `src/` directory, keeping everything at the same level and assuming you will know the difference.

Instead I choose to refine the structure under the `src/` directory to better suit your project's needs.

I normally do the following:

```text
src/
├── __tests__/
├── components/
├── utils/
├── index.ts
└── style.css
```


components
: The components folder contains every single component in your entire application grouped in subfolders named after the component.  For Vanilla TypeScript projects these components may be web components or simple TypeScript modules that encapsulate specific functionality.
: This may be overkill for small projects but it is good to build the discipline from the start.

```text
components/
├── Button/
│   ├── Button.ts
│   ├── Button.css
│   └── Button.test.spec.ts
└── Card/
    ├── Card.ts
    ├── Card.css
    └── Card.test.spec.ts
```

\_\_tests\_\_
: Centralized location for all test files related to the components in the project. This helps keep the test code organized and separate from the implementation code, making it easier to maintain and run tests consistently.

Utils
: The utils folder contains utility functions and helper modules that can be reused across different parts of the application. This helps avoid code duplication and keeps the codebase DRY (Don't Repeat Yourself).


### Adding web components

Web components, or more specifically custom elements, allow you to create reusable UI components with encapsulated functionality and styles.

I've chosen to reference custom elements here because their markup and styles can be scoped in different ways. Shadow DOM encapsulates a component's markup and styles in a shadow root. Light DOM components render into the regular document tree instead. HTML components wrap HTML in a custom element without using Shadow DOM or custom-element lifecycle methods. These choices affect how styles and functionality are scoped and reused within the application.

For organizational purposes, custom elements can live under `src/components/` alongside other components, each in their own subfolder named after the component or they can live in a special `src/elements/` directory dedicated to web components so that they are clearly distinguished from regular components.


## React

React presents a more complex directory structure because of the various types of components and modules available and how they are organized in the project's source.

I'm using a hybrid structure, inspired by Robin Wieruch's [guide on React folder structure](https://www.robinwieruch.de/react-folder-structure/)

I always use Vite as the build tool for React projects since it automates TypeScript transpilation, module bundling, and development server setup, making the development experience smoother and more efficient.

```text
my-react-project/
├── public/
│   └── vite.svg
├── src/
│   ├── __tests__/
│   ├── pages/
│   ├── components/
│   ├── utils/
│   ├── layouts/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── eslint.config.js
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

These are the directories most commonly used in React projects and their purpose.  You may not need all of them for every project, but it's good to know their typical usage.

pages/
: pages contains code that is specific to individual pages in your application. Each page typically has its own folder containing the main page component and any page-specific components, hooks, or styles.
: Each page folder typically contains an index file for the main page component, along with any page-specific components, hooks, or styles.

layouts/
: Top-level layout components like sidebar, navbar, container that are used across multiple pages. This is different from page-specific components which live inside the pages/ folder.

components/
: Like what we used in the vanilla TypeScript project, this folder contains reusable UI components, each in its own subfolder named after the component.
: The components are stored in their own folders.

context/
: Context providers for managing global state and passing data through the component tree.

utils/
: Utility functions and helpers that can be reused across the project.

\_\_tests\_\_/
: Unit and integration tests for the project

lib/
: Pre-configured wrappers around third-party libraries (an axios instance, a Firebase init, a configured client)

api/
: Centralized API client code when many features share the same endpoints

stores/
: Global state (Redux, Zustand, Jotai stores)

types/
: Shared TypeScript types and interfaces

## Go

When organizing a Go project, deciding whether or not to use a vendor/ directory is a common question with a complicated answer.

Go doesn't provide a standard mechanism or layout for project structure, leaving it up to developers to organize their code in a way that makes sense for their application.

This is in addition to the complexities introduced by Go's vendoring strategy.

While vendoring is often thought of as a universal way to bundle third-party code, Go handles vendoring with a very specific philosophy that creates an intentional friction between compiler efficiency and legal compliance.

### Initializing and vendoring a Go project

These commands will initialize a new Go project.

```bash
go mod init myproject
```

If you are planning to vendor your dependencies, you can tidy up the project dependencies and create the vendor directory with:

```bash
go mod tidy
go mod vendor
```

`go mod vendor` creates a `vendor/` directory in the main module containing copies of packages needed to build and test its packages. It also writes `vendor/modules.txt`, which records the module versions. Since Go 1.17, the vendored copies omit each dependency's `go.mod` and `go.sum`, so they do not retain the dependencies' full module metadata. Packages used only by tests of packages outside the main module are not included. When vendoring is enabled, Go loads packages from `vendor/` instead of the module cache or network; the main module's `go.mod` and `go.sum` remain in place.

This is not the same as providing static third-party packages to do license analysis and compliance check like we do in other languages.

## Project structure in Go

In Go projects, the typical structure separates the main application entry points, internal packages, and reusable libraries. Here's an example layout:

```text
my-project/
├── go.mod
├── go.sum
├── cmd/
│   └── api/
│       └── main.go       # Thin entry point: parses flags, boots dependencies
├── internal/
│   ├── db/
│   │   └── postgres.go   # Private database package
│   └── server/
│       └── router.go     # Private business/routing logic
└── pkg/
```

The explanation for this structure is as follows:

/cmd
: Contains a subdirectory for each executable target. Keep the main.go files here as thin shells—they should only handle configuration/bootstrapping and call into your internal logic.

/internal
: This is a directory enforced by the Go compiler. No external repository can import packages residing within internal. This gives you the freedom to refactor your code without worrying about breaking downstream users.

/pkg
: Code that you explicitly want to allow other external projects to import and use. If you aren't building a library for other developers, you likely do not need a `/pkg` folder.

You can then add additional directories as needed for specific concerns for your project, such as `ui` for frontend assets, `static` for static files, or `scripts` for utility scripts.

### Organizing the code in `/internal`

You have multiple ways to organize the code within the `/internal` directory. The two most common approaches are Layered/Functional and Domain/Modular. The table below summarizes these approaches and when to use them.

| Layout Style | Description | Best Used For |
| --- | --- | --- |
| Layered / Functional | Grouped by what the code does tech-wise (`internal/handlers`, `internal/models`, `internal/db`). | Smaller web servers and microservices where code boundaries are tightly coupled. |
| Domain / Modular | Grouped by business capabilities (`internal/users`, `internal/billing`, `internal/orders`). | Medium-to-large business applications. Keeps your code highly decoupled and modular. |

## Conclusion

There is no single directory structure that works for every project. Start with the conventions of your language and tools, then add structure where it clarifies responsibilities and makes the code easier to maintain. Choose vendoring or a package manager based on your project's requirements, and apply your approach consistently.
