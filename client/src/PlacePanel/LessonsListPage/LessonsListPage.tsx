import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { PLACE_ROUTES } from '~/PlacePanel/consts';
import { useRabbiDirectory } from '~/PlacePanel/useRabbiDirectory';

import { LessonListItem } from './components/LessonListItem/LessonListItem';
import * as consts from './consts';
import type { LessonsListPageProps } from './models';
import * as styles from './styles';
import { usePlaceLessonsList } from './usePlaceLessonsList';

export const LessonsListPage = styled(({ className }: LessonsListPageProps) => {
  const state = usePlaceLessonsList();
  const rabbis = useRabbiDirectory();
  // The empty state's own block already offers the same action, ~doubling
  // it on screen; the header button only earns its place once there is a
  // list for it to sit above (design gate finding F10).
  const isEmptySuccess = state.status === 'success' && state.lessons.length === 0;

  return (
    <div className={className}>
      <h1 className="heading">{consts.HEADING}</h1>
      {state.status === 'success' && state.lessons.length > 0 && <p className="subtext">{consts.countLabel(state.lessons.length)}</p>}

      {!isEmptySuccess && (
        <Link className="add" to={PLACE_ROUTES.lessonNew}>
          {consts.ADD_LESSON_LABEL}
        </Link>
      )}

      {state.status === 'pending' && (
        <ul className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          {[0, 1, 2].map((key) => (
            <li key={key} className="skeletonCard">
              <div className="bar title" />
              <div className="bar when" />
              <div className="tags">
                <div className="bar tag" />
                <div className="bar tag" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {state.status === 'error' && (
        <div className="state" role="alert">
          <p className="headline">{consts.ERROR_MESSAGE}</p>
          <button type="button" className="cta" onClick={state.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {state.status === 'success' && state.lessons.length === 0 && (
        <div className="state">
          <p className="headline">{consts.EMPTY_HEADLINE}</p>
          <p className="hint">{consts.EMPTY_HINT}</p>
          <Link className="cta" to={PLACE_ROUTES.lessonNew}>
            {consts.EMPTY_CTA}
          </Link>
        </div>
      )}

      {state.status === 'success' && state.lessons.length > 0 && (
        <ul className="list">
          {state.lessons.map((lesson) => (
            <LessonListItem key={lesson.id} {...{ lesson, rabbi: rabbis.byId.get(lesson.rabbiId) }} />
          ))}
        </ul>
      )}
    </div>
  );
})`
  ${styles.LessonsListPage}
`;
