import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, redirect, useRouteError } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
import { placePath } from '~/helpers';
import * as placePageConsts from '~/PlacePage/consts';
import { PlacePage } from '~/PlacePage/PlacePage';

import { SITE_ORIGIN } from '../../../consts';
import { PUBLIC_CACHE_HEADERS, UNCACHEABLE_ERROR_HEADERS } from '../consts';
import { SITE_WIDE_META_BASE } from '../meta';
import * as consts from './consts';
import { loadPlaceDetail } from './place-detail.server';
import type { PlaceRouteData } from './place-detail.server';

// Resolution is by id alone; the slug is decoration. A place renames itself
// from its own panel, so a stale slug and a bare-id link both land here and
// both get the same permanent redirect to the current canonical URL,
// mirroring rabbis.$rabbiId/route.tsx.
export const loader = async ({ params }: LoaderFunctionArgs): Promise<PlaceRouteData> => {
  const { placeId, slug } = params;
  if (!placeId) {
    throw new Response('המקום לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
  }

  const data = await loadPlaceDetail(placeId, new Date());

  if (slug !== data.place.slug) {
    throw redirect(placePath(data.place), { status: 301, headers: PUBLIC_CACHE_HEADERS });
  }

  return data;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { place, occurrences } = data;

  const url = `${SITE_ORIGIN}${placePath(place)}`;
  const title = consts.pageTitle(place.name, place.city);
  const description = consts.pageDescription(place, occurrences);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META_BASE,
    // No fallback to the sitewide logo: a place with no photo of its own
    // omits `og:image` entirely, so the collapsing photo band on the page
    // and the social preview agree by construction.
    ...(place.photoUrl ? [{ property: 'og:image', content: place.photoUrl }] : []),
    { 'script:ld+json': consts.placeJsonLd(place, url) },
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring
// rabbis.$rabbiId/route.tsx: `errorHeaders` carries whatever headers the
// loader's thrown Response set, which is why every throw in the loader and
// in place-detail.server.ts sets `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? PUBLIC_CACHE_HEADERS;

export default function PlaceRoute({ loaderData }: { loaderData: PlaceRouteData }) {
  // A scratch QueryClient, used only to build the payload `HydrationBoundary`
  // merges into the real, ambient client from root.tsx. Seeds two keys: the
  // place record, and page one of its occurrence search in the exact shape
  // TanStack's `useInfiniteQuery` expects, so PlacePage's own "load more"
  // list (mirroring useLessonListPages, already shared by CityPage and
  // WomenPage) never re-fetches page one on hydration.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(placePageConsts.PLACE_PAGE_QUERY_KEYS.detail(loaderData.place.id), loaderData.place);
    client.setQueryData(placePageConsts.PLACE_PAGE_QUERY_KEYS.lessons(loaderData.place.id), {
      pages: [loaderData.occurrences],
      pageParams: [1],
    });
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlacePage />
    </HydrationBoundary>
  );
}

// A place id that does not resolve to an active place is a real 404 (the
// loader above throws a 404 Response for it, the same for a deactivated
// place as for one that never existed), rendered here instead of a
// pretty-but-wrong 200. Any other loader failure falls through to the same
// card with the generic copy, so this route never renders blank.
export function ErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={isNotFound ? placePageConsts.NOT_FOUND_HEADING : placePageConsts.ERROR_HEADING}
        body={isNotFound ? placePageConsts.NOT_FOUND_BODY : placePageConsts.ERROR_BODY}
        action={{ actionLabel: placePageConsts.ALL_PLACES_LABEL, actionStyle: 'primary', actionTo: '/places' }}
      />
    </main>
  );
}
