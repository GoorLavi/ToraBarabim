import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { RabbiDirectoryResponse } from '@torabarabim/common';
import type { HeadersFunction, MetaFunction } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
import { SITE_WIDE_META } from '~/consts';
import { DIRECTORY_COPY, LOAD_ERROR_BODY, RABBIS_QUERY_KEYS, RETRY_LABEL } from '~/RabbisPage/consts';
import { RabbisPage } from '~/RabbisPage/RabbisPage';

import { SITE_ORIGIN } from '../../consts';
import * as consts from './consts';
import { loadRabbiDirectory } from './rabbis.server';

// Mirrors rabbis.tsx: no query string read, so a crawler landing here always
// sees the same unfiltered rabbaniyot directory.
export const loader = async (): Promise<RabbiDirectoryResponse> => loadRabbiDirectory('women');

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}/women/rabbaniyot`;
  const title = consts.womenRabbaniyotPageTitle();
  const description = consts.womenRabbaniyotPageDescription(data);

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

// Behind the CDN with a short, revalidated max-age, mirroring rabbis.tsx:
// `errorHeaders` carries whatever headers the loader's thrown Response set,
// which is why the failure path in rabbis.server.ts sets `Cache-Control:
// no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function WomenRabbaniyotRoute({ loaderData }: { loaderData: RabbiDirectoryResponse }) {
  // Seeds the same key `useRabbiDirectory` reads (RabbisPage/useRabbiDirectory.ts),
  // which holds the flattened `RabbiDirectoryEntry[]` that hook assembles
  // client-side, not the raw paginated response: seeding `loaderData.items`
  // matches that shape exactly, so the first paint never re-fetches on
  // hydration. Mirrors rabbis.tsx.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(RABBIS_QUERY_KEYS.directory('rabbaniyot'), loaderData.items);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RabbisPage directory="rabbaniyot" />
    </HydrationBoundary>
  );
}

// Without a route-level boundary here, a loader failure would bubble past
// this route straight to root.tsx's, which has no `headers` export, and a
// 500 would go out with no Cache-Control at all. Mirrors rabbis.tsx.
export function ErrorBoundary() {
  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={DIRECTORY_COPY.rabbaniyot.loadErrorHeading}
        body={LOAD_ERROR_BODY}
        action={{ actionLabel: RETRY_LABEL, actionStyle: 'primary', onAction: () => window.location.reload() }}
      />
    </main>
  );
}
