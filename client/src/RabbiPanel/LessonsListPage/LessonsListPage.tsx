import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { RABBI_ROUTES } from '~/RabbiPanel/consts';

import { LessonListItem } from './components/LessonListItem/LessonListItem';
import * as consts from './consts';
import type { LessonsListPageProps } from './models';
import * as styles from './styles';
import { useRabbiLessonsList } from './useRabbiLessonsList';

export const LessonsListPage = styled(({ className }: LessonsListPageProps) => {
  const state = useRabbiLessonsList();

  return (
    <div className={className}>
      <h1 className="heading">{consts.HEADING}</h1>
      {state.status === 'success' && <p className="subtext">{consts.countLabel(state.lessons.length)}</p>}

      <Link className="add" to={RABBI_ROUTES.lessonNew}>
        {consts.ADD_LESSON_LABEL}
      </Link>

      {state.status === 'pending' && (
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonCard" />
          <div className="skeletonCard" />
          <div className="skeletonCard" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="state" role="alert">
          <p className="headline">{consts.ERROR_MESSAGE}</p>
          <button type="button" className="cta ghost" onClick={state.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {state.status === 'success' && state.lessons.length === 0 && (
        <div className="state">
          <p className="headline">{consts.EMPTY_HEADLINE}</p>
          <p className="hint">{consts.EMPTY_HINT}</p>
          <Link className="cta" to={RABBI_ROUTES.lessonNew}>
            {consts.EMPTY_CTA}
          </Link>
        </div>
      )}

      {state.status === 'success' && state.lessons.length > 0 && (
        <ul className="list">
          {state.lessons.map((lesson) => (
            <LessonListItem key={lesson.id} lesson={lesson} />
          ))}
        </ul>
      )}
    </div>
  );
})`
  ${styles.LessonsListPage}
`;
