import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { CityDirectoryResponse } from '@torabarabim/common';
import type { HeadersFunction, MetaFunction } from 'react-router';

import { CitiesPage } from '~/CitiesPage/CitiesPage';
import { CITIES_QUERY_KEYS, LOAD_ERROR_BODY, LOAD_ERROR_HEADING, RETRY_LABEL } from '~/CitiesPage/consts';
import { StateCard } from '~/components/StateCard/StateCard';

import { SITE_ORIGIN } from '../../consts';
import * as consts from './consts';
import { loadCityDirectory } from './cities.server';

// The area index: a crawler landing here has to see every city and area
// name in the HTML, not only after the client-side query in
// CitiesPage/useCityDirectory.ts fires.
export const loader = async (): Promise<CityDirectoryResponse> => loadCityDirectory();

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}/cities`;
  const title = consts.citiesPageTitle();
  const description = consts.citiesPageDescription(data);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...consts.SITE_WIDE_META,
    { 'script:ld+json': consts.citiesItemListJsonLd(data) },
  ];
};

export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function CitiesRoute({ loaderData }: { loaderData: CityDirectoryResponse }) {
  // Seeds the same key `useCityDirectory` reads (CitiesPage/useCityDirectory.ts),
  // so the board's first paint already has the loader's data and never
  // re-fetches on hydration. Mirrors home.tsx and rabbis.$rabbiId/route.tsx.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(CITIES_QUERY_KEYS.directory(), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CitiesPage />
    </HydrationBoundary>
  );
}

// Without a route-level boundary here, a loader failure bubbles past this
// route straight to root.tsx's, which has no `headers` export, and a 500
// would go out with no Cache-Control at all instead of the `no-store` its
// thrown Response set. Mirrors home.tsx's ErrorBoundary.
export function ErrorBoundary() {
  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={LOAD_ERROR_HEADING}
        body={LOAD_ERROR_BODY}
        action={{ actionLabel: RETRY_LABEL, actionStyle: 'primary', onAction: () => window.location.reload() }}
      />
    </main>
  );
}
