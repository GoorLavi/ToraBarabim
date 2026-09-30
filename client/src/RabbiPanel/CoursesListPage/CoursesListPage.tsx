import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { RABBI_ROUTES } from '~/RabbiPanel/consts';

import { CourseListItem } from './components/CourseListItem/CourseListItem';
import * as consts from './consts';
import { isCurrentlyListed } from './helpers';
import type { CoursesListPageProps } from './models';
import * as styles from './styles';
import { useRabbiCoursesList } from './useRabbiCoursesList';

export const CoursesListPage = styled(({ className }: CoursesListPageProps) => {
  const state = useRabbiCoursesList();

  return (
    <div className={className}>
      <h1 className="heading">{consts.HEADING}</h1>
      {state.status === 'success' && <p className="subtext">{consts.countLabel(state.courses.filter(isCurrentlyListed).length)}</p>}

      <Link className="add" to={RABBI_ROUTES.courseNew}>
        {consts.ADD_COURSE_LABEL}
      </Link>

      {state.status === 'pending' && (
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
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

      {state.status === 'success' && state.courses.length === 0 && (
        <div className="state">
          <p className="headline">{consts.EMPTY_HEADLINE}</p>
          <p className="hint">{consts.EMPTY_HINT}</p>
          <Link className="cta" to={RABBI_ROUTES.courseNew}>
            {consts.EMPTY_CTA}
          </Link>
        </div>
      )}

      {state.status === 'success' && state.courses.length > 0 && (
        <ul className="list">
          {state.courses.map((course) => (
            <CourseListItem key={course.id} {...{ course }} />
          ))}
        </ul>
      )}
    </div>
  );
})`
  ${styles.CoursesListPage}
`;
