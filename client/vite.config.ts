import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Production serves the API on the site's own origin via CloudFront
    // (`/v1/*` proxied to API Gateway), so the client never knows an API
    // address. This proxy makes dev the same shape: same-origin `/v1` calls,
    // real cookies.
    proxy: {
      '/v1': 'http://localhost:3000',
    },
  },
});
