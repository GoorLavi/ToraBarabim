import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { PlaceListResponse } from '@torabarabim/common';
import type { HeadersFunction, MetaFunction } from 'react-router';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { StateCard } from '~/components/StateCard/StateCard';
import { LOAD_ERROR_BODY, LOAD_ERROR_HEADING, PLACES_QUERY_KEYS, RETRY_LABEL } from '~/PlacesPage/consts';
import { PlacesPage } from '~/PlacesPage/PlacesPage';

import { SITE_ORIGIN } from '../../consts';
import * as consts from './consts';
import { DEFAULT_OG_IMAGE_META, SITE_WIDE_META_BASE } from './meta';
import { loadPlaceDirectory } from './places.server';

// The place directory: a crawler landing here has to see every registered
// venue in the HTML, not only after a client-side query fires.
export const loader = async (): Promise<PlaceListResponse> => loadPlaceDirectory();

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}/places`;
  const title = consts.placesPageTitle();
  const description = consts.placesPageDescription(data);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META_BASE,
    ...DEFAULT_OG_IMAGE_META,
    { 'script:ld+json': consts.placesItemListJsonLd(data) },
  ];
};

export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function PlacesRoute({ loaderData }: { loaderData: PlaceListResponse }) {
  // Seeds the same key `usePlaceDirectory` reads (PlacesPage/usePlaceDirectory.ts),
  // so the board's first paint already has the loader's data and never
  // re-fetches on hydration. Mirrors cities.tsx and rabbis.tsx.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(PLACES_QUERY_KEYS.directory(), loaderData.items);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlacesPage />
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
        heading={LOAD_ERROR_HEADING}
        body={LOAD_ERROR_BODY}
        action={{
          actionLabel: RETRY_LABEL,
          actionStyle: 'primary',
          onAction: () => {
            trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'placesRoute' });
            window.location.reload();
          },
        }}
      />
    </main>
  );
}
