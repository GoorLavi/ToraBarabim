import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // A production build with no VITE_API_URL used to fall through silently to
  // config.ts's localhost default, shipping a site that could never reach the API
  // (see infra/README.md step 7). Fail the build itself instead of fail open: the
  // broken output is invisible until a real visitor hits it in the browser, while a
  // build failure is caught before anything is uploaded.
  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL is required for a production build. Set it to the API base URL ' +
        '(the ApiUrl output of the TorabarabimServer stack) before running ' +
        '`npm run build -w client`.',
    );
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
    },
  };
});
