import { fileURLToPath } from 'node:url';

// Shared by vite.config.ts and vitest.config.ts, which each load their own
// config file rather than one another's: defined once here so neither has
// to retype the path, and so importing it never pulls in the app config's
// own plugins (client/.storybook/main.ts documents why those have to stay
// away from the story render path).
export const srcAlias = {
  '~': fileURLToPath(new URL('./src', import.meta.url)),
};
