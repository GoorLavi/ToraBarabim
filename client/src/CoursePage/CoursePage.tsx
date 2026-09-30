import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { BackLink } from '~/components/BackLink/BackLink';
import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';
import { courseTopicLabel } from '~/helpers';

import { ClosedPanel } from './components/ClosedPanel/ClosedPanel';
import { ContactBar } from './components/ContactBar/ContactBar';
import { CourseFacts } from './components/CourseFacts/CourseFacts';
import { CourseGallery } from './components/CourseGallery/CourseGallery';
import { CoursePageSkeleton } from './components/CoursePageSkeleton/CoursePageSkeleton';
import { TeacherLine } from './components/TeacherLine/TeacherLine';
import { TeacherSection } from './components/TeacherSection/TeacherSection';
import * as consts from './consts';
import { courseErrorCopy } from './helpers';
import type { CoursePageProps } from './models';
import * as styles from './styles';
import { useCourseDetail } from './useCourseDetail';

// Mirrors LessonPage.tsx: its own query hook (hydrated from the loader's
// seeded cache, routes/courses.$courseId/route.tsx), its own skeleton while
// pending, and its own not-found/error screen for a client-side failure.
// The route's own `ErrorBoundary` is the separate, SSR-time 404/500 path.
//
// Below `lg` (1024) this is a single column and `ContactBar` renders as a
// fixed bottom bar; from `lg` up it is two columns, the facts-and-registration
// unit becoming a sticky side card (styles.ts, design brief A). `ClosedPanel`
// renders twice, real and mirrored (the same technique `Ornament` uses):
// once right under the name for the single-column layout, once inside the
// side card for the two-column one, CSS choosing which is visible.
export const CoursePage = styled(({ className }: CoursePageProps) => {
  const { courseId = '' } = useParams();
  const query = useCourseDetail(courseId);
  const course = query.data;
  const errorCopy = query.error ? courseErrorCopy(query.error) : null;

  return (
    <main className={className}>
      <BackLink {...{ to: '/', label: consts.BACK_TO_HOME_LABEL }} />

      {query.isPending && <CoursePageSkeleton />}

      {errorCopy && (
        <>
          {errorCopy.kind === 'not-found' ? (
            <NotFoundScreen
              {...{ heading: errorCopy.heading, explanation: errorCopy.explanation, actionLabel: consts.BACK_TO_HOME_LABEL, actionTo: '/' }}
            />
          ) : (
            <NotFoundScreen
              {...{
                heading: errorCopy.heading,
                explanation: errorCopy.explanation,
                actionLabel: consts.RETRY_LABEL,
                onAction: () => query.refetch(),
              }}
            />
          )}
        </>
      )}

      {course && (
        <div className="layout">
          <div className="storyColumn">
            <CourseGallery {...{ courseName: course.name, photos: [{ id: 'cover', url: course.coverUrl }, ...course.photos] }} />

            <div className="heading">
              {(course.cycle !== undefined || course.topic) && (
                <div className="tags">
                  {course.topic && (
                    <span className="tag topicTag" dir="auto">
                      {courseTopicLabel(course.topic)}
                    </span>
                  )}
                  {course.cycle !== undefined && <span className="tag cycleTag">{consts.cycleLabel(course.cycle)}</span>}
                </div>
              )}

              <h1 className="title" dir="auto">
                {course.name}
              </h1>
            </div>

            <TeacherLine {...{ teacher: course.teacher }} />

            {course.state.status === 'closed' && (
              <ClosedPanel
                {...{ className: 'closedNearTop', reason: course.state.reason, openingDate: course.openingDate, weeks: course.weeks, teacher: course.teacher }}
              />
            )}

            {/* Phone only (styles.ts): from `lg` up the facts live in the
                side card below instead, the same "render twice, CSS picks
                one" shape `ClosedPanel` already uses. */}
            <CourseFacts {...{ className: 'factsNearTop', course }} />

            <div className="about">
              <h2 className="aboutHeading">{consts.ABOUT_COURSE_HEADING}</h2>
              <p className="description" dir="auto">
                {course.description}
              </p>
            </div>

            <TeacherSection {...{ teacher: course.teacher }} />

            <BackLink {...{ to: '/', label: consts.BACK_TO_HOME_LABEL }} />
          </div>

          <div className="sideCard">
            <CourseFacts {...{ className: 'factsInCard', course }} />

            {course.state.status === 'closed' ? (
              <ClosedPanel
                {...{ className: 'closedInCard', reason: course.state.reason, openingDate: course.openingDate, weeks: course.weeks, teacher: course.teacher }}
              />
            ) : (
              <ContactBar {...{ courseId: course.id, courseName: course.name, contactPhone: course.state.contactPhone }} />
            )}
          </div>
        </div>
      )}
    </main>
  );
})`
  ${styles.CoursePage}
`;
