import { Suspense } from 'react';
import { Await } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LessonsGrid } from '~/components/LessonsGrid/LessonsGrid';
import { LessonsGridSkeleton } from '~/components/LessonsGridSkeleton/LessonsGridSkeleton';
import { StateCard } from '~/components/StateCard/StateCard';
import { areaLinkLabel } from '~/consts';
import { areaPath } from '~/helpers';
import * as pageConsts from '~/LessonPage/consts';

import { PREVIEW_MAX_COLUMNS } from './consts';
import type { AreaLessonsPreviewProps, ResolvedAreaLessonsPreviewProps } from './models';
import * as styles from './styles';

// Shared by every state's heading link below: same viewBox, path, stroke and
// round caps as `.otherLessons` and `AreaLink`.
const CHEVRON = (
  <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// The section's only heading: an `h2` whose sole child is the link, so there
// is one string and one 48px target rather than a heading plus a see-all
// link repeating it (designer's spec, round 3). Rendered identically by all
// three visible states below, since `areaName`/`areaSlug` are synchronous.
const AreaHeading = ({ areaName, areaSlug }: { areaName: string; areaSlug: string }) => (
  <h2 className="heading" dir="auto">
    <Link className="headingLink" to={areaPath({ slug: areaSlug })}>
      {areaLinkLabel(areaName)}
      {CHEVRON}
    </Link>
  </h2>
);

// Renders its own <section> (or nothing) rather than the parent wrapping one
// unconditionally, so an empty or unavailable preview leaves no empty,
// gap-consuming section behind (LOCKED PLAN, "which renders nothing";
// design-system.md, "there is never a heading over an empty rail").
const ResolvedAreaLessonsPreview = ({ className, areaName, areaSlug, lessons }: ResolvedAreaLessonsPreviewProps) => {
  if (lessons.kind === 'unavailable') return null;

  if (lessons.items.length === 0) {
    return (
      <section className={className}>
        <AreaHeading {...{ areaName, areaSlug }} />
        <StateCard
          variant="empty"
          headingLevel="h3"
          heading={pageConsts.AREA_PREVIEW_EMPTY_HEADING}
          body={pageConsts.AREA_PREVIEW_EMPTY_BODY}
        />
      </section>
    );
  }

  return (
    <section className={className}>
      <AreaHeading {...{ areaName, areaSlug }} />

      <LessonsGrid
        className="grid"
        {...{ items: lessons.items, surface: 'general', clickSurface: 'lessonPage', maxColumns: PREVIEW_MAX_COLUMNS }}
      />
    </section>
  );
};

// Sits between LessonDetails and the back link (LessonPage.tsx). The heading
// link paints immediately from the loader's synchronous `areaName`/
// `areaSlug`/`limit` (LOCKED PLAN, "the section heading paints immediately"):
// the `Suspense` fallback below renders it directly, and only the grid
// itself waits on `areaPreview.lessons`, whose fallback reuses the existing
// `LessonsGridSkeleton` rather than a second, bespoke one.
//
// `<Await errorElement={null}>` degrades a rejected `lessons` promise (a
// truncated SSR stream, a dropped connection, entry.server.tsx's own abort)
// the same way `kind: 'unavailable'` does, instead of letting the rejection
// reach the route's `ErrorBoundary` and replace the whole lesson page over a
// below-the-fold nicety.
export const AreaLessonsPreview = styled(({ className, areaPreview }: AreaLessonsPreviewProps) => {
  const { areaName, areaSlug, limit, lessons } = areaPreview;

  return (
    <Suspense
      fallback={
        <section className={className}>
          <AreaHeading {...{ areaName, areaSlug }} />
          <LessonsGridSkeleton className="skeleton" {...{ cellCount: limit, maxColumns: PREVIEW_MAX_COLUMNS }} />
        </section>
      }
    >
      <Await resolve={lessons} errorElement={null}>
        {(resolvedLessons) => (
          <ResolvedAreaLessonsPreview className={className} {...{ areaName, areaSlug, lessons: resolvedLessons }} />
        )}
      </Await>
    </Suspense>
  );
})`
  ${styles.AreaLessonsPreview}
`;
