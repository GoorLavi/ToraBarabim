import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { RabbiDetailResponse } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, redirect, useRouteError } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
import { rabbiPath } from '~/helpers';
import * as rabbiPageConsts from '~/RabbiPage/consts';
import { RabbiPage } from '~/RabbiPage/RabbiPage';

import { SITE_ORIGIN, SITE_WIDE_META } from '../../../consts';
import { PUBLIC_CACHE_HEADERS, UNCACHEABLE_ERROR_HEADERS } from '../consts';
import * as consts from './consts';
import { loadRabbiDetail } from './rabbi-detail.server';

// The one loader in this migration that calls a service directly: same
// process, same config and database connection the rest of the API uses,
// no HTTP round trip back to this app's own server. Every other route
// still fetches client-side through react-query, unchanged. The service
// call itself lives in the sibling `.server` module (see there for why).
export const loader = async ({ params }: LoaderFunctionArgs): Promise<RabbiDetailResponse> => {
  const { rabbiId, slug } = params;
  if (!rabbiId) {
    throw new Response('רב לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
  }

  const data = await loadRabbiDetail(rabbiId);

  // Resolution is by id alone; the slug is decoration for the reader and
  // for search results. A bare-id link, a typo, or a rabbi whose name (and
  // therefore slug) changed since a link was shared all land here with a
  // slug that does not match the current one, and all get the same
  // permanent redirect to the current canonical URL, never a second render
  // path. `headers()` is not consulted for a redirect (React Router returns
  // it before rendering), so the caching decision is made here instead.
  if (slug !== data.slug) {
    throw redirect(rabbiPath(data), { status: 301, headers: PUBLIC_CACHE_HEADERS });
  }

  return data;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}${rabbiPath(data)}`;
  const title = consts.pageTitle(data.name);
  const description = consts.pageDescription(data);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'profile' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META,
    { 'script:ld+json': consts.personJsonLd(data, url) },
  ];
};

// Behind the CDN with a short, revalidated max-age: a rabbi's lesson count
// and photo change rarely, so caching this for a minute keeps most requests
// off this container without serving stale data for long. `errorHeaders`
// carries whatever headers the loader's thrown Response set (React Router's
// own signal that this match errored), which is why every throw in the
// loader and in `rabbi-detail.server.ts` sets `Cache-Control: no-store`
// itself: a transient failure such as the database being unreachable must
// never sit in the CDN with the success caching below.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? PUBLIC_CACHE_HEADERS;

export default function RabbiRoute({ loaderData }: { loaderData: RabbiDetailResponse }) {
  // A scratch QueryClient, used only to build the payload `HydrationBoundary`
  // merges into the real, ambient client from root.tsx. Seeding the same key
  // `useRabbiDetail` reads means RabbiPage's first paint already has the
  // loader's data, so that hook never fires a redundant fetch on mount.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(rabbiPageConsts.RABBI_PAGE_QUERY_KEYS.detail(loaderData.id), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RabbiPage />
    </HydrationBoundary>
  );
}

// A rabbi id that does not exist is a real 404 (the loader above throws a
// 404 Response for it), rendered here instead of the pretty-but-wrong 200
// the old client-only error state produced. Any other loader failure (for
// example the database being unreachable) falls through to the same card
// with the generic copy, so this route never renders blank.
export function ErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={isNotFound ? rabbiPageConsts.NOT_FOUND_HEADING : rabbiPageConsts.ERROR_HEADING}
        body={isNotFound ? rabbiPageConsts.NOT_FOUND_BODY : rabbiPageConsts.ERROR_BODY}
        action={{ actionLabel: rabbiPageConsts.ALL_RABBIS_LABEL, actionStyle: 'primary', actionTo: '/rabbis' }}
      />
    </main>
  );
}
