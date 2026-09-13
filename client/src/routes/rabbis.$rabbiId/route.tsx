import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { RabbiDetailResponse } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
import * as rabbiPageConsts from '~/RabbiPage/consts';
import { RabbiPage } from '~/RabbiPage/RabbiPage';

import { toRabbiDetailResponse } from '../../../../server/src/convertors/rabbi-directory';
import { RabbiNotFoundError } from '../../../../server/src/service/rabbi/errors';
import * as rabbiService from '../../../../server/src/service/rabbi/rabbi';
import { SITE_ORIGIN } from '../../../consts';
import * as consts from './consts';

// The one loader in this migration that calls a service directly: same
// process, same config and database connection the rest of the API uses,
// no HTTP round trip back to this app's own server. Every other route
// still fetches client-side through react-query, unchanged.
export const loader = async ({ params }: LoaderFunctionArgs): Promise<RabbiDetailResponse> => {
  const { rabbiId } = params;
  if (!rabbiId) {
    throw new Response('רב לא נמצא', { status: 404 });
  }

  try {
    const record = await rabbiService.getById(rabbiId);
    return toRabbiDetailResponse(record);
  } catch (error) {
    if (error instanceof RabbiNotFoundError) {
      throw new Response('רב לא נמצא', { status: 404 });
    }
    throw error;
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}/rabbis/${encodeURIComponent(data.id)}`;
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
  ];
};

// Behind the CDN with a short, revalidated max-age: a rabbi's lesson count
// and photo change rarely, so caching this for a minute keeps most requests
// off this container without serving stale data for long.
export const headers: HeadersFunction = () => ({
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
});

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
