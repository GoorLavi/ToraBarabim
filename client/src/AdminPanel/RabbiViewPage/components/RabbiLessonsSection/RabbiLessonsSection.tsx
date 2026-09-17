import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, lessonNewForRabbi, skeletonFieldKeys } from '~/AdminPanel/consts';
import { adminErrorMessage, lessonPrimaryLabel } from '~/AdminPanel/helpers';
import { lessonsListUrlForRabbi } from '~/AdminPanel/LessonsListPage/helpers';
import * as parentConsts from '~/AdminPanel/RabbiViewPage/consts';

import { lessonRowMetaLabel } from './helpers';
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
        <ul className="skeletonList" aria-live="polite" aria-label={parentConsts.LESSONS_LOADING_MESSAGE}>
          {skeletonFieldKeys(parentConsts.SKELETON_LESSON_ROW_COUNT).map((key) => (
            <li key={key} className="skeletonRow" />
          ))}
        </ul>
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
          <Link className="cta" to={lessonNewForRabbi(rabbiId)}>
            {parentConsts.ADD_LESSON_LABEL}
          </Link>
        </div>
      )}

      {lessons.isSuccess && lessons.data.items.length > 0 && (
        <>
          <ul className="list">
            {lessons.data.items.map((lesson) => (
              <li key={lesson.id} className="item">
                <Link className="row" to={ADMIN_ROUTES.lessonView(lesson.id)}>
                  <span className="text">
                    <span className="primary" dir="auto">
                      {lessonPrimaryLabel(lesson, { name: rabbiName, honorific: rabbiHonorific })}
                    </span>
                    <span className="meta" dir="auto">
                      {lessonRowMetaLabel(lesson)}
                    </span>
                  </span>
                  <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {lessons.data.total > lessons.data.items.length && (
            <Link className="seeAll" to={lessonsListUrlForRabbi({ id: rabbiId, name: rabbiName, honorific: rabbiHonorific })}>
              {parentConsts.seeAllLessonsLabel(lessons.data.total)}
            </Link>
          )}
        </>
      )}
    </section>
  );
})`
  ${styles.RabbiLessonsSection}
`;
