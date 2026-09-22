import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { CityDetailResponse } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, redirect, useRouteError } from 'react-router';

import * as cityPageConsts from '~/CityPage/consts';
import { CityPage } from '~/CityPage/CityPage';
import { StateCard } from '~/components/StateCard/StateCard';
import { cityPath } from '~/helpers';

import { SITE_ORIGIN } from '../../../consts';
import { PUBLIC_CACHE_HEADERS } from '../consts';
import { DEFAULT_OG_IMAGE_META, SITE_WIDE_META_BASE } from '../meta';
import * as consts from './consts';
import { loadCityDetail } from './city-detail.server';

// Resolution is by slug alone, normalised through `toSlug` behind the
// `.server` boundary (city-detail.server.ts). The old URL shape served the
// raw Hebrew city name, which normalises to today's canonical slug, so a
// stale link and today's canonical URL both resolve here and both get the
// same permanent redirect when the raw param does not already match the
// canonical slug, mirroring rabbis.$rabbiId/route.tsx. Resolving before
// redirecting means a junk slug 404s instead of redirecting to a 404.
export const loader = async ({ params }: LoaderFunctionArgs): Promise<CityDetailResponse> => {
  const rawSlug = params.slug ?? '';
  const data = await loadCityDetail(rawSlug);

  if (rawSlug !== data.slug) {
    throw redirect(cityPath(data), { status: 301, headers: PUBLIC_CACHE_HEADERS });
  }

  return data;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}${cityPath(data)}`;
  const title = consts.pageTitle(data.name);
  const description = consts.pageDescription(data);

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
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring
// rabbis.$rabbiId/route.tsx: `errorHeaders` carries whatever headers the
// loader's thrown Response set, which is why every throw in the loader and
// in city-detail.server.ts sets `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? PUBLIC_CACHE_HEADERS;

export default function CityRoute({ loaderData }: { loaderData: CityDetailResponse }) {
  // A scratch QueryClient, used only to build the payload `HydrationBoundary`
  // merges into the real, ambient client from root.tsx. Seeding the same key
  // `useCityDetail` reads means CityPage's first paint already has the
  // loader's data, so that hook never fires a redundant fetch on mount.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(cityPageConsts.CITY_PAGE_QUERY_KEYS.detail(loaderData.slug), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CityPage />
    </HydrationBoundary>
  );
}

// A city slug that resolves to nothing is a real 404 (the loader above
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
        heading={isNotFound ? cityPageConsts.NOT_FOUND_HEADING : cityPageConsts.ERROR_HEADING}
        body={isNotFound ? cityPageConsts.NOT_FOUND_BODY : cityPageConsts.ERROR_BODY}
        action={{ actionLabel: cityPageConsts.ALL_CITIES_LABEL, actionStyle: 'primary', actionTo: '/cities' }}
      />
    </main>
  );
}
