import { buildSitemapResponse } from './sitemap.server';

// A resource route: no default export, no `meta`, no `headers` export.
// React Router serves a leaf route's own returned `Response` as the whole
// HTTP response when that route has no component to render, so this file's
// entire job is naming which loader answers `/sitemap.xml` (routes.ts); the
// content type and caching headers live on the `Response` itself, built in
// sitemap.server.ts.
export const loader = (): Promise<Response> => buildSitemapResponse();
