import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { AreaDetailResponse } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import * as areaPageConsts from '~/AreaPage/consts';
import { AreaPage } from '~/AreaPage/AreaPage';
import { StateCard } from '~/components/StateCard/StateCard';
import { areaPath } from '~/helpers';

import { SITE_ORIGIN, SITE_WIDE_META } from '../../../consts';
import { PUBLIC_CACHE_HEADERS, UNCACHEABLE_ERROR_HEADERS } from '../consts';
import * as consts from './consts';
import { loadAreaDetail } from './area-detail.server';

// The eight areas are a fixed enum with a slug computed from a fixed Hebrew
// label (`toAreaSlug`, server/src/service/shared/consts.ts), so unlike the
// city route there is no earlier URL shape to reconcile and no redirect to
// issue here.
export const loader = async ({ params }: LoaderFunctionArgs): Promise<AreaDetailResponse> => {
  const { slug } = params;
  if (!slug) {
    throw new Response('אזור לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
  }

  return loadAreaDetail(slug);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}${areaPath(data)}`;
  const title = consts.pageTitle(data.areaName);
  const description = consts.pageDescription(data);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META,
    { 'script:ld+json': consts.citiesItemListJsonLd(data) },
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring
// rabbis.$rabbiId/route.tsx: `errorHeaders` carries whatever headers the
// loader's thrown Response set, which is why every throw in the loader and
// in area-detail.server.ts sets `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? PUBLIC_CACHE_HEADERS;

export default function AreaRoute({ loaderData }: { loaderData: AreaDetailResponse }) {
  // A scratch QueryClient, used only to build the payload `HydrationBoundary`
  // merges into the real, ambient client from root.tsx. Seeding the same key
  // `useAreaDetail` reads means AreaPage's first paint already has the
  // loader's data, so that hook never fires a redundant fetch on mount.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(areaPageConsts.AREA_PAGE_QUERY_KEYS.detail(loaderData.slug), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AreaPage />
    </HydrationBoundary>
  );
}

// An area slug that resolves to nothing is a real 404 (the loader above
// throws a 404 Response for it), rendered here instead of a pretty-but-wrong
// 200. Any other loader failure falls through to the same card with the
// generic copy, so this route never renders blank.
export function ErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={isNotFound ? areaPageConsts.NOT_FOUND_HEADING : areaPageConsts.ERROR_HEADING}
        body={isNotFound ? areaPageConsts.NOT_FOUND_BODY : areaPageConsts.ERROR_BODY}
        action={{ actionLabel: areaPageConsts.ALL_CITIES_LABEL, actionStyle: 'primary', actionTo: '/cities' }}
      />
    </main>
  );
}
