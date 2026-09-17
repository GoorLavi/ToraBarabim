import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { adminErrorMessage } from '~/AdminPanel/helpers';
import { ADMIN_ROUTES, lessonNewForRabbi } from '~/AdminPanel/consts';
import { rabbiDisplayName } from '~/helpers';

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
  const state = useAdminLessonsList(filters.city, filters.rabbi?.id);

  // Client-side filtering (recurrence, search) over whatever the server
  // already narrowed by city/rabbi; when the server itself returned zero,
  // `state.rows` is already empty and this is a no-op, so one check below
  // covers both a server-side zero result and a client-side one.
  const rows = state.status === 'success' ? filterRows(state.rows, filters.recurrence, filters.search) : [];

  const isEmpty = state.status === 'success' && rows.length === 0;
  const isRabbiOnlyFilter = Boolean(filters.rabbi) && filters.activeFilterCount === 1;

  return (
    <div className={className}>
      <div className="head">
        <div className="heading">
          <h1 className="title">{consts.HEADING}</h1>
          {state.status === 'success' && (
            <p className="subheading">
              {filters.rabbi ? (
                <>
                  {consts.rabbiFilteredCountPrefix(state.total)} <span dir="auto">{rabbiDisplayName(filters.rabbi)}</span>
                </>
              ) : (
                consts.totalCountLabel(state.total)
              )}
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
        rabbi={filters.rabbi}
        onClearRabbi={filters.clearRabbi}
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

      {/* One empty state at a time, chosen by which filters are actually on.
          The rabbi branch is gated on the rabbi filter being the only one:
          with a city or a search term alongside it, "this rabbi has no
          lessons yet" can be flatly false, since they may have ten that the
          other filter excluded, and what the admin needs then is the way back
          that the generic branch offers. Only no filters at all may claim the
          system itself is empty. */}
      {isEmpty && isRabbiOnlyFilter && filters.rabbi && (
        <div className="state empty">
          <p className="headline">{consts.noLessonsForRabbiHeadline(rabbiDisplayName(filters.rabbi))}</p>
          <p className="hint">{consts.NO_LESSONS_FOR_RABBI_HINT}</p>
          <Link className="cta" to={lessonNewForRabbi(filters.rabbi.id)}>
            {consts.ADD_LESSON_FOR_RABBI_LABEL}
          </Link>
        </div>
      )}

      {isEmpty && !isRabbiOnlyFilter && filters.activeFilterCount > 0 && (
        <div className="state empty">
          <p className="headline">{consts.NO_MATCHING_LESSONS_HEADLINE}</p>
          <p className="hint">{consts.NO_MATCHING_LESSONS_HINT}</p>
          <button type="button" className="cta" onClick={filters.clear}>
            {consts.CLEAR_FILTERS_LABEL}
          </button>
        </div>
      )}

      {isEmpty && filters.activeFilterCount === 0 && (
        <div className="state empty">
          <p className="headline">{consts.NO_LESSONS_HEADLINE}</p>
          <p className="hint">{consts.NO_LESSONS_HINT}</p>
          <Link className="cta" to={ADMIN_ROUTES.lessonNew}>
            {consts.ADD_LESSON_LABEL}
          </Link>
        </div>
      )}

      {state.status === 'success' && rows.length > 0 && (
        <>
          <LessonsTable rows={rows} />
          <LessonsCardList rows={rows} />
        </>
      )}
    </div>
  );
})`
  ${styles.LessonsListPage}
`;
