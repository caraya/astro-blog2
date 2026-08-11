import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  projects: [
    {
      name: 'default',
      testIgnore: /guidepup-voiceover-dist-index\.spec\.mjs/,
    },
    {
      name: 'voiceover',
      testMatch: /guidepup-voiceover-dist-index\.spec\.mjs/,
      workers: 1,
      fullyParallel: false,
    },
  ],
});
