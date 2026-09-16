import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { WomenAreaResponse } from '@torabarabim/common';
import type { HeadersFunction, MetaFunction } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
import { SITE_WIDE_META } from '~/consts';
import { ERROR_BODY, ERROR_HEADING, RETRY_LABEL, WOMEN_PAGE_QUERY_KEYS } from '~/WomenPage/consts';
import { WomenPage } from '~/WomenPage/WomenPage';

import { SITE_ORIGIN } from '../../../consts';
import { PUBLIC_CACHE_HEADERS } from '../consts';
import * as consts from './consts';
import { loadWomenAreaSummary } from './women-area.server';

// Mirrors rabbis.tsx: the header's own date, city and search fields act in
// place on this page (WomenPage/WomenPage.tsx) rather than as a launch pad,
// but this loader never reads the request query string either way, so a
// crawler always sees the same unfiltered women's set summary. Only the
// rail's summary is seeded here (WOMEN_PAGE_QUERY_KEYS.summary()); the day
// groups themselves are fetched in the browser (useWomenLessons), the same
// split CityPage's own city-detail loader does not need because that page's
// rail and its lessons come from the same single request.
export const loader = async (): Promise<WomenAreaResponse> => loadWomenAreaSummary();

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}/women`;

  return [
    { title: consts.WOMEN_PAGE_TITLE },
    { name: 'description', content: consts.WOMEN_PAGE_DESCRIPTION },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: consts.WOMEN_PAGE_TITLE },
    { property: 'og:description', content: consts.WOMEN_PAGE_DESCRIPTION },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META,
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring cities.tsx and
// rabbis.tsx: `errorHeaders` carries whatever headers the loader's thrown
// Response set, which is why the failure path in women-area.server.ts sets
// `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? PUBLIC_CACHE_HEADERS;

export default function WomenRoute({ loaderData }: { loaderData: WomenAreaResponse }) {
  // Seeds the same key `useWomenSummary` reads (WomenPage/useWomenSummary.ts),
  // so the rail's first paint already has the loader's data and never
  // re-fetches on hydration. Mirrors cities.tsx and rabbis.tsx; the page's
  // own lesson search is not seeded, since the loader never reads the date,
  // city or search filters the request may carry.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(WOMEN_PAGE_QUERY_KEYS.summary(), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WomenPage />
    </HydrationBoundary>
  );
}

// Without a route-level boundary here, a loader failure bubbles past this
// route straight to root.tsx's, which has no `headers` export, and a 500
// would go out with no Cache-Control at all instead of the `no-store` its
// thrown Response set. Mirrors cities.tsx's ErrorBoundary.
export function ErrorBoundary() {
  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={ERROR_HEADING}
        body={ERROR_BODY}
        action={{ actionLabel: RETRY_LABEL, actionStyle: 'primary', onAction: () => window.location.reload() }}
      />
    </main>
  );
}
