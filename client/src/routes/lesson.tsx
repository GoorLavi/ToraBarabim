import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { LessonOccurrence } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';
import { SITE_WIDE_META } from '~/consts';
import { lessonPath } from '~/helpers';
import * as lessonPageConsts from '~/LessonPage/consts';
import { teachingRabbiOf } from '~/LessonPage/helpers';
import { LessonPage } from '~/LessonPage/LessonPage';
import type { AreaPreview } from '~/LessonPage/models';

import { AREA_PREVIEW_LIMIT } from '../../../server/src/service/lesson/consts';
import { AREA_NAMES_HE, toAreaSlug } from '../../../server/src/service/shared/consts';
import { SITE_ORIGIN } from '../../consts';
import * as consts from './consts';
import { loadAreaLessonsPreview, loadLessonOccurrence } from './lesson.server';

interface LessonRouteData {
  occurrence: LessonOccurrence;
  // `areaName`, `areaSlug`, and `limit` are resolved synchronously from
  // `occurrence.place.area` and the server's own constant, so the heading and
  // the skeleton can paint before any query resolves. Only `lessons` is a
  // promise, never awaited here: the ticket is a 404 or a 500 without
  // `occurrence`, but the area preview's lessons are a below-the-fold nicety
  // that must never hold up the shell. The route component resolves it
  // inside a `Suspense` boundary.
  areaPreview: AreaPreview;
}

export const loader = async ({ params }: LoaderFunctionArgs): Promise<LessonRouteData> => {
  const { lessonId, date } = params;
  if (!lessonId || !date) {
    throw new Response('השיעור לא נמצא', { status: 404, headers: consts.UNCACHEABLE_ERROR_HEADERS });
  }

  const occurrence = await loadLessonOccurrence(lessonId, date);
  const areaPreview: AreaPreview = {
    areaName: AREA_NAMES_HE[occurrence.place.area],
    areaSlug: toAreaSlug(occurrence.place.area),
    limit: AREA_PREVIEW_LIMIT,
    lessons: loadAreaLessonsPreview(occurrence),
  };

  return { occurrence, areaPreview };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const { occurrence } = data;

  const teachingRabbi = teachingRabbiOf(occurrence);
  const url = `${SITE_ORIGIN}${lessonPath(occurrence)}`;
  const title = consts.lessonPageTitle(occurrence, teachingRabbi);
  const description = consts.lessonPageDescription(occurrence, teachingRabbi);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META,
    { 'script:ld+json': consts.lessonEventJsonLd(occurrence, teachingRabbi) },
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring
// rabbis.$rabbiId/route.tsx: `errorHeaders` carries whatever headers the
// loader's thrown Response set, which is why every throw in the loader and
// in lesson.server.ts sets `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function LessonRoute({ loaderData }: { loaderData: LessonRouteData }) {
  const { occurrence, areaPreview } = loaderData;

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
      <LessonPage {...{ areaPreview }} />
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
