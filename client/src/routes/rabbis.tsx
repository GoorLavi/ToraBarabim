import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { RabbiDirectoryResponse } from '@torabarabim/common';
import type { HeadersFunction, MetaFunction } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
import { LOAD_ERROR_BODY, LOAD_ERROR_HEADING, RABBIS_QUERY_KEYS, RETRY_LABEL } from '~/RabbisPage/consts';
import { RabbisPage } from '~/RabbisPage/RabbisPage';

import { SITE_ORIGIN, SITE_WIDE_META } from '../../consts';
import * as consts from './consts';
import { loadRabbiDirectory } from './rabbis.server';

// Decision 0012's reasoning, same as home.tsx: the index's search field is
// local component state, never the query string (RabbisPage/RabbisPage.tsx),
// but this loader never reads the request either way, so a crawler landing
// on /rabbis always sees the same unfiltered first page of the directory.
export const loader = async (): Promise<RabbiDirectoryResponse> => loadRabbiDirectory();

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}/rabbis`;
  const title = consts.rabbisPageTitle();
  const description = consts.rabbisPageDescription(data);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META,
    { 'script:ld+json': consts.rabbisItemListJsonLd(data) },
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring cities.tsx:
// `errorHeaders` carries whatever headers the loader's thrown Response set,
// which is why the failure path in rabbis.server.ts sets `Cache-Control:
// no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function RabbisRoute({ loaderData }: { loaderData: RabbiDirectoryResponse }) {
  // Seeds the same key `useRabbiDirectory` reads (RabbisPage/useRabbiDirectory.ts),
  // which holds the flattened `RabbiDirectoryEntry[]` that hook assembles
  // client-side, not the raw paginated response: seeding `loaderData.items`
  // matches that shape exactly, so the first paint never re-fetches on
  // hydration. If the directory ever grows past RABBI_DIRECTORY_PAGE_SIZE,
  // this seed (like the loader above) still only covers the first page;
  // the client hook fills in the remaining pages itself on the next fetch.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(RABBIS_QUERY_KEYS.all(), loaderData.items);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RabbisPage />
    </HydrationBoundary>
  );
}

// Without a route-level boundary here, a loader failure would bubble past
// this route straight to root.tsx's, which has no `headers` export, and a
// 500 would go out with no Cache-Control at all. Mirrors cities.tsx and
// home.tsx; the retry reloads the document since there is no in-page query
// to refetch when the loader itself failed.
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
