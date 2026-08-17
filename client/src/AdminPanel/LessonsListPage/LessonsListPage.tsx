import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';
import { ADMIN_ROUTES } from '~/AdminPanel/consts';

import { LessonFilterBar } from './components/LessonFilterBar/LessonFilterBar';
import { LessonsCardList } from './components/LessonsCardList/LessonsCardList';
import { LessonsTable } from './components/LessonsTable/LessonsTable';
import * as consts from './consts';
import { filterRows } from './helpers';
import type { LessonsListPageProps } from './models';
import * as styles from './styles';
import { useAdminLessonsList } from './useAdminLessonsList';
import { useLessonListFilters } from './useLessonListFilters';

export const LessonsListPage = styled(({ className }: LessonsListPageProps) => {
  const filters = useLessonListFilters();
  const state = useAdminLessonsList(filters.city);

  return (
    <div className={className}>
      <div className="head">
        <div className="heading">
          <h1 className="title">{consts.HEADING}</h1>
          {state.status === 'success' && (
            <p className="subheading">
              {consts.totalCountLabel(state.total)}
              {state.total > state.loadedCount && ` · ${consts.partialLoadNote(state.loadedCount, state.total)}`}
            </p>
          )}
        </div>
        <Link className="add" to={ADMIN_ROUTES.lessonNew}>
          {consts.ADD_LESSON_LABEL}
        </Link>
      </div>

      <LessonFilterBar
        city={filters.city}
        onSelectCity={filters.selectCity}
        recurrence={filters.recurrence}
        onSelectRecurrence={filters.selectRecurrence}
        search={filters.search}
        onSearchChange={filters.setSearch}
        onClear={filters.clear}
        activeFilterCount={filters.activeFilterCount}
      />

      {state.status === 'pending' && (
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeletonRow" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="state error" role="alert">
          <p>{adminErrorMessage(state.error)}</p>
          <button type="button" onClick={state.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      )}

      {state.status === 'success' && state.total === 0 && (
        <div className="state empty">
          <p className="headline">{consts.NO_LESSONS_HEADLINE}</p>
          <p className="hint">{consts.NO_LESSONS_HINT}</p>
          <Link className="cta" to={ADMIN_ROUTES.lessonNew}>
            {consts.ADD_LESSON_LABEL}
          </Link>
        </div>
      )}

      {state.status === 'success' &&
        state.total > 0 &&
        (() => {
          const rows = filterRows(state.rows, filters.recurrence, filters.search);
          if (rows.length === 0) {
            return (
              <div className={classNames('state', 'empty')}>
                <p className="headline">{consts.NO_MATCHING_LESSONS_HEADLINE}</p>
                <p className="hint">{consts.NO_MATCHING_LESSONS_HINT}</p>
                <button type="button" className="cta" onClick={filters.clear}>
                  {consts.CLEAR_FILTERS_LABEL}
                </button>
              </div>
            );
          }
          return (
            <>
              <LessonsTable rows={rows} />
              <LessonsCardList rows={rows} />
            </>
          );
        })()}
    </div>
  );
})`
  ${styles.LessonsListPage}
`;
