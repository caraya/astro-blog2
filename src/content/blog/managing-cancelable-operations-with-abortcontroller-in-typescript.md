---
title: "Managing Cancelable Operations with AbortController in TypeScript"
date: 2026-10-07
tags:
  - javascript
  - typescript
  - web development
---

In modern web development, managing asynchronous tasks and cleaning up resources is critical to application performance and stability. Historically, removing DOM event listeners required storing exact function references and calling `removeEventListener()` individually. Before `AbortController` support was added to `fetch()`, applications had no standard way to cancel an in-flight fetch request.

This post covers the `AbortController` API, a unified, standard mechanism that uses a single signal to cancel one or more asynchronous operations, including DOM events, `fetch()` requests, and custom asynchronous tasks.

## Core concepts: controller and signal

The API consists of two primary interfaces:

* **`AbortController`**: The controller object represents the control point. It instantiates the workflow and exposes the command to cancel the operations.
* **`AbortSignal`**: The controller's read-only `signal` property contains an `AbortSignal`, which you pass to operations that support cancellation.

```ts
// Instantiating a new controller
const controller = new AbortController();

// Extracting the associated signal
const signal: AbortSignal = controller.signal;
```

When you invoke `controller.abort()`, the associated signal permanently transitions to an aborted state and dispatches an abort event, informing connected consumers to halt execution and clean up resources.

## Cancelable event listeners

To make a DOM event listener cancelable, pass the `AbortSignal` in the third argument (the options object) of `addEventListener()`.

### Single listener example

The following example registers a window resize listener. When you call `controller.abort()`, the event target removes the listener:

```ts
const controller = new AbortController();
const { signal } = controller;

const handleResize = (): void => {
  console.log("The window was resized.");
};

// Register the listener with the abort signal
window.addEventListener("resize", handleResize, { signal });

// Later, remove the event listener on demand
controller.abort();
```

### Managing multiple listeners simultaneously

One of the most powerful aspects of `AbortController` is its ability to group multiple event listeners under a single cancellation channel. Calling `abort()` removes all listeners registered with that signal.

```ts
const controller = new AbortController();
const { signal } = controller;

const handleMouseMove = (event: MouseEvent): void => {
  console.log(`Mouse position: X=${event.clientX}, Y=${event.clientY}`);
};

const handleScroll = (): void => {
  console.log("The page scrolled.");
};

// Attach multiple listeners to different targets using the same signal
window.addEventListener("mousemove", handleMouseMove, { signal });
window.addEventListener("scroll", handleScroll, { signal });

// Cancel all of them in a single call
controller.abort();
```

### Re-creating controllers after cancellation

An `AbortController` is a single-use object. Once you invoke `controller.abort()`, its associated signal permanently remains in an aborted state. Because a controller always exposes the same signal, you cannot reset or reuse the controller for a new operation.

If you pass an already-aborted signal to `addEventListener()`, the browser does not add the listener. To restore the cancelable behavior, you must instantiate a new `AbortController`.

The following class demonstrates how to manage the lifecycle of a toggled event stream by instantiating a new controller on demand:

```ts
class InteractiveFeature {
  private abortController: AbortController | null = null;

  public startListening(): void {
    // Clean up any existing listeners before starting a new session
    this.stopListening();

    // Create a fresh controller instance
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    console.log("Initializing new AbortController session.");

    window.addEventListener("scroll", this.onScroll, { signal });
    window.addEventListener("resize", this.onResize, { signal });
  }

  public stopListening(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      console.log("All session listeners removed.");
    }
  }

  private onScroll(): void {
    console.log("Scrolled.");
  }

  private onResize(): void {
    console.log("Resized.");
  }
}
```

## Cancelable custom asynchronous operations

Cancellation in custom code is cooperative. Aborting a signal does not automatically stop an operation. The operation must check the signal and respond by ending its work.

Call `signal.throwIfAborted()` before starting work and at appropriate checkpoints. If the signal has been aborted, this method throws the signal's abort reason. By default, `controller.abort()` sets the reason to a `DOMException` named `AbortError`.

Run this example in an environment that supports TypeScript and top-level await in ES modules.

```ts
async function processItems(items: string[], signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();

  for (const item of items) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    signal.throwIfAborted();
    console.log(`Processed ${item}`);
  }
}

const controller = new AbortController();

setTimeout(() => controller.abort(), 750);

try {
  await processItems(["profile", "preferences", "notifications"], controller.signal);
} catch (error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    console.log("Processing canceled.");
  } else {
    throw error;
  }
}
```

The signal is checked after each pause, so the function stops before processing the next item after cancellation. Add checkpoints based on how quickly your operation needs to respond.

## Cancelable network requests with `fetch()`

Integrating `AbortController` with the `fetch()` API lets an application stop requests whose results are no longer needed, reducing unnecessary network and processing work. For example, if a UI component starts a request and then unmounts, the pending request and its promise callbacks can retain request state and values captured from the component until the request settles. Aborting the request settles it earlier, allowing those references to become eligible for garbage collection sooner and preventing callbacks from updating obsolete UI. This limits temporary resource retention, but it does not fix memory leaks caused by references that remain reachable elsewhere in the application.

Pass the `AbortSignal` to the `signal` option of the `fetch()` initialization object. By default, calling `controller.abort()` while the request is pending causes the promise to reject with a `DOMException` named `AbortError`. If you pass a custom reason to `controller.abort(reason)`, the promise rejects with that reason instead.

```ts
async function fetchProductDetails(productId: string, signal: AbortSignal): Promise<void> {
  const url = `https://api.example.com/products/${productId}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    console.log("Data retrieved successfully:", data);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Network request successfully canceled.");
    } else {
      console.error("Failed to fetch product details:", error);
      throw error;
    }
  }
}

// Usage example:
const controller = new AbortController();
fetchProductDetails("123", controller.signal);

// Cancel the network operation immediately
controller.abort();
```

## Architecture decisions: choosing the right strategy

While `AbortController` is a highly powerful tool, choose your cleanup strategy based on your application's requirements.

### When to use `AbortController`

* **Grouped lifecycles**: When managing multiple event listeners that must all be torn down at the same time (e.g., when a UI component unmounts).
* **Unreferenced inline callbacks**: When registering an inline callback without storing its reference. The `removeEventListener()` method requires the same function reference passed to `addEventListener()`, so it cannot remove a callback whose reference is no longer available.
* **Coordinated cancellations**: When canceling an active `fetch()` operation alongside accompanying DOM events simultaneously.

### When to stick with `removeEventListener()`

* **Independent listener removal**: Use `removeEventListener()` when removing one listener independently and retaining its function reference makes the lifecycle clearer. If you suspect that allocating controllers affects performance, measure the impact with a profiler before choosing an approach based on allocation cost.

## Summary checklist

* **Single-use only**: Remember that `AbortController` is spent once aborted. Instantiate a new controller to restart listening.
* **Error handling**: Always handle `AbortError` in a catch block when aborting promise-based operations like `fetch()`.
* **TypeScript DOM types**: Browsers and other compatible runtimes provide `AbortController` and `AbortSignal`. TypeScript projects must include the `DOM` library in `compilerOptions.lib` to use the corresponding type declarations.
