import assert from 'node:assert/strict';

import { voiceOver } from '@guidepup/guidepup';
import { chromium } from 'playwright';
import { expect, test } from 'playwright/test';

test.skip(process.platform !== 'darwin', 'VoiceOver examples only run on macOS.');

test('navigates the built homepage with VoiceOver', async () => {
  test.setTimeout(45_000);

  const debug = process.env.DEBUG_VOICEOVER === '1';
  const log = (...args) => {
    if (debug) {
      console.log('[voiceover-debug]', ...args);
    }
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const targetUrl = process.env.VOICEOVER_TEST_URL || 'http://localhost:4321/';

  if (!voiceOver.detect()) {
    throw new Error('VoiceOver is not available on this machine.');
  }

  // Pre-flight cleanup to prevent hung tests
  try {
    log('running pre-flight cleanup');
    await voiceOver.stop();
  } catch {
    // Ignore, we just want to ensure it is shut down
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--force-renderer-accessibility']
  });

  const page = await browser.newPage();
  let voiceOverStarted = false;

  try {
    log('navigating to', targetUrl);
    await page.goto(targetUrl);
    await page.bringToFront();
    log('page focused');

    const topNav = page.locator('nav.nav-container').first();
    await expect(topNav.getByRole('link', { name: 'Home' })).toHaveCount(1);
    await expect(topNav.getByRole('link', { name: 'GitHub' })).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);

    log('starting VoiceOver...');
    await Promise.race([
      voiceOver.start({ capture: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('voiceOver.start() timed out.')), 10000))
    ]);

    voiceOverStarted = true;
    log('VoiceOver started');

    // Give VoiceOver time to attach to Chromium
    await wait(2000);

    // 1. Force keyboard focus into the web view document body
    await page.locator('body').focus();
    await wait(500);

    // --- First Element (Home) using Tab to sync cursors ---

    // CLEAR
    await voiceOver.clearSpokenPhraseLog();
    log('Log cleared. Pressing Tab to sync VoiceOver into the DOM...');

    // ACTION
    await page.keyboard.press('Tab');

    // WAIT
    await wait(2000);

    // READ
    const homeLog = await voiceOver.spokenPhraseLog();
    log('home spoken:', homeLog);
    // Join the array so we can regex match against the full phrase safely
    assert.match(homeLog.join(' '), /Home/i);

    // --- Second Element (GitHub) using native VoiceOver cursor ---

    // CLEAR
    await voiceOver.clearSpokenPhraseLog();
    log('Moving to next element using VoiceOver Virtual Cursor...');

    // ACTION
    await voiceOver.next();

    // WAIT
    await wait(2000);

    // READ
    const githubLog = await voiceOver.spokenPhraseLog();
    log('github spoken:', githubLog);
    assert.match(githubLog.join(' '), /GitHub/i);

    // --- Third Element (h1) using native VoiceOver cursor ---

    // CLEAR
    await voiceOver.clearSpokenPhraseLog();
    log('Moving to heading using VoiceOver Virtual Cursor...');

    // ACTION
    await voiceOver.next();

    // WAIT
    await wait(2000);

    // READ
    const headingLog = await voiceOver.spokenPhraseLog();
    log('heading spoken:', headingLog);

    // Check for "heading level 1" in the captured array
    assert.match(headingLog.join(' '), /heading level 1/i);

    log('final run successful.');

  } catch (error) {
    if (voiceOverStarted && debug) {
      try {
        log('spoken phrase log on failure:', await voiceOver.spokenPhraseLog());
      } catch {
        log('unable to retrieve spoken phrase log on failure');
      }
    }

    const original = error instanceof Error ? error.message : String(error);
    throw new Error(
      [
        'VoiceOver integration test failed.',
        'Possible causes:',
        '- Guidepup VoiceOver assets missing: run `npx @guidepup/setup install voiceover`',
        '- The Caption Panel is disabled in VoiceOver Utility',
        `Original error: ${original}`,
      ].join('\n'),
      { cause: error instanceof Error ? error : undefined },
    );
  } finally {
    if (voiceOverStarted) {
      log('stopping VoiceOver');
      await voiceOver.stop();
    }

    log('closing browser');
    await browser.close();
  }
});