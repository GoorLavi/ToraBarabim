import path from 'node:path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import { srcAlias } from './vite.alias.ts';

// Runs every story's play function as a Vitest test, in the real Chromium
// installed at PLAYWRIGHT_BROWSERS_PATH rather than jsdom, so an interaction
// test exercises the same rendering a person would see. `extends: true`
// pulls in Storybook's own Vite config (client/.storybook/main.ts, which
// already strips the React Router plugins this workspace's build needs but
// a story render does not) rather than forking a second one here.
//
// `extends: true` does not carry `resolve.alias` over, so every `~` import a
// story pulls in fails to resolve here even though the same story resolves
// fine inside Storybook itself. Reading `srcAlias` from its own tiny module
// (not from vite.config.ts, whose top level calls `reactRouter()`, a plugin
// this test path never needs) keeps the alias defined in one place instead
// of retyping the path.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        resolve: {
          alias: srcAlias,
        },
        plugins: [
          storybookTest({ configDir: path.join(import.meta.dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
