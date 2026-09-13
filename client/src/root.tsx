import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { MetaFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import styled, { ThemeProvider } from 'styled-components';

import { GlobalStyle } from '~/styles/GlobalStyle';
import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { CLOUDFLARE_ANALYTICS_TOKEN, DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_ORIGIN } from '../consts';
import * as rootConsts from './root.consts';
import * as rootStyles from './root.styles';

// The sitewide default. A route with its own `meta` export (currently only
// the rabbi page) replaces the entries whose `title`/`name`/`property` key
// matches; React Router does not merge a child's meta into a parent's, so
// every other route falls through to exactly this array.
export const meta: MetaFunction = () => [
  { title: DEFAULT_TITLE },
  { name: 'description', content: DEFAULT_DESCRIPTION },
  { tagName: 'link', rel: 'canonical', href: `${SITE_ORIGIN}/` },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:title', content: DEFAULT_TITLE },
  { property: 'og:description', content: DEFAULT_DESCRIPTION },
  { property: 'og:url', content: `${SITE_ORIGIN}/` },
  { property: 'og:locale', content: 'he_IL' },
  { name: 'twitter:card', content: 'summary' },
];

const WEBSITE_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  inLanguage: 'he',
});

// Framework mode owns the document: this replaces index.html. `<Meta />`
// and `<Links />` render each route's `meta`/`links` exports; `<Scripts />`
// and `<ScrollRestoration />` are the framework's client runtime.
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/*
          Assistant, weights 400/600/700 only (design-system.md, Type): the
          family's thin weights fail this audience, so the `wght` range below
          excludes them. Linked rather than self-hosted: the site is read
          mostly on phones, so the request goes through a font host's shared,
          already-warm cache and CDN rather than adding font binaries and
          subsetting to this repo's build.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }} />
        <Meta />
        <Links />
      </head>
      <body>
        {/* `#root` matches GlobalStyle's `html, body, #root { height: 100% }`
            selector, kept so that rule needs no change for this migration. */}
        <div id="root">{children}</div>
        <ScrollRestoration />
        <Scripts />
        {/*
          Cloudflare Web Analytics. Fails closed in dev: `import.meta.env.PROD`
          is true only in a built bundle, never under the Vite dev server, so
          a local session never reports a page view into the real dashboard.
          The token is public by design (client/consts.ts).
        */}
        {import.meta.env.PROD && (
          <script
            type="module"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${CLOUDFLARE_ANALYTICS_TOKEN}", "spa": true}`}
          />
        )}
      </body>
    </html>
  );
}

export default function Root() {
  // One QueryClient per render: a request on the server, a mount on the
  // client. A module-scope singleton (the SPA's old shape) would be shared
  // by every concurrent request on the server and leak one visitor's cached
  // data into another's response.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } }),
  );

  return (
    <ThemeProvider theme={ARGAMAN_VE_ZAHAV_THEME}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const ErrorFallback = styled.div`
  ${rootStyles.ErrorFallback}
`;

// Supersedes the class-based App/components/ErrorBoundary: a route-level
// export is the framework's own mechanism for the same job, so the
// hand-rolled version is deleted rather than kept alongside it. This is the
// last resort for an error a route's own ErrorBoundary did not catch; a
// render failure severe enough to reach here still gets a themed, readable
// page instead of a blank one.
export function ErrorBoundary() {
  return (
    <ErrorFallback>
      <p className="message">{rootConsts.ERROR_BOUNDARY_MESSAGE}</p>
      <button type="button" className="reload" onClick={() => window.location.reload()}>
        {rootConsts.ERROR_BOUNDARY_RELOAD_LABEL}
      </button>
    </ErrorFallback>
  );
}
