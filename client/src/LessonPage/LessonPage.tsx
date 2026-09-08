import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { BackLink } from '~/components/BackLink/BackLink';
import { LessonPageHeader } from '~/components/LessonPageHeader/LessonPageHeader';
import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';

import { LessonDetails } from './components/LessonDetails/LessonDetails';
import { LessonDetailsSkeleton } from './components/LessonDetailsSkeleton/LessonDetailsSkeleton';
import { LessonTicket } from './components/LessonTicket/LessonTicket';
import { LessonTicketSkeleton } from './components/LessonTicket/components/LessonTicketSkeleton/LessonTicketSkeleton';
import * as consts from './consts';
import { lessonErrorCopy, otherLessonsInCityHref, teachingRabbiOf } from './helpers';
import type { LessonPageProps } from './models';
import * as styles from './styles';
import { useLessonOccurrence } from './useLessonOccurrence';

export const LessonPage = styled(({ className }: LessonPageProps) => {
  const { lessonId = '', date = '' } = useParams();
  const query = useLessonOccurrence(lessonId, date);
  const occurrence = query.data;
  const errorCopy = query.error ? lessonErrorCopy(query.error) : null;

  return (
    <div className={className}>
      <LessonPageHeader />

      <div className="content">
        <BackLink to="/" label={consts.BACK_TO_ALL_LESSONS_LABEL} />

        {query.isPending && (
          <>
            <LessonTicketSkeleton />
            <LessonDetailsSkeleton />
          </>
        )}

        {errorCopy && (
          <>
            {errorCopy.kind === 'not-found' ? (
              <NotFoundScreen
                heading={errorCopy.heading}
                explanation={errorCopy.explanation}
                actionLabel={consts.ALL_LESSONS_LABEL}
                actionTo="/"
              />
            ) : (
              <NotFoundScreen
                heading={errorCopy.heading}
                explanation={errorCopy.explanation}
                actionLabel={consts.RETRY_LABEL}
                onAction={() => query.refetch()}
              />
            )}
            <BackLink to="/" label={consts.BACK_TO_ALL_LESSONS_LABEL} />
          </>
        )}

        {occurrence && (
          <>
            <LessonTicket occurrence={occurrence} />

            {occurrence.status === 'cancelled' && (
              <Link className="otherLessons" to={otherLessonsInCityHref(occurrence.place.city)} dir="auto">
                {consts.otherLessonsInCityLabel(occurrence.place.city)}
                <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}

            <LessonDetails bio={teachingRabbiOf(occurrence).bio} note={occurrence.note} />

            <BackLink to="/" label={consts.BACK_TO_ALL_LESSONS_LABEL} />
          </>
        )}
      </div>
    </div>
  );
})`
  ${styles.LessonPage}
`;
