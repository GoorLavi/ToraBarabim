import { Suspense } from 'react';
import { Await } from 'react-router';

import { RailSkeleton } from '~/components/RailSkeleton/RailSkeleton';

import { ResolvedLessonRail } from './components/ResolvedLessonRail/ResolvedLessonRail';
import type { DeferredLessonRailProps } from './models';

// A row of lessons that loads after the page: the title and link are known
// at once, so the skeleton shows them and only the cards wait. A rejected
// promise (a truncated stream, a dropped connection) degrades to the same
// nothing as `unavailable`, instead of reaching the route's error boundary
// and replacing the whole lesson page over a nicety below the ticket.
// `errorElement` must be a non-null element that renders nothing: react-router
// rethrows a rejection to the route's error boundary when it is null.
export const DeferredLessonRail = ({ lessons, ...railProps }: DeferredLessonRailProps) => (
  <Suspense fallback={<RailSkeleton {...{ heading: { title: railProps.title, titleTo: railProps.titleTo } }} />}>
    <Await resolve={lessons} errorElement={<></>}>
      {(resolved) => <ResolvedLessonRail {...{ resolved, ...railProps }} />}
    </Await>
  </Suspense>
);
