import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { HomeResponse } from '@torabarabim/common';
import type { HeadersFunction } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
import { HOME_QUERY_KEYS } from '~/HomePage/consts';
import { HomePage } from '~/HomePage/HomePage';

import * as consts from './consts';
import { loadHome } from './home.server';

// Decision 0012: the page has exactly two modes, and only the unfiltered
// rows are what a crawler landing on `/` should see, so this always loads
// them regardless of the request's own query string. A URL that already
// carries a date, city, or search filter still renders that filtered list
// through the existing client-side query (HomePage/useLessonSearch). The
// seeded response is still read in that mode: it carries the women's-area
// count the band shows in both modes.
export const loader = async (): Promise<HomeResponse> => loadHome();

export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function HomeRoute({ loaderData }: { loaderData: HomeResponse }) {
  // Seeds the same query key `useHomeRows` reads (HomePage/useHomeRows.ts),
  // so the rail's first paint already has the loader's data and never
  // re-fetches on hydration. Mirrors rabbis.$rabbiId/route.tsx.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(HOME_QUERY_KEYS.homeRows(), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}

// Without a route-level boundary here, a loader failure bubbles past this
// route (it has none of its own `context.errors` entry) straight to
// root.tsx's, which has no `headers` export: `errorHeaders` would then never
// reach the `headers` function above, and a 500 would go out with no
// Cache-Control at all instead of the `no-store` its thrown Response set.
export function ErrorBoundary() {
  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={consts.HOME_ERROR_HEADING}
        body={consts.HOME_ERROR_BODY}
        action={{
          actionLabel: consts.HOME_ERROR_RELOAD_LABEL,
          actionStyle: 'primary',
          onAction: () => window.location.reload(),
        }}
      />
    </main>
  );
}
