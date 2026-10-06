import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { LessonOccurrenceDetail } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';
import { lessonPath } from '~/helpers';
import * as lessonPageConsts from '~/LessonPage/consts';
import { teachingRabbiOf } from '~/LessonPage/helpers';
import { LessonPage } from '~/LessonPage/LessonPage';
import type { AreaPreview, DeferredLessons } from '~/LessonPage/models';

import { SITE_ORIGIN } from '../../consts';
import * as consts from './consts';
import {
  loadAreaLessonsPreview,
  loadLessonOccurrence,
  loadRabbiUpcomingLessons,
  loadVenuePhoto,
  resolveAreaPreviewMeta,
} from './lesson.server';
import { entityImageMeta, SITE_WIDE_META_BASE } from './meta';

interface LessonRouteData {
  occurrence: LessonOccurrenceDetail;
  // `areaName` and `areaSlug` are resolved synchronously from
  // `occurrence.venue.area`, so the heading and the skeleton can paint before
  // any query resolves. Only `lessons` is a promise, never awaited here: the
  // ticket is a 404 or a 500 without `occurrence`, but both rows below it
  // (this one and `rabbiLessons`) are below-the-fold niceties that must never
  // hold up the shell. The route component resolves each inside its own
  // `Suspense` boundary.
  areaPreview: AreaPreview;
  rabbiLessons: Promise<DeferredLessons>;
  // Read by `meta` only, for the event JSON-LD's `location.image`; never by
  // the component itself, so it is not seeded into the hydrated query below.
  venuePhotoUrl: string | undefined;
}

export const loader = async ({ params }: LoaderFunctionArgs): Promise<LessonRouteData> => {
  const { lessonId, date } = params;
  if (!lessonId || !date) {
    throw new Response('השיעור לא נמצא', { status: 404, headers: consts.UNCACHEABLE_ERROR_HEADERS });
  }

  const now = new Date();
  const occurrence = await loadLessonOccurrence(lessonId, date, now);
  // Both deferred reads start before the photo lookup is awaited, so neither
  // waits behind it.
  const areaPreview: AreaPreview = {
    ...resolveAreaPreviewMeta(occurrence),
    lessons: loadAreaLessonsPreview(occurrence, now),
  };
  const rabbiLessons = loadRabbiUpcomingLessons(occurrence, now);
  const venuePhotoUrl = await loadVenuePhoto(occurrence);

  return { occurrence, areaPreview, rabbiLessons, venuePhotoUrl };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { occurrence, venuePhotoUrl } = data;

  const teachingRabbi = teachingRabbiOf(occurrence);
  const url = `${SITE_ORIGIN}${lessonPath(occurrence)}`;
  const title = consts.lessonPageTitle(occurrence, teachingRabbi);
  const description = consts.lessonPageDescription(occurrence, teachingRabbi);

  // A date that already took place stays reachable (a crawler or a shared
  // link still lands on it) but leaves the index and drops its Event block,
  // which would otherwise advertise a scheduled event that is over. `follow`
  // stays at its default so the rabbi row's links to coming dates are
  // followed.
  const hasTakenPlace = occurrence.timing === 'tookPlace';

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META_BASE,
    ...entityImageMeta(teachingRabbi.photoUrl),
    ...(hasTakenPlace
      ? [{ name: 'robots', content: 'noindex' }]
      : [{ 'script:ld+json': consts.lessonEventJsonLd(occurrence, teachingRabbi, venuePhotoUrl) }]),
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring
// rabbis.$rabbiId/route.tsx: `errorHeaders` carries whatever headers the
// loader's thrown Response set, which is why every throw in the loader and
// in lesson.server.ts sets `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function LessonRoute({ loaderData }: { loaderData: LessonRouteData }) {
  const { occurrence, areaPreview, rabbiLessons } = loaderData;

  // Seeds the same key `useLessonOccurrence` reads (LessonPage/useLessonOccurrence.ts),
  // so the ticket's first paint already has the loader's data and never
  // re-fetches on hydration. Mirrors rabbis.$rabbiId/route.tsx.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(lessonPageConsts.LESSON_PAGE_QUERY_KEYS.occurrence(occurrence.lessonId, occurrence.date), occurrence);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LessonPage {...{ areaPreview, rabbiLessons }} />
    </HydrationBoundary>
  );
}

// A lesson id or date that resolves to no occurrence is a real 404 (the
// loader above throws a 404 Response for it), rendered here instead of a
// pretty-but-wrong 200. Reuses LessonPage's own copy and its NotFoundScreen
// adapter (LessonPage.tsx renders the identical screen for the same two
// cases on a client-side query failure), so the two paths never describe
// the same failure differently.
export function ErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main>
      {isNotFound ? (
        <NotFoundScreen
          heading={lessonPageConsts.NOT_FOUND_HEADING}
          explanation={lessonPageConsts.NOT_FOUND_EXPLANATION}
          actionLabel={lessonPageConsts.ALL_LESSONS_LABEL}
          actionTo="/"
        />
      ) : (
        <NotFoundScreen
          heading={lessonPageConsts.SERVER_ERROR_HEADING}
          explanation={lessonPageConsts.SERVER_ERROR_EXPLANATION}
          actionLabel={lessonPageConsts.RETRY_LABEL}
          onAction={() => {
            trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'lessonRoute' });
            window.location.reload();
          }}
        />
      )}
    </main>
  );
}
