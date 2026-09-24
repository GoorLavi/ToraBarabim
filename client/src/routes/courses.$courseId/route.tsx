import { useState } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { CourseDetailResponse } from '@torabarabim/common';
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { isRouteErrorResponse, redirect, useRouteError } from 'react-router';

import { StateCard } from '~/components/StateCard/StateCard';
// `CoursePage` is tora-client's pass 1 (build tracker #5, queued): this
// import is written against the plan's shape and does not resolve until it
// lands, the same way `coursePath` did not until pass 1a landed it.
import { CoursePage } from '~/CoursePage/CoursePage';
import * as coursePageConsts from '~/CoursePage/consts';
import { coursePath } from '~/helpers';

import { SITE_ORIGIN } from '../../../consts';
import { PUBLIC_CACHE_HEADERS, UNCACHEABLE_ERROR_HEADERS } from '../consts';
import { SITE_WIDE_META_BASE } from '../meta';
import * as consts from './consts';
import { loadCourseDetail } from './course-detail.server';

// Resolution is by id alone; the slug is decoration, derived at read time
// like a rabbi's rather than a stored column (plan, consult report 3.1: a
// rename then needs no slug write). A bare-id link, a typo, or a renamed
// course all land here and get the same permanent redirect to the current
// canonical URL, mirroring rabbis.$rabbiId/route.tsx.
export const loader = async ({ params }: LoaderFunctionArgs): Promise<CourseDetailResponse> => {
  const { courseId, slug } = params;
  if (!courseId) {
    throw new Response('הקורס לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
  }

  const data = await loadCourseDetail(courseId, new Date());

  if (slug !== data.slug) {
    throw redirect(coursePath(data), { status: 301, headers: PUBLIC_CACHE_HEADERS });
  }

  return data;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const url = `${SITE_ORIGIN}${coursePath(data)}`;
  const title = consts.coursePageTitle(data);
  const description = consts.coursePageDescription(data);

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...SITE_WIDE_META_BASE,
    // Unconditional, unlike the place page's own og:image: a course's cover
    // is required at creation (server: `cover_key NOT NULL`), never absent
    // the way a place's photo can be.
    { property: 'og:image', content: data.coverUrl },
    { 'script:ld+json': consts.courseJsonLd(data, url) },
    // Registration closed, by the calendar, by hand, or marked full, is
    // permanent (plan 1.7): the page stays reachable by direct link, but is
    // no longer worth a crawler's attention, and it already left the
    // sitemap the same day (sitemap.server.ts).
    ...(data.state.status === 'closed' ? [{ name: 'robots', content: 'noindex' }] : []),
  ];
};

// Behind the CDN with a short, revalidated max-age, mirroring
// rabbis.$rabbiId/route.tsx: `errorHeaders` carries whatever headers the
// loader's thrown Response set, which is why every throw in the loader and
// in course-detail.server.ts sets `Cache-Control: no-store` itself.
export const headers: HeadersFunction = ({ errorHeaders }) => errorHeaders ?? PUBLIC_CACHE_HEADERS;

export default function CourseRoute({ loaderData }: { loaderData: CourseDetailResponse }) {
  // A scratch QueryClient, used only to build the payload `HydrationBoundary`
  // merges into the real, ambient client from root.tsx. Seeds the same key
  // CoursePage's own hook is expected to read, mirroring
  // rabbis.$rabbiId/route.tsx.
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(coursePageConsts.COURSE_PAGE_QUERY_KEYS.detail(loaderData.id), loaderData);
    return client;
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CoursePage />
    </HydrationBoundary>
  );
}

// A course id that does not exist is a real 404 (the loader above throws
// one), rendered here instead of a pretty-but-wrong 200. There is no
// courses index page (plan, scope check 1.6) to link back to, so both
// cases point home.
export function ErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main>
      <StateCard
        variant="surface"
        headingLevel="h1"
        heading={isNotFound ? consts.NOT_FOUND_HEADING : consts.ERROR_HEADING}
        body={isNotFound ? consts.NOT_FOUND_BODY : consts.ERROR_BODY}
        action={{ actionLabel: consts.BACK_TO_HOME_LABEL, actionStyle: 'primary', actionTo: '/' }}
      />
    </main>
  );
}
