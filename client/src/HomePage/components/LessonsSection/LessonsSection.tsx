import classNames from 'classnames';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { useActiveFilters } from '~/analytics/useActiveFilters';
import { useResultsShownTracking } from '~/analytics/useResultsShownTracking';
import { dayLabel } from '~/HomePage/helpers';

import { DayLessons } from './components/DayLessons/DayLessons';
import { DayLessonsSkeleton } from './components/DayLessonsSkeleton/DayLessonsSkeleton';
import * as consts from './consts';
import { dayHeadingLabel, getErrorHint, selectDaySections } from './helpers';
import type { LessonsSectionProps } from './models';
import * as styles from './styles';

export const LessonsSection = styled(
  ({ className, query, resultSetKey, hasDateFilter, targetDate, city, searchQuery, onClearFilters }: LessonsSectionProps) => {
    const primaryLabel = dayLabel(targetDate);
    const cityName = city?.name;
    const activeFilters = useActiveFilters();
    const settledItems = query.data?.items ?? [];

    useResultsShownTracking(
      { resultSetKey, dataUpdatedAt: query.dataUpdatedAt, isPending: query.isPending, isError: query.isError },
      {
        surface: 'homeFiltered',
        resultCount: settledItems.length,
        hasResults: settledItems.length > 0,
        ...(activeFilters.query ? { query: activeFilters.query } : {}),
        ...(activeFilters.cityId ? { cityId: activeFilters.cityId } : {}),
        ...(activeFilters.cityName ? { cityName: activeFilters.cityName } : {}),
        dateOption: activeFilters.dateOption,
        ...(activeFilters.date ? { date: activeFilters.date } : {}),
      },
    );

    const clearFilters = (): void => {
      trackEvent(MIXPANEL_EVENTS.clearFiltersClick, {
        ...(activeFilters.cityId ? { cityId: activeFilters.cityId } : {}),
        dateOption: activeFilters.dateOption,
        ...(activeFilters.query ? { query: activeFilters.query } : {}),
      });
      onClearFilters();
    };

    if (query.isError) {
      return (
        <div className={classNames(className, 'state', 'error')} role="alert">
          <p className="headline">{consts.ERROR_HEADLINE}</p>
          <p className="hint">{getErrorHint(query.error)}</p>
          <button
            type="button"
            className="retry"
            onClick={() => {
              trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'homeFiltered' });
              query.refetch();
            }}
          >
            {consts.RETRY_LABEL}
          </button>
        </div>
      );
    }

    const headingLabel = hasDateFilter
      ? dayHeadingLabel(primaryLabel, cityName)
      : consts.filterOnlyHeadingLabel(cityName, searchQuery);

    if (query.isPending) {
      return (
        <div className={className}>
          <span className="srOnly" aria-live="polite">
            {consts.LOADING_MESSAGE}
          </span>
          <DayLessonsSkeleton headingLabel={headingLabel} />
        </div>
      );
    }

    if (!query.data) return null;

    // There is no date axis to widen along here (design-system.md, "Every
    // data screen has three states"): a city or a search term alone has no
    // "next day" to fall back to, so the whole widened window's worth of
    // matches renders as one flat list instead of day sections.
    if (!hasDateFilter) {
      const { items } = query.data;

      if (items.length > 0) {
        return (
          <div className={className}>
            <DayLessons
              headingLabel={headingLabel}
              items={items}
              showSeeAllLink={false}
              moreLabel={consts.MORE_FILTERED_LESSONS_LABEL}
              countLabel={consts.dayLessonCountLabel(items.length)}
            />
          </div>
        );
      }

      return (
        <div className={className}>
          <div className="empty">
            <p className="headline">{consts.noFilteredLessonsHeadline(cityName, searchQuery)}</p>
            <button type="button" className="clearFilters" onClick={clearFilters}>
              {consts.CLEAR_FILTERS_LABEL}
            </button>
          </div>
        </div>
      );
    }

    const { primary, fallback } = selectDaySections(query.data.items, targetDate);

    if (primary.items.length > 0) {
      return (
        <div className={className}>
          <DayLessons
            headingLabel={headingLabel}
            items={primary.items}
            showSeeAllLink
            moreLabel={consts.moreLessonsLabel(primaryLabel)}
            countLabel={consts.dayLessonCountLabel(primary.items.length)}
          />
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="empty">
          <p className="headline">{consts.noLessonsHeadline(primaryLabel, cityName, searchQuery)}</p>
          {fallback && (
            <p className="hint">
              {consts.nextDayCountLabel(fallback.items.length, dayLabel(fallback.date), cityName, searchQuery)}
            </p>
          )}
          {!fallback && <p className="hint">{consts.noLessonsHint(searchQuery)}</p>}
        </div>

        {fallback && (
          <DayLessons
            headingLabel={dayHeadingLabel(dayLabel(fallback.date), cityName)}
            items={fallback.items}
            showSeeAllLink={false}
            moreLabel={consts.moreLessonsLabel(dayLabel(fallback.date))}
          />
        )}
      </div>
    );
  },
)`
  ${styles.LessonsSection}
`;
