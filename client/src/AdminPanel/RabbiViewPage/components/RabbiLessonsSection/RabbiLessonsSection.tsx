import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage, lessonPrimaryLabel, recurrenceWhenLabel } from '~/AdminPanel/helpers';
import { lessonsListUrlForRabbi } from '~/AdminPanel/LessonsListPage/helpers';
import * as parentConsts from '~/AdminPanel/RabbiViewPage/consts';

import type { RabbiLessonsSectionProps } from './models';
import * as styles from './styles';
import { useRabbiLessons } from './useRabbiLessons';

// Owns its own loading, empty and error states, independent of
// `RabbiViewPage`'s own profile query: a failure fetching the rabbi's
// lessons must never blank the rabbi's name, photo or edit button above it
// (this slice's brief, "The rabbi's lessons render inline on this page").
export const RabbiLessonsSection = styled(({ className, rabbiId, rabbiName, rabbiHonorific }: RabbiLessonsSectionProps) => {
  const lessons = useRabbiLessons(rabbiId);

  return (
    <section className={className}>
      <h2 className="heading">{parentConsts.LESSONS_SECTION_HEADING}</h2>

      {lessons.isPending && (
        <p className="state" aria-live="polite">
          {parentConsts.LESSONS_LOADING_MESSAGE}
        </p>
      )}

      {lessons.isError && (
        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(lessons.error)}</p>
          <button type="button" className="retry" onClick={() => lessons.refetch()}>
            {parentConsts.LESSONS_RETRY_LABEL}
          </button>
        </div>
      )}

      {lessons.isSuccess && lessons.data.items.length === 0 && (
        <div className="state empty">
          <p className="headline">{parentConsts.LESSONS_EMPTY_HEADLINE}</p>
          <p className="hint">{parentConsts.LESSONS_EMPTY_HINT}</p>
          <Link className="cta" to={`${ADMIN_ROUTES.lessonNew}?rabbiId=${rabbiId}`}>
            {parentConsts.ADD_LESSON_LABEL}
          </Link>
        </div>
      )}

      {lessons.isSuccess && lessons.data.items.length > 0 && (
        <>
          <ul className="list">
            {lessons.data.items.map((lesson) => (
              <li key={lesson.id}>
                <Link className="row" to={ADMIN_ROUTES.lessonView(lesson.id)}>
                  <span className="primary" dir="auto">
                    {lessonPrimaryLabel(lesson, { name: rabbiName, honorific: rabbiHonorific })}
                  </span>
                  <span className="when" dir="auto">
                    {recurrenceWhenLabel(lesson)}
                  </span>
                  <span className="time" dir="ltr">
                    {lesson.startTime}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {lessons.data.total > lessons.data.items.length && (
            <Link className="seeAll" to={lessonsListUrlForRabbi({ id: rabbiId, name: rabbiName, honorific: rabbiHonorific })}>
              {parentConsts.SEE_ALL_LESSONS_LABEL}
            </Link>
          )}
        </>
      )}
    </section>
  );
})`
  ${styles.RabbiLessonsSection}
`;
