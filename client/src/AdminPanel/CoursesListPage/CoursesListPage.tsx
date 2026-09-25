import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import { CourseFilterBar } from './components/CourseFilterBar/CourseFilterBar';
import { CoursesCardList } from './components/CoursesCardList/CoursesCardList';
import { CoursesTable } from './components/CoursesTable/CoursesTable';
import * as consts from './consts';
import type { CoursesListPageProps } from './models';
import * as styles from './styles';
import { useAdminCoursesList } from './useAdminCoursesList';
import { useCourseListFilters } from './useCourseListFilters';

export const CoursesListPage = styled(({ className }: CoursesListPageProps) => {
  const filters = useCourseListFilters();
  const state = useAdminCoursesList(filters.search, filters.status, filters.rabbi?.id);

  const isEmpty = state.status === 'success' && state.rows.length === 0;

  return (
    <div className={className}>
      <div className="head">
        <h1 className="title">{consts.HEADING}</h1>
        <Link className="add" to={ADMIN_ROUTES.courseNew}>
          {consts.ADD_COURSE_LABEL}
        </Link>
      </div>

      <CourseFilterBar
        {...{
          status: filters.status,
          onSelectStatus: filters.selectStatus,
          rabbi: filters.rabbi,
          onSelectRabbi: filters.selectRabbi,
          search: filters.search,
          onSearchChange: filters.setSearch,
          onClear: filters.clear,
          activeFilterCount: filters.activeFilterCount,
        }}
      />

      {state.status === 'success' && state.rows.length > 0 && <p className="sortNote">{consts.SORT_NOTE}</p>}

      {state.status === 'pending' && (
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeletonRow" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="state error" role="alert">
          <p className="headline">{adminErrorMessage(state.error)}</p>
          <button type="button" className="cta ghost" onClick={state.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {isEmpty && filters.activeFilterCount > 0 && (
        <div className="state empty">
          <p className="headline">{consts.NO_MATCH_HEADLINE}</p>
          <button type="button" className="cta ghost" onClick={filters.clear}>
            {consts.CLEAR_FILTERS_LABEL}
          </button>
        </div>
      )}

      {isEmpty && filters.activeFilterCount === 0 && (
        <div className="state empty">
          <p className="headline">{consts.EMPTY_HEADLINE}</p>
          <p className="hint">{consts.EMPTY_HINT}</p>
          <Link className="cta" to={ADMIN_ROUTES.courseNew}>
            {consts.ADD_COURSE_LABEL}
          </Link>
        </div>
      )}

      {state.status === 'success' && state.rows.length > 0 && (
        <>
          <CoursesTable {...{ rows: state.rows }} />
          <CoursesCardList {...{ rows: state.rows }} />
        </>
      )}
    </div>
  );
})`
  ${styles.CoursesListPage}
`;
