---
title: "Time-based content on the web"
date: 2026-10-23
tags:
  - web development
  - content
  - time-based
---

In earlier versions of the web, it wasn't uncommon for websites to change their content or appearance based on the time of day. This could include things like background colors, greetings, or even the visibility of certain elements.

[Time-based background colour transitions with Temporal and CSS color-mix](https://localghost.dev/blog/time-based-background-colour-transitions-with-temporal-and-css-color-mix/) presents an updated method for implementing time-based content changes on the web using newer APIs such as Temporal and CSS `color-mix()`.

## The idea

The idea is to adjust the content or appearance of a website based on the current time, as measured in the user's browser. This can create a more dynamic and engaging user experience, as the website can respond to the time of day in real time.

For example, a website might display a "Good morning" message with a light background color in the early hours, switch to a "Good afternoon" message with a warmer background color during the day, and then show a "Good evening" message with a darker background color at night. This approach can make the website feel more personalized and responsive to the user's environment.

## The components

There are two main components involved in implementing time-based content changes on the web: the Temporal API and custom properties.

### Temporal API

The Temporal API provides a modern way to work with dates and times in JavaScript. It allows you to get the current time, manipulate dates and times, and perform calculations based on time. This is essential for determining the current time of day and making decisions about how the content should change.

As of September 2026, [Temporal is available in Safari Technology Preview](https://caniuse.com/temporal), but support in stable Safari remains uncertain.

```ts
// Get the current wall-clock time in the local time zone
const currentTime: Temporal.PlainTime = Temporal.Now.plainTimeISO();

// Access 24-hour components directly
const hours: number = currentTime.hour; // 0–23 (24-hour format)
const minutes: number = currentTime.minute; // 0–59
const seconds: number = currentTime.second; // 0–59

// Or get a formatted 24-hour string (e.g., "14:35:09")
const timeString: string = currentTime.toString({ fractionalSecondDigits: 0 });

console.log(`Current 24-hour time: ${timeString}`);
```

### Custom properties

Custom properties (CSS variables) allow you to define values that can be reused throughout your CSS. By updating these properties dynamically with JavaScript based on the current time, you can change the appearance of your website in real time. For example, you can define custom properties for background colors and update them according to the time of day.

To use custom properties, I take a two-step approach. First, I register the properties with the browser by using `CSS.registerProperty()`. This defines their syntax, inheritance behavior, and initial values.

```ts
window.CSS.registerProperty({
  name: "--brand-color",
  syntax: "<color>", // Restricts the property to color values
  inherits: true, // Does it pass down to child elements?
  initialValue: "#007bff", // Fallback value
});
```

Then I dynamically update their values using JavaScript based on the current time. In the snippet below, `bgColor` and `textColor` are updated according to the time of day and applied to the custom properties.

```ts
const root = document.documentElement;

// Dynamically create/set a custom property
root.style.setProperty("--background-color", bgColor);
root.style.setProperty("--text-color", textColor);
```

With this setup, you can easily change the appearance of your website based on the time of day by updating the custom properties dynamically. The next section provides a complete example of this approach.

## Example

This example pulls everything we've discussed together to demonstrate how to register custom properties, evaluate the current time, and dynamically update the appearance of a website based on the time of day.

For clarity, I've broken the code into blocks that are easier to explain and understand.

First, define fallback values on the root element. These declarations provide default values before the JavaScript runs and in browsers that don't support `CSS.registerProperty()`.

```css
:root {
  --background-color: oklch(0.6804 0.21 33.69);
  --text-color: oklch(1 0 0);
}
```

The next block registers the custom properties using the Houdini `CSS.registerProperty()` API, ensuring that the properties have well-defined syntax, inheritance behavior, and initial values. Even though all modern browsers support this API, the code includes feature detection to prevent errors in unsupported environments.

```ts
// Register custom properties with feature detection
if (typeof window.CSS !== "undefined" && "registerProperty" in window.CSS) {
  window.CSS.registerProperty({
    name: "--background-color",
    syntax: "<color>",
    inherits: true,
    initialValue: "oklch(0.6804 0.21 33.69)",
  });

  window.CSS.registerProperty({
    name: "--text-color",
    syntax: "<color>",
    inherits: true,
    initialValue: "oklch(1 0 0)",
  });
}
```

The core of the code evaluates the current time and determines the appropriate greeting, background color, and text color based on the time of day by comparing the current hour against predefined ranges.

Each of these ranges corresponds to a specific time of day (morning, afternoon, evening) and has associated background and text colors that are applied when the current hour falls within that range.

```ts
// 1. Evaluate state
const hours: number = Temporal.Now.plainTimeISO().hour;

let greeting: string = "Welcome!";
let bgColor: string = "oklch(0.6804 0.21 33.69)";
let textColor: string = "oklch(1 0 0)";

if (hours >= 6 && hours < 12) {
  greeting = "Good morning!";
  bgColor = "oklch(0.6804 0.21 33.69)";
  textColor = "oklch(1 0 0)"; // Update morning text color here
} else if (hours >= 12 && hours < 18) {
  greeting = "Good afternoon!";
  bgColor = "oklch(0.6804 0.21 33.69)";
  textColor = "oklch(1 0 0)"; // Update afternoon text color here
} else if (hours >= 18 || hours < 6) {
  greeting = "Good evening!";
  bgColor = "oklch(0.4403 0.1603 303.37)";
  textColor = "oklch(1 0 0)"; // Update evening text color here
}
```

The next step uses the values calculated in the previous step to update the DOM.

Because `document.querySelector()` returns `null` when it cannot find `.title-element`, the code checks the result before updating the heading.

```ts
// 2. Update the DOM
console.log(greeting);

const root: HTMLElement = document.documentElement;
const heading = document.querySelector<HTMLElement>(".title-element");

root.style.setProperty("--background-color", bgColor);
root.style.setProperty("--text-color", textColor);

// Explicit guard to prevent null reference errors
if (heading !== null) {
  heading.innerText = greeting;
}
```

You can change any item on the page that depends on the time of the day by defining new variables or capturing different elements on the page. For example, you could change the menu of a cafe to show options specific to breakfast, lunch, or dinner based on the current time.
