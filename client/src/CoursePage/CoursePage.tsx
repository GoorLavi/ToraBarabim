import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { BackLink } from '~/components/BackLink/BackLink';
import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';

import { ClosedPanel } from './components/ClosedPanel/ClosedPanel';
import { ContactBar } from './components/ContactBar/ContactBar';
import { CourseFacts } from './components/CourseFacts/CourseFacts';
import { CourseGallery } from './components/CourseGallery/CourseGallery';
import { CoursePageSkeleton } from './components/CoursePageSkeleton/CoursePageSkeleton';
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
export const CoursePage = styled(({ className }: CoursePageProps) => {
  const { courseId = '' } = useParams();
  const query = useCourseDetail(courseId);
  const course = query.data;
  const errorCopy = query.error ? courseErrorCopy(query.error) : null;

  return (
    <main className={className}>
      <BackLink to="/" label={consts.BACK_TO_HOME_LABEL} />

      {query.isPending && <CoursePageSkeleton />}

      {errorCopy && (
        <>
          {errorCopy.kind === 'not-found' ? (
            <NotFoundScreen heading={errorCopy.heading} explanation={errorCopy.explanation} actionLabel={consts.BACK_TO_HOME_LABEL} actionTo="/" />
          ) : (
            <NotFoundScreen
              heading={errorCopy.heading}
              explanation={errorCopy.explanation}
              actionLabel={consts.RETRY_LABEL}
              onAction={() => query.refetch()}
            />
          )}
        </>
      )}

      {course && (
        <>
          <CourseGallery courseName={course.name} photos={[{ id: 'cover', url: course.coverUrl }, ...course.photos]} />

          <div className="heading">
            <h1 className="title" dir="auto">
              {course.name}
            </h1>

            {/* No topic tag: `CourseDetailResponse` (common/src/course.ts)
                carries no `topic` field, unlike the panel's own
                `CourseResponse`. Flagged in the report; the cycle tag alone
                is what the public wire actually supports today. */}
            {course.cycle !== undefined && (
              <div className="tags">
                <span className="tag">{consts.cycleLabel(course.cycle)}</span>
              </div>
            )}
          </div>

          <p className="description" dir="auto">
            {course.description}
          </p>

          <CourseFacts course={course} />

          {course.state.status === 'closed' ? (
            <ClosedPanel reason={course.state.reason} openingDate={course.openingDate} weeks={course.weeks} teacher={course.teacher} />
          ) : (
            <ContactBar courseId={course.id} courseName={course.name} contactPhone={course.state.contactPhone} />
          )}

          <TeacherSection teacher={course.teacher} />

          <BackLink to="/" label={consts.BACK_TO_HOME_LABEL} />
        </>
      )}
    </main>
  );
})`
  ${styles.CoursePage}
`;
