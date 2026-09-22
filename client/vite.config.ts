import { fileURLToPath } from 'node:url';

import { reactRouter } from '@react-router/dev/vite';
import { defineConfig, type Plugin } from 'vite';

import { SITE_ORIGIN } from './consts.ts';

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /rabbi/
Disallow: /place/
Disallow: /login

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

// `sitemap.xml` is a resource route now (client/src/routes/sitemap.ts),
// built from the database on every request instead of emitted once here: a
// rabbi or a city added after this build would otherwise stay invisible to
// crawlers until the next deploy. `robots.txt` carries no per-record data,
// so it stays a build-time file.
// `%SITE_ORIGIN%` text substitution is gone with index.html: root.tsx and
// each route's `meta` now interpolate SITE_ORIGIN directly in JS.
const seoFiles = (): Plugin => ({
  name: 'seo-files',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt });
  },
});

// Route loaders import server services, so `loadConfig` (server/src/config.ts)
// runs inside this dev server's SSR and needs the repo-root `.env` in
// `process.env`. Vite cannot supply it: `@react-router/dev` sets
// `envFile: false`, and Vite's own `.env` loading only ever reaches
// `import.meta.env` for `VITE_`-prefixed keys in client code. So this
// workspace's `dev` script wraps vite in `node --env-file=../.env`, the same
// way every `server` script does.
export default defineConfig({
  plugins: [reactRouter(), seoFiles()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  ssr: {
    // styled-components ships old-style dual entry points (`main` for CJS,
    // `module` for ESM) with no `exports` map. Left external, Vite's server
    // bundle resolves it one way for its own analysis and requires it
    // another way at runtime, so the default-export interop breaks
    // (`styled.default.div is not a function`). Bundling it here routes both
    // through Vite's own, consistent interop instead.
    noExternal: ['styled-components'],
  },
  environments: {
    ssr: {
      // styled-components' ESM build (its `module` entry, which Vite picks
      // for SSR) carries one bare `require("stream")`, inside the
      // `interleaveWithNodeStream` path entry.server.tsx renders every page
      // through. The built server is CommonJS (react-router.config.ts), so
      // `require` exists there and production never meets this; the dev
      // server evaluates that file as ESM, where the call throws and the
      // request hangs with no response at all. Pre-bundling resolves the
      // package's CJS `main` instead and rewrites that call into a real
      // import. React stays excluded so the pre-bundle imports the same
      // instance react-dom/server renders with, rather than bundling a
      // second copy and nulling the hook dispatcher.
      optimizeDeps: {
        include: ['styled-components'],
        exclude: ['react', 'react-dom'],
      },
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
