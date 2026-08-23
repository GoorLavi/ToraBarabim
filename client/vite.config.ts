import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import { SITE_ORIGIN } from './consts';

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_ORIGIN}/</loc>
  </url>
</urlset>
`;

// Placeholder sitemap: one entry because one public URL exists today. Grows
// to one entry per city and per rabbi page once those routes ship.
const seoFiles = (): Plugin => ({
  name: 'seo-files',
  transformIndexHtml: (html) => html.replaceAll('%SITE_ORIGIN%', SITE_ORIGIN),
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt });
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml });
  },
});

export default defineConfig({
  plugins: [react(), seoFiles()],
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
