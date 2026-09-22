import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { MetaFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import styled, { ThemeProvider } from 'styled-components';

import { Analytics } from '~/analytics/Analytics';
import { DEFAULT_OG_IMAGE_META, SITE_WIDE_META_BASE } from '~/routes/meta';
import { GlobalStyle } from '~/styles/GlobalStyle';
import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_ORIGIN } from '../consts';
import * as rootConsts from './root.consts';
import * as rootStyles from './root.styles';

// The home page's meta, and the fallback for a route that exports none.
// React Router replaces this array wholesale rather than merging by key: the
// deepest route exporting `meta` wins entirely, so a route with its own gets
// nothing from here, and a route without one inherits all of it verbatim.
// That second case is why every public route must export `meta`: inheriting
// this array means inheriting a canonical that points at `/`, which tells a
// crawler the page is a copy of the home page. `routes/consts.ts` holds the
// sitewide entries each route spreads back in.
export const meta: MetaFunction = () => [
  { title: DEFAULT_TITLE },
  { name: 'description', content: DEFAULT_DESCRIPTION },
  { tagName: 'link', rel: 'canonical', href: `${SITE_ORIGIN}/` },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: DEFAULT_TITLE },
  { property: 'og:description', content: DEFAULT_DESCRIPTION },
  { property: 'og:url', content: `${SITE_ORIGIN}/` },
  ...SITE_WIDE_META_BASE,
  ...DEFAULT_OG_IMAGE_META,
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
        {/* ThemeProvider lives here, not in Root below, because React Router
            renders this Layout for both the normal tree and the root-level
            ErrorBoundary: an error attributed to the root route substitutes
            ErrorBoundary for Root's element entirely, so a provider that only
            wrapped Root's own render never reached it, and any styled-
            component in the error tree reading `theme` threw. */}
        <ThemeProvider theme={ARGAMAN_VE_ZAHAV_THEME}>
          <GlobalStyle />
          {/* `#root` matches GlobalStyle's `html, body, #root { height: 100% }`
              selector, kept so that rule needs no change for this migration. */}
          <div id="root">{children}</div>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
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
    <QueryClientProvider client={queryClient}>
      <Analytics />
      <Outlet />
    </QueryClientProvider>
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
