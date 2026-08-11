---
title: "It's all in the training"
date: 2026-08-28
tags:
  - accessibility
  - ai
youtube: true
---

In [Can Your AI Pass the Accessibility Test?](https://www.aaron-gustafson.com/notebook/can-your-ai-pass-the-accessibility-test/), Aaron Gustafson discusses the accessibility issues he experienced when using AI to generate content. The question is deceptively simple, but the answer is not. The honest answer is: it depends on how you use AI, what you ask it to do, and how you train it to accomplish the accessibility goal.

AI does a lot of things well, but it does not do everything for you. One lesson I learned the hard way is that AI does not do accessibility by default. It needs explicit training, constraints, and verification. It will not make your app or site accessible on its own, and it will not reliably test it for you.

This is the core issue: AI can generate content quickly, but it does not automatically understand the accessibility requirements that make that content usable for everyone.

This post walks through the full loop: what to teach AI about accessibility, how to encode that guidance in skills and prompts, and how to verify the result with testing tools. It helps answer the question "Can your AI pass the accessibility test?" with a more nuanced answer: "Yes, if you train it to do so."

## The Problem

It is easy to assume that AI-generated content is accessible because it is built from a large corpus of human-written material. In practice, that assumption is often wrong.

When I used AI to generate a website or web app, I found that the content was not keyboard accessible or screen reader accessible. Multiple times during development I had to explicitly use agents and skills to ensure the content became and stayed accessible.

This is as much an issue with our assumptions about AI as it is with how AI works. AI is trained on a large dataset of human-generated content, but that dataset is not specifically focused on accessibility.

## Teaching AI to do the work

When using prompts to generate content, it is important to provide specific accessibility instructions. For example, you can ask the AI to ensure that all images have alt text, that all form inputs have associated labels, and that all interactive elements are keyboard focusable. But these instructions can make the prompt unwieldy, and it becomes harder to guarantee that the AI will follow them when the prompt is long and complex.

### Adding skills to the mix

This is where skills help. They give the model specific information about the task at hand.

I use a generic accessibility skill and a React-specific one. The generic skill provides a broad checklist for web accessibility, while the React skill adapts those rules to component patterns and JSX-specific concerns. The full skills are available on [GitHub](https://github.com/caraya/agent-skills/blob/main/skills/accessibility-core/SKILL.md).

The generic skill applies to any web project, regardless of framework or library. It provides a broad checklist of accessibility practices that can be applied widely.

```markdown
## Guidelins

### Keyboard Navigation
- [ ] All interactive elements focusable via Tab key
- [ ] Focus order follows visual/logical order
- [ ] Focus is visible (outline/ring on focused elements)
- [ ] Custom widgets have keyboard support (Enter to activate, Escape to close)
- [ ] No keyboard traps (user can always Tab away from a component)
- [ ] Skip-to-content link at top of page
- [ ] Modals trap focus while open, return focus on close

### Screen Readers
- [ ] All images have `alt` text (or `alt=""` for decorative images)
- [ ] All form inputs have associated labels (`<label>` or `aria-label`)
- [ ] Buttons and links have descriptive text (not "Click here")
- [ ] Icon-only buttons have `aria-label`
- [ ] Page has one `<h1>` and headings don't skip levels
- [ ] Dynamic content changes announced (`aria-live` regions)
- [ ] Tables have `<th>` headers with scope

### Visual
- [ ] Text contrast ≥ 4.5:1 (normal text) or ≥ 3:1 (large text, 18px+)
- [ ] UI components contrast ≥ 3:1 against background
- [ ] Color is not the only way to convey information
- [ ] Text resizable to 200% without breaking layout
- [ ] No content that flashes more than 3 times per second

### Forms
- [ ] Every input has a visible label
- [ ] Required fields indicated (not by color alone)
- [ ] Error messages specific and associated with the field
- [ ] Error state visible by more than color (icon, text, border)
- [ ] Form submission errors summarized and focusable

### Content
- [ ] Language declared (`<html lang="en">`)
- [ ] Page has a descriptive `<title>`
- [ ] Links distinguish from surrounding text (not by color alone)
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Meaningful empty states (not blank screens)
```

The second skill is React-specific and provides guidelines for accessibility in React applications. These guidelines are based on the same principles as the generic accessibility skill, but they are tailored to React-specific syntax and best practices where appropriate.

The full skill is available on [GitHub](https://github.com/caraya/agent-skills/blob/main/skills/accessibility-react/SKILL.md).

```markdown
## Guidelines

### Keyboard Navigation
- [ ] All interactive elements (`button`, `input`, custom components) are focusable via Tab
- [ ] Use `tabIndex={0}` for custom focusable elements
- [ ] Focus order matches DOM/visual order
- [ ] Focus ring is visible (use :focus-visible or custom styles)
- [ ] Custom widgets support keyboard events (Enter, Space, Escape)
- [ ] No keyboard traps (user can always Tab away)
- [ ] Modals/dialogs trap focus while open, return focus on close (see `focus-trap-react`)

### Screen Readers
- [ ] All images use `alt` prop (`<img alt="..." />`)
- [ ] All form fields have `<label htmlFor=...>` or `aria-label`
- [ ] Buttons/links have descriptive text (not "Click here")
- [ ] Icon-only buttons use `aria-label`
- [ ] One `<h1>` per page, headings in order
- [ ] Dynamic content changes use `aria-live` regions
- [ ] Tables use `<th scope=...>`

### Visual
- [ ] Text contrast ≥ 4.5:1 (normal) or ≥ 3:1 (large)
- [ ] UI elements contrast ≥ 3:1
- [ ] Color is not the only indicator
- [ ] Text resizable to 200% without breaking layout
- [ ] No flashing content >3 times/sec

### Forms
- [ ] Every input has a visible label
- [ ] Required fields indicated (not by color alone)
- [ ] Error messages specific and associated with the field
- [ ] Error state visible by more than color (icon, text, border)
- [ ] Form errors summarized and focusable

### Content
- [ ] `lang` attribute set on `<html>`
- [ ] Page has descriptive `<title>`
- [ ] Links distinguishable (not by color alone)
- [ ] Touch targets ≥ 44x44px
- [ ] Empty states are meaningful
```

## Types of testing

Using AI skills to generate accessible content is a good start, but it is not enough. Because AI does not guarantee correct results, you still need to test the content to make sure the skills worked and the final result is accessible. There are two main ways to test accessibility: manual testing and automated testing.

### Manual testing

Manual testing is still the best way to ensure that your site is accessible. I used keyboard navigation and screen readers to test the AI-generated content.

### Automated testing

While manual testing is the best way to ensure accessibility, it is not always feasible to test every page and every component manually. Automated testing helps catch accessibility issues during the development process.

## Testing with Playwright

Once the guidance is in place, the next step is to verify it in a real browser environment. [Playwright](https://playwright.dev/) is a Node.js library that automates Chromium, Firefox, and WebKit with a single API. It is built to enable cross-browser web automation that is evergreen, capable, reliable, and fast. This allows you to automate many types of testing, including accessibility.

For the examples in this post, I will only use Chromium/Chrome for testing, but Playwright can be used to test across multiple browsers.

### Installing the tools

Before we start, we need to install the necessary tools. We will use Playwright for browser automation and axe-core for accessibility testing.

```bash
npm i -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

Now we can move on to different types of accessibility testing with Playwright.

### Axe-core and Playwright

Axe-core is an accessibility testing engine for websites and other HTML-based user interfaces. It is designed to be fast, reliable, and easy to use. It can be used in conjunction with Playwright to automate accessibility testing.

1. **Write the baseline test**: Import the AxeBuilder and run it against a page after navigation. Axe-core scans the accessibility tree generated by the browser and returns an array of violations.
2. **Handle known violations**: In real-world applications, you often inherit third-party widgets or legacy components that you cannot immediately fix. You can configure AxeBuilder to ignore specific DOM nodes or specific rules so your tests don't permanently fail while you work on a backlog.
3. **Attach reports for debugging**: When an accessibility test fails, diagnosing it from the terminal output can be difficult because the violation objects are large. Playwright allows you to attach the Axe JSON output directly to the HTML report for easier debugging.

```ts
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Verification Suite', () => {
  const targetUrl = process.env.A11Y_TEST_URL || 'http://localhost:4321/';

  test.beforeEach(async ({ page }) => {
    // Navigate to the target page before each test runs
    await page.goto(targetUrl);
  });

  test('should not have any automatically detectable violations', async ({ page }, testInfo) => {
    // Analyze the entire page using Axe-core
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Attach the violation data to the Playwright HTML report for easier debugging
    await testInfo.attach('accessibility-scan-results', {
      body: JSON.stringify(accessibilityScanResults.violations, null, 2),
      contentType: 'application/json'
    });

    // Assert that the array of violations is empty
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass scans when filtering known legacy or third-party issues', async ({ page }) => {
    // Analyze the page while explicitly ignoring specific nodes or rules
    // This allows the build to pass while maintaining a backlog of known issues
    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#third-party-chat-widget') // Exclude unmodifiable third-party DOM nodes
      .disableRules(['color-contrast']) // Temporarily disable specific rules site-wide
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should match the expected semantic accessibility tree snapshot', async ({ page }) => {
    // Playwright natively reads the accessibility tree (what screen readers consume).
    // Snapshotting this tree ensures that structural semantics (like heading levels
    // and ARIA roles) do not accidentally regress when visual CSS changes.
    const snapshot = await page.locator('body').ariaSnapshot();

    // This will generate a baseline snapshot file on the first run,
    // and compare against it on all subsequent runs.
    expect(snapshot).toMatchSnapshot('homepage-accessibility-tree.json');
  });
});
```


### Playwright accessibility snapshots

Playwright has a built-in engine that reads the same accessibility tree that VoiceOver uses. Agents can generate tests that snapshot this tree using the modern ARIA snapshot API:

```ts
// Copilot can easily generate this without worrying about macOS latency
const snapshot = await page.locator('body').ariaSnapshot();
expect(snapshot).toMatchSnapshot('homepage-accessibility-tree.json');
```

Playwright uses a "golden file" (or baseline) approach to compare snapshots. It creates a "golden" snapshot of the page when it first runs and compares the subsequent live test results against those saved files.

**The First Run (Creating the Baseline)**

When you run the test for the first time, Playwright looks for the `homepage-accessibility-tree.json` file. Because it doesn't exist yet, Playwright does the following:

1. It captures the ARIA snapshot output from `page.locator('body').ariaSnapshot()`.
2. It creates a new directory and writes that snapshot into `homepage-accessibility-tree.json`.
3. It fails the test. This is an intentional safety feature to alert you that a new baseline was created and requires human review.

**Subsequent Runs (The Comparison)**

The next time you run the test, Playwright finds the existing JSON file on your disk. It generates a fresh accessibility snapshot of the live page and compares it against the saved file.

1. If the JSON structures match exactly, the test passes.
2. If a developer changed the semantic structure (e.g., changed an `<h1>` to an `<h2>`), the test fails, and Playwright outputs a diff showing exactly what changed.

If a developer accidentally wraps a button in a div that strips its semantic meaning, the snapshot fails, alerting the team before it reaches a screen reader user.

### Keyboard Navigation Testing

The keyboard navigation tests can be automated with Playwright, but the screen reader tests are more difficult to automate. I used VoiceOver on macOS to test the accessibility of the AI-generated content.

An example of a keyboard navigation test may look like the code below. It uses Playwright to navigate through the page using the keyboard and asserts that the focus order is correct. Keyboard navigation depends heavily on the page's document structure and the order of interactive elements. What works on one page may not work on another, so the test needs to be tailored to the specific page being tested.

```ts
import { test, expect } from '@playwright/test';

test('verify keyboard focus order', async ({ page }) => {
  await page.goto('https://example.com');

  // Move focus to the first element
  await page.keyboard.press('Tab');

  // Verify the active element matches the expected locator
  const firstFocused = page.locator('a.nav-home');
  await expect(firstFocused).toBeFocused();

  // Tab to the next interactive element
  await page.keyboard.press('Tab');

  // Verify the next active element
  const secondFocused = page.locator('button#submit-btn');
  await expect(secondFocused).toBeFocused();
});
```

### Automating Screen Reader Testing (don't do it)

Initially, I thought we would be able to automate screen reader testing using Playwright, Guidepup, and VoiceOver on a macOS machine. However, I found that this was not practical using Playwright and Guidepup.

The testing setup we described does not work on Windows machines. VoiceOver is a macOS-only screen reader, and configuring and running NVDA on Windows is a separate process.

Some of the issues I encountered when trying to automate screen reader testing include:

* **Extreme Brittleness to the Accessibility Tree**: As you saw, `voiceOver.next()` doesn't jump between links; it walks every node in the accessibility tree. A developer adding a harmless visual wrapper like `<div class="spacing">` might create an invisible text node. Suddenly, your script needs three `next()` calls instead of two, and the test crashes.
* **Environment Nightmares**: Guidepup requires a dedicated, unlocked macOS environment with specific UI settings enabled (like the Caption Panel) and no competing applications stealing focus. Running this reliably in headless Linux CI/CD pipelines (like GitHub Actions) is virtually impossible without specialized, expensive bare-metal Mac runners.
* **Variable Latency**: Text-to-speech engines process text asynchronously. You are forced to write polling functions and arbitrary wait() timeouts. AI agents like GitHub Copilot are particularly bad at generating these temporal workarounds, often writing straightforward, synchronous code that instantly fails.

Instead of automating screen reader testing, I recommend manual testing with a screen reader, ideally with people who rely on the technology every day. This is the best way to ensure that your site is accessible.

Once we accept that manual screen reader testing is the gold standard, the practical question becomes how to fit accessibility validation into the development workflow. This is where Playwright and Axe-core become useful: they help us catch regressions before code ships, while human testing remains the final check.

## Integrating Accessibility Testing into CI/CD

To ensure that accessibility testing is part of your continuous integration and deployment (CI/CD) pipeline, you can add Playwright tests to your CI configuration. This allows you to catch accessibility issues early in the development process.

The challenge is to create Playwright tests that are tailored to specific pages and their structure. You can use your agent (with or without the Playwright skills) to generate the tests for you. The agent can analyze the page structure and generate Playwright tests that verify keyboard navigation and screen reader accessibility.

### Using AI to Create Playwright Accessibility Scripts

If you want AI to generate useful Playwright accessibility tests, give it strong constraints and concrete page targets.

Start with page intent, not just a URL
: Tell the model what users need to accomplish on the page: navigate header links, submit a form, open and close a modal, or complete a checkout. This prevents the AI from generating shallow visibility checks and forces it to focus on meaningful keyboard navigation and state transitions.

Provide structural hints
: Include known selectors, landmark roles, and expected focus order for critical flows. Providing structural boundaries ensures the AI targets stable regions (like a modal or navigation bar) rather than generating brittle full-page assertions that fail when dynamic content changes.

Enforce role-based locators first
: Require the prompt to prioritize `getByRole`, `getByLabel`, `getByPlaceholder`, and `getByText` over CSS or XPath selectors. In Playwright, `getByRole` queries the exact DOM accessibility tree that screen readers consume. Using role-based locators ensures that passing a test implicitly validates the element's semantic accessibility.

Require explicit keyboard and state assertions
: Because automated tests run in the DOM rather than through an OS screen reader, you must explicitly assert focus movement and ARIA state changes. Instruct the AI to write checks using Tab, Shift+Tab, Enter, Space, and Escape, and assert key attributes such as toBeFocused(), aria-expanded, and aria-hidden.

Generate modular scripts per flow
: Avoid requesting a single monolithic test file. Instruct the AI to generate separate, smaller test files for distinct flows (e.g., header navigation, dialogs, form validation). Modular scripts reduce AI context hallucinations, run faster in parallel, and map clearly to CI/CD failure logs.

Incorporate a human validation loop
: AI can draft test scripts quickly, but it cannot evaluate user comprehension. Always review generated tests locally to ensure the AI's assumptions about tab order, landmark boundaries, and interactive states match the actual user experience before merging.

Enforce a strict prompt template
: Use a standardized prompt template across teams to ensure consistency in locator strategy, assertion depth, and test runner syntax.

Gate CI/CD pipelines on deterministic suites
: Run generated accessibility tests in your continuous integration pipeline and fail the build on regressions. Ensure tests remain deterministic by mocking volatile inputs (such as seeded database records, fixed fixture content, mocked dates/times, and disabled random ordering).

**Standardized AI Prompt Template**

Use this prompt when requesting accessibility tests from an AI coding agent:

```text
Generate a Playwright accessibility test for: <PAGE_URL>

User goal / flow:
<FLOW_DESCRIPTION>

Structural hints:
<KNOWN_LANDMARKS_OR_SELECTORS>

Requirements:
1. Use @playwright/test runner syntax with standard test fixtures ({ page }).
2. Use getByRole, getByLabel, or getByText locators exclusively. Avoid CSS/XPath selectors.
3. Verify the full keyboard navigation path using Tab, Shift+Tab, Enter, Space, or Escape.
4. Explicitly assert focus placement (toBeFocused()) on controls in sequential order.
5. Assert ARIA state changes (e.g., aria-expanded, aria-hidden, dialog visibility) during interactions.
6. Keep tests deterministic and modular.
```

### Adding Axe-core to the AI prompt

This section shows how to tighten the AI prompt so it produces Playwright tests that combine keyboard validation with automated accessibility scanning. The first example checks keyboard flow alone; the second adds Axe-core so the generated test also validates semantic and WCAG issues.

AI models frequently confuse the standalone Playwright execution script (`chromium.launch()`) with the standard `@playwright/test` runner. Ensure the generated code adheres to Playwright's native fixture model:

```ts
import { expect, test } from '@playwright/test';

test.describe('Index Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('validates document language and primary landmark', async ({ page }) => {
    // Verify document-level accessibility prerequisites
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('validates sequential keyboard focus across header navigation', async ({ page }) => {
    // Ensure initial focus starts on the document body
    await page.locator('body').focus();

    // Tab to first interactive element (Home link)
    await page.keyboard.press('Tab');
    const homeLink = page.getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeFocused();

    // Tab to second interactive element (GitHub link)
    await page.keyboard.press('Tab');
    const githubLink = page.getByRole('link', { name: 'GitHub' });
    await expect(githubLink).toBeFocused();
  });
});
```

The Generated Output

When you feed that prompt to GitHub Copilot or another AI agent, it will generate a comprehensive test that checks semantics, keyboard flow, and WCAG compliance in a single pass.

```ts
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Index Page Navigation and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('validates keyboard focus flow and WCAG compliance', async ({ page }) => {
    // 1. Initial State Scan
    // Scan the page immediately upon load, explicitly excluding known legacy widgets
    const initialAxeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#legacy-chat-widget')
      .analyze();

    expect(initialAxeResults.violations).toEqual([]);

    // 2. Keyboard Navigation Flow
    await page.locator('body').focus();

    // Navigate to the Home link
    await page.keyboard.press('Tab');
    const homeLink = page.getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeFocused();

    // Navigate to the GitHub link
    await page.keyboard.press('Tab');
    const githubLink = page.getByRole('link', { name: 'GitHub' });
    await expect(githubLink).toBeFocused();

    // 3. Post-Interaction State Scan
    // If interactions triggered menus or modals, run a focused scan on the new state
    const navigationAxeResults = await new AxeBuilder({ page })
      .include('nav')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(navigationAxeResults.violations).toEqual([]);
  });
});
```

We can also update the AI prompt to include Axe-core integration, expanding the generated tests to include keyboard navigation, semantic assertions, WCAG compliance, and explicit accessibility snapshot tests.

```text
Generate a Playwright accessibility test for: <PAGE_URL>

User goal / flow:
<FLOW_DESCRIPTION>

Structural hints and known exclusions:
<KNOWN_LANDMARKS_OR_SELECTORS_AND_AXE_EXCLUSIONS>

Requirements:
1. Use @playwright/test runner syntax with standard test fixtures ({ page }).
2. Import AxeBuilder from @axe-core/playwright.
3. Use getByRole, getByLabel, or getByText locators exclusively. Avoid CSS/XPath selectors.
4. Verify the full keyboard navigation path using Tab, Shift+Tab, Enter, Space, or Escape.
5. Explicitly assert focus placement (toBeFocused()) on controls in sequential order.
6. Assert ARIA state changes (e.g., aria-expanded, aria-hidden, dialog visibility) during interactions.
7. Run an AxeBuilder scan at the end of the flow (or on key visual states) using wcag2a, wcag2aa, wcag21a, and wcag21aa tags.
8. Use the .exclude() method on the AxeBuilder for any known third-party or legacy exclusions provided in the hints.
9. Assert that the accessibilityScanResults.violations array is empty.
10. Keep tests deterministic and modular. Return TypeScript code.
```

This updated template ensures that the AI generates a complete quality gate: AxeBuilder catches the objective DOM violations (like missing alt text or color contrast issues), while the explicit Tab assertions prove that a keyboard-only user can successfully operate the interface.

<!-- <lite-youtube videoid="ld9gB348SEM"></lite-youtube> -->
