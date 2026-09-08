import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { LessonPageHeader } from '~/components/LessonPageHeader/LessonPageHeader';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { StateCard } from '~/components/StateCard/StateCard';
import { Footer } from '~/HomePage/components/Footer/Footer';
import { dayLabel } from '~/HomePage/helpers';
import { useDateFilter } from '~/hooks/useDateFilter';
import { useSearchQuery } from '~/hooks/useSearchQuery';
import { useSelectedCity } from '~/hooks/useSelectedCity';

import { FilterBand } from './components/FilterBand/FilterBand';
import { LessonsGrid } from './components/LessonsGrid/LessonsGrid';
import { LessonsSkeleton } from './components/LessonsSkeleton/LessonsSkeleton';
import * as consts from './consts';
import {
  buildLessonsTitle,
  dateWord,
  getErrorHint,
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

const readPassThroughFilters = (searchParams: URLSearchParams): PassThroughFilters => ({
  rabbiId: searchParams.get(consts.RABBI_ID_PARAM) ?? undefined,
  area: searchParams.get(consts.AREA_PARAM) ?? undefined,
  topic: searchParams.get(consts.TOPIC_PARAM) ?? undefined,
  audience: searchParams.get(consts.AUDIENCE_PARAM) ?? undefined,
});

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
  onClearFilters: () => void;
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
  onClearFilters,
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
          action={{ actionLabel: consts.RETRY_LABEL, actionStyle: 'primary', onAction: () => listQuery.refetch() }}
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
            heading={noFilteredLessonsHeadline(cityName, query)}
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
        <LessonsGrid items={items} />
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
        <LessonsGrid items={primaryItems} />
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
        <LessonsGrid items={fallbackItems} />
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
  const { option, customDate, selectOption, selectCustomDate, clearDate } = useDateFilter();
  const { city, select: selectCity, clear: clearCity } = useSelectedCity();
  const { query, setQuery } = useSearchQuery();
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
  const title = buildLessonsTitle(city, option, customDate, query);

  // The way back out of an empty result (design-system.md, "Every data
  // screen has three states"): clears every filter, including whichever
  // pass-through ones arrived from an outside link, and returns to the
  // unfiltered complete list.
  const clearFilters = (): void => setSearchParams({});

  return (
    <div className={className}>
      <LessonPageHeader />

      <FilterBand
        {...{
          option,
          customDate,
          onSelectOption: selectOption,
          onSelectCustomDate: selectCustomDate,
          onClearDate: clearDate,
          city,
          onSelectCity: selectCity,
          onClearCity: clearCity,
          searchQuery: query,
          onSearchQueryChange: setQuery,
        }}
      />

      <main className="content">
        {renderContent({
          listQuery,
          hasDateFilter: range.hasDateFilter,
          targetDate: range.from,
          title,
          cityName: city?.name,
          query,
          hasAnyFilter,
          onClearFilters: clearFilters,
        })}
      </main>

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
})`
  ${styles.LessonsPage}
`;
