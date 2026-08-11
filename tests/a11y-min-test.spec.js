import { voiceOver } from '@guidepup/guidepup';
import { chromium } from 'playwright';
import { test } from 'playwright/test';

test('minimal guidepup baseline', async () => {
  test.setTimeout(30_000);

  // 1. Launch browser with accessibility forced on
  const browser = await chromium.launch({
    headless: false,
    args: ['--force-renderer-accessibility']
  });
  const page = await browser.newPage();

  try {
    // 2. Load a trivial, hardcoded HTML page (removes local dev server variables)
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Baseline Test</h1>
          <a href="#">First Link</a>
          <a href="#">Second Link</a>
        </body>
      </html>
    `);
    await page.bringToFront();

    // 3. Start VoiceOver
    console.log('Starting VoiceOver...');
    await voiceOver.start();

    // Give it a moment to initialize
    await new Promise(r => setTimeout(r, 2000));

    // 4. Force OS focus into the web content
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await new Promise(r => setTimeout(r, 1000));

    await voiceOver.clearSpokenPhraseLog();
    console.log('Log cleared. Navigating...');

    // 5. Use Guidepup's native VoiceOver commands instead of Tab
    await voiceOver.next();
    await new Promise(r => setTimeout(r, 2000));

    await voiceOver.next();
    await new Promise(r => setTimeout(r, 2000));

    // 6. Check exactly what Guidepup captured
    const log = await voiceOver.spokenPhraseLog();
    console.log('--- FINAL CAPTURED LOG ---');
    console.log(JSON.stringify(log, null, 2));
    console.log('--------------------------');

  } finally {
    console.log('Cleaning up...');
    await voiceOver.stop();
    await browser.close();
  }
});