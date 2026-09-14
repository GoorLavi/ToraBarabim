import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { LessonOccurrence } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';
import { lessonPath } from '~/helpers';
import * as lessonPageConsts from '~/LessonPage/consts';
import { teachingRabbiOf } from '~/LessonPage/helpers';
import { LessonPage } from '~/LessonPage/LessonPage';

import { SITE_ORIGIN } from '../../consts';
import * as consts from './consts';
import { loadLessonOccurrence } from './lesson.server';

export const loader = async ({ params }: LoaderFunctionArgs): Promise<LessonOccurrence> => {
  const { lessonId, date } = params;
  if (!lessonId || !date) {
    throw new Response('השיעור לא נמצא', { status: 404, headers: consts.UNCACHEABLE_ERROR_HEADERS });
  }

  return loadLessonOccurrence(lessonId, date);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const teachingRabbi = teachingRabbiOf(data);
  const url = `${SITE_ORIGIN}${lessonPath(data)}`;
  const title = consts.lessonPageTitle(data, teachingRabbi);
  const description = consts.lessonPageDescription(data, teachingRabbi);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { 'script:ld+json': consts.lessonEventJsonLd(data, teachingRabbi) },
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring
// rabbis.$rabbiId/route.tsx: `errorHeaders` carries whatever headers the
// loader's thrown Response set, which is why every throw in the loader and
// in lesson.server.ts sets `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? consts.PUBLIC_CACHE_HEADERS;

export default function LessonRoute({ loaderData }: { loaderData: LessonOccurrence }) {
  // Seeds the same key `useLessonOccurrence` reads (LessonPage/useLessonOccurrence.ts),
  // so the ticket's first paint already has the loader's data and never
  // re-fetches on hydration. Mirrors rabbis.$rabbiId/route.tsx.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(lessonPageConsts.LESSON_PAGE_QUERY_KEYS.occurrence(loaderData.lessonId, loaderData.date), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LessonPage />
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
          onAction={() => window.location.reload()}
        />
      )}
    </main>
  );
}
