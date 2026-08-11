import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import { expect, test } from 'playwright/test';

test('checks the built homepage for basic accessibility landmarks', async () => {
  const distIndexUrl = new URL('../dist/index.html', import.meta.url);
  const distIndexPath = fileURLToPath(distIndexUrl);

  if (!existsSync(distIndexPath)) {
    throw new Error(
      `Expected built homepage at ${distIndexPath}. Run npm run build first.`,
    );
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(distIndexUrl.href);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('The Publishing Project');

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'The Publishing project' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Do we still need to know how to code?' })).toBeVisible();

    const topNav = page.locator('nav.nav-container').first();
    await expect(topNav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(topNav.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await expect(topNav.getByRole('link', { name: 'Patterns' })).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(topNav.getByRole('link', { name: 'Home' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(topNav.getByRole('link', { name: 'GitHub' })).toBeFocused();

    const searchForm = page.locator('form.footer-search');
    await expect(searchForm.getByRole('searchbox')).toBeVisible();
    await expect(searchForm.getByRole('button', { name: 'Search' })).toBeVisible();

    const latestPosts = page.locator('ul.latest-posts > li > a');
    await expect(latestPosts).toHaveCount(5);
  } finally {
    await browser.close();
  }
});