import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { useResultsShownTracking } from '~/analytics/useResultsShownTracking';
import { LessonsGrid } from '~/components/LessonsGrid/LessonsGrid';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { StateCard } from '~/components/StateCard/StateCard';
import { dayLabel } from '~/HomePage/helpers';
import { AUDIENCE_PARAM } from '~/hooks/consts';
import { isAudienceFilterValue } from '~/hooks/helpers';
import { useDateFilter } from '~/hooks/useDateFilter';
import { useSearchQuery } from '~/hooks/useSearchQuery';
import { useSelectedCity } from '~/hooks/useSelectedCity';

import { LessonsSkeleton } from './components/LessonsSkeleton/LessonsSkeleton';
import * as consts from './consts';
import {
  buildLessonsTitle,
  dateWord,
  getErrorHint,
  hasNamedPassThroughFilter,
  hasPassThroughFilter,
  lessonCountLabel,
  noFilteredLessonsHeadline,
  noLessonsHeadline,
  noLessonsNoFallbackBody,
  noLessonsWidenedHint,
  resolveLessonsRange,
  selectDaySections,
} from './helpers';
import type { LessonsFilters, LessonsPageProps, PassThroughFilters } from './models';
import * as styles from './styles';
import type { LessonsListQueryResult } from './useLessonsList';
import { useLessonsList } from './useLessonsList';

const readPassThroughFilters = (searchParams: URLSearchParams): PassThroughFilters => {
  const audience = searchParams.get(AUDIENCE_PARAM);
  return {
    rabbiId: searchParams.get(consts.RABBI_ID_PARAM) ?? undefined,
    area: searchParams.get(consts.AREA_PARAM) ?? undefined,
    topic: searchParams.get(consts.TOPIC_PARAM) ?? undefined,
    audience: isAudienceFilterValue(audience) ? audience : undefined,
    placeId: searchParams.get(consts.PLACE_ID_PARAM) ?? undefined,
  };
};

const titleHeading = (title: string): ReactNode => (
  <h1 className="title" dir="auto">
    {title}
  </h1>
);

interface RenderContentParams {
  listQuery: LessonsListQueryResult;
  hasDateFilter: boolean;
  targetDate: string;
  title: string;
  cityName: string | undefined;
  query: string;
  hasAnyFilter: boolean;
  hasNamedFilter: boolean;
  onClearFilters: () => void;
  gridSurface: 'searchResults' | 'lessonsGrid';
}

// The one place every state this page can be in resolves to what renders
// inside `<main>` (root CLAUDE.md, Shape: "guard clauses over nesting").
const renderContent = ({
  listQuery,
  hasDateFilter,
  targetDate,
  title,
  cityName,
  query,
  hasAnyFilter,
  hasNamedFilter,
  onClearFilters,
  gridSurface,
}: RenderContentParams): ReactNode => {
  if (listQuery.isPending) return <LessonsSkeleton />;

  if (listQuery.isError) {
    return (
      <>
        {titleHeading(title)}
        <StateCard
          variant="surface"
          headingLevel="h2"
          heading={consts.ERROR_HEADLINE}
          body={getErrorHint(listQuery.error)}
          action={{
            actionLabel: consts.RETRY_LABEL,
            actionStyle: 'primary',
            onAction: () => {
              trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'lessonsPage' });
              listQuery.refetch();
            },
          }}
        />
      </>
    );
  }

  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = listQuery.data?.pages[0]?.total ?? 0;

  if (!hasDateFilter) {
    const showSubtitle = !hasAnyFilter && total > 0;

    if (items.length === 0 && !hasAnyFilter) {
      return (
        <>
          {titleHeading(title)}
          <StateCard variant="empty" headingLevel="h2" heading={consts.SITE_EMPTY_HEADLINE} body={consts.SITE_EMPTY_BODY} />
        </>
      );
    }

    if (items.length === 0) {
      return (
        <>
          {titleHeading(title)}
          <StateCard
            variant="empty"
            headingLevel="h2"
            heading={hasNamedFilter ? consts.PASS_THROUGH_EMPTY_HEADLINE_PLACEHOLDER : noFilteredLessonsHeadline(cityName, query)}
            action={{ actionLabel: consts.CLEAR_FILTERS_LABEL, actionStyle: 'quiet', onAction: onClearFilters }}
          />
        </>
      );
    }

    return (
      <>
        <div className="titleBlock">
          {titleHeading(title)}
          {showSubtitle && (
            <p className="subtitle" dir="auto">
              {lessonCountLabel(total)} · {consts.ORDERED_BY_DATE_LABEL}
            </p>
          )}
        </div>
        <LessonsGrid {...{ items, surface: 'general', clickSurface: gridSurface }} />
        {listQuery.hasNextPage && (
          <QuietButton
            className="loadMore"
            label={listQuery.isFetchingNextPage ? consts.LOADING_MORE_LABEL : consts.LOAD_MORE_LABEL}
            onClick={() => listQuery.fetchNextPage()}
            disabled={listQuery.isFetchingNextPage}
          />
        )}
      </>
    );
  }

  const { primaryItems, fallbackDate, fallbackItems } = selectDaySections(items, targetDate);

  if (primaryItems.length > 0) {
    return (
      <>
        {titleHeading(title)}
        <LessonsGrid {...{ items: primaryItems, surface: 'general', clickSurface: gridSurface }} />
      </>
    );
  }

  const targetDayWord = dateWord(targetDate);

  if (fallbackDate) {
    return (
      <>
        {titleHeading(title)}
        <StateCard variant="empty" headingLevel="h2" heading={noLessonsHeadline(cityName, targetDayWord)} body={noLessonsWidenedHint(cityName)} />
        <h2 className="dayHeading" dir="auto">
          {dayLabel(fallbackDate)}
        </h2>
        <LessonsGrid {...{ items: fallbackItems, surface: 'general', clickSurface: gridSurface }} />
      </>
    );
  }

  return (
    <>
      {titleHeading(title)}
      <StateCard
        variant="empty"
        headingLevel="h2"
        heading={noLessonsHeadline(cityName, targetDayWord)}
        body={noLessonsNoFallbackBody(cityName)}
        action={{ actionLabel: consts.CLEAR_FILTERS_LABEL, actionStyle: 'quiet', onAction: onClearFilters }}
      />
    </>
  );
};

export const LessonsPage = styled(({ className }: LessonsPageProps) => {
  const { option, customDate } = useDateFilter();
  const { city } = useSelectedCity();
  const { query } = useSearchQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const passThrough = readPassThroughFilters(searchParams);

  const range = resolveLessonsRange(option, customDate);
  const filters: LessonsFilters = {
    from: range.from,
    to: range.to,
    pageSize: range.pageSize,
    city: city?.id,
    q: query || undefined,
    ...passThrough,
  };

  const listQuery = useLessonsList(filters, range.hasDateFilter);
  const hasAnyFilter = Boolean(city || query || hasPassThroughFilter(passThrough));
  const flatItems = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const title = buildLessonsTitle(city, option, customDate, query, passThrough, flatItems[0]);
  const gridSurface: 'searchResults' | 'lessonsGrid' = hasAnyFilter ? 'searchResults' : 'lessonsGrid';
  useResultsShownTracking(
    { resultSetKey: consts.LESSONS_QUERY_KEYS.list(filters), dataUpdatedAt: listQuery.dataUpdatedAt, isPending: listQuery.isPending, isError: listQuery.isError },
    {
      surface: 'lessonsPage',
      resultCount: flatItems.length,
      hasResults: flatItems.length > 0,
      ...(query ? { query } : {}),
      ...(city?.id ? { cityId: city.id } : {}),
      ...(city?.name ? { cityName: city.name } : {}),
      dateOption: option,
      ...(customDate ? { date: customDate } : {}),
    },
  );

  // The way back out of an empty result (design-system.md, "Every data
  // screen has three states"): clears every filter, including whichever
  // pass-through ones arrived from an outside link, and returns to the
  // unfiltered complete list.
  const clearFilters = (): void => {
    trackEvent(MIXPANEL_EVENTS.clearFiltersClick, {
      ...(city?.id ? { cityId: city.id } : {}),
      dateOption: option,
      ...(query ? { query } : {}),
    });
    setSearchParams({});
  };

  return (
    <main className={className}>
      {renderContent({
        listQuery,
        hasDateFilter: range.hasDateFilter,
        targetDate: range.from,
        title,
        cityName: city?.name,
        query,
        hasAnyFilter,
        hasNamedFilter: hasNamedPassThroughFilter(passThrough),
        onClearFilters: clearFilters,
        gridSurface,
      })}
    </main>
  );
})`
  ${styles.LessonsPage}
`;
