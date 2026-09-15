import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { CityChip } from '~/components/CityChip/CityChip';
import { DayGroup } from '~/components/DayGroup/DayGroup';
import { DayGroupSkeleton } from '~/components/DayGroupSkeleton/DayGroupSkeleton';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { RabbiRail } from '~/components/RabbiRail/RabbiRail';
import { RabbiRailSkeleton } from '~/components/RabbiRailSkeleton/RabbiRailSkeleton';
import { StateCard } from '~/components/StateCard/StateCard';
import { TitleSkeleton } from '~/components/TitleSkeleton/TitleSkeleton';
import { dayGroupHeading, groupByDay } from '~/helpers';
import { useDateFilter } from '~/hooks/useDateFilter';
import { useSearchQuery } from '~/hooks/useSearchQuery';
import { useSelectedCity } from '~/hooks/useSelectedCity';

import * as consts from './consts';
import { dateLabel, hasSearchOrDateFilter, resolveWindow } from './helpers';
import type { WomenLessonsFilters, WomenPageProps } from './models';
import * as styles from './styles';
import { useAreaFallbackLessons } from './useAreaFallbackLessons';
import { useCityAreaLookup } from './useCityAreaLookup';
import { useWomenLessons } from './useWomenLessons';
import { useWomenSummary } from './useWomenSummary';

// The server does the range (helpers.ts, `resolveWindow`): a rolling window
// with no date chosen, one day when a date is chosen. "Load more" pages
// through a fixed page size (useWomenLessons.ts, useLessonListPages.ts).
// The summary behind the rail and this page's own lesson search run
// together; the area lookup and its own lesson fallback only fire once the
// main search is known empty, with a city chosen and no date or search
// (the widen-to-area card has no approved date-aware copy, so a date or a
// search, city or not, goes through the filtered-empty state instead).
export const WomenPage = styled(({ className }: WomenPageProps) => {
  const summaryQuery = useWomenSummary();
  const { option, customDate, clearDate } = useDateFilter();
  const { city, select: selectCity, clear: clearCity } = useSelectedCity();
  const { query, setQuery } = useSearchQuery();

  const hasDateFilter = option !== 'all';
  const range = resolveWindow(option, customDate);
  const filters: WomenLessonsFilters = { city: city?.id, from: range.from, to: range.to, q: query || undefined };
  const lessonsQuery = useWomenLessons(filters);

  const items = lessonsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = lessonsQuery.data?.pages[0]?.total ?? 0;
  // Never derived from a placeholder page (the previous filter's data,
  // kept up during the new filter's own first fetch): a filter change must
  // never flash the previous filter's empty card, or start the widen
  // lookup, while the new filter is still in flight.
  const isSettled = lessonsQuery.isSuccess && !lessonsQuery.isPlaceholderData;
  const isEmpty = isSettled && items.length === 0;
  const hasFilter = hasSearchOrDateFilter(option, query);
  const lookupEnabled = isEmpty && Boolean(city) && !hasFilter;

  const areaLookupQuery = useCityAreaLookup(city, lookupEnabled);
  const resolvedArea = areaLookupQuery.data;
  const hasResolvedArea = Boolean(resolvedArea);
  const areaFallbackQuery = useAreaFallbackLessons(resolvedArea?.area, range, lookupEnabled && hasResolvedArea);

  const isLookupPending = areaLookupQuery.isPending;
  const isFallbackPending = hasResolvedArea && areaFallbackQuery.isPending;
  const isWidenLoading = isLookupPending || isFallbackPending;
  const widenUnavailable =
    (!isLookupPending && !hasResolvedArea) || (hasResolvedArea && areaFallbackQuery.isError);
  const isAreaAlsoEmpty =
    hasResolvedArea && !areaFallbackQuery.isPending && !areaFallbackQuery.isError && (areaFallbackQuery.data?.items.length ?? 0) === 0;
  const showWidenedGroup =
    hasResolvedArea && !areaFallbackQuery.isPending && !areaFallbackQuery.isError && (areaFallbackQuery.data?.items.length ?? 0) > 0;

  const cityEmptyBody = (cityName: string): string | undefined => {
    if (isLookupPending) return undefined;
    if (widenUnavailable) return consts.noAreaFoundBody(cityName);
    if (resolvedArea && isAreaAlsoEmpty) return consts.areaAlsoEmptyBody(resolvedArea.areaName, cityName);
    return resolvedArea ? consts.widenedToAreaBody(resolvedArea.areaName, cityName) : undefined;
  };

  const dayGroups = groupByDay(items);

  const activeDateLabel = hasDateFilter ? dateLabel(range.from) : undefined;
  const hasAnyFilter = Boolean(city) || hasDateFilter || Boolean(query);
  const subheadingCount = hasAnyFilter ? total : summaryQuery.data?.kind === 'populated' ? summaryQuery.data.lessonCount : 0;

  // The filtered-but-empty state's own way back: clears date and search,
  // never the city, since a city can be chosen alongside it.
  const clearDateAndSearchFilters = (): void => {
    clearDate();
    setQuery('');
  };

  const cityChipRefs = useRef(new Map<string, HTMLLIElement>());
  useEffect(() => {
    if (!city) return;
    cityChipRefs.current.get(city.id)?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }, [city?.id]);

  const heading = city ? consts.pageTitleForCity(city.name) : consts.PAGE_TITLE;

  const filteredEmptyHeading =
    query && hasDateFilter ? (
      <>
        {consts.FILTERED_EMPTY_SEARCH_PREFIX}
        <bdi>{query}</bdi>
        {consts.filteredEmptyBothSuffix(dateLabel(range.from))}
      </>
    ) : query ? (
      <>
        {consts.FILTERED_EMPTY_SEARCH_PREFIX}
        <bdi>{query}</bdi>
        {consts.FILTERED_EMPTY_QUOTE_CLOSE}
      </>
    ) : (
      consts.filteredEmptyDateHeadline(dateLabel(range.from))
    );

  return (
    <main className={className}>
      {lessonsQuery.isPending && (
        <>
          <TitleSkeleton />
          <RabbiRailSkeleton />
          <DayGroupSkeleton />
        </>
      )}

      {!lessonsQuery.isPending && (lessonsQuery.isError || summaryQuery.isError) && (
        <StateCard
          variant="surface"
          headingLevel="h1"
          heading={consts.ERROR_HEADING}
          body={consts.ERROR_BODY}
          action={{
            actionLabel: consts.RETRY_LABEL,
            actionStyle: 'primary',
            onAction: () => {
              lessonsQuery.refetch();
              summaryQuery.refetch();
            },
          }}
        />
      )}

      {!lessonsQuery.isPending && !lessonsQuery.isError && !summaryQuery.isError && summaryQuery.data && (
        <>
          <div className="title">
            <h1 className="heading" dir="auto">
              {heading}
            </h1>
            {!isEmpty && <p className="sub">{consts.pageSubheading(subheadingCount, activeDateLabel, Boolean(city))}</p>}
            {lessonsQuery.isPlaceholderData && (
              <p className="pendingCue" aria-live="polite">
                {consts.LOADING_MORE_LABEL}
              </p>
            )}
          </div>

          {!isEmpty && summaryQuery.data.kind === 'populated' && (
            <RabbiRail
              {...{
                heading: consts.RAIL_HEADING,
                rabbis: summaryQuery.data.teachers,
                allLink: { label: consts.ALL_RABBANIYOT_LABEL, to: consts.ALL_RABBANIYOT_PATH },
              }}
            />
          )}

          {!isEmpty && summaryQuery.data.kind === 'populated' && summaryQuery.data.cities.length > 0 && (
            <section className="citiesSection">
              <h2 className="heading">{consts.CITIES_HEADING}</h2>
              <ul className="citiesRail">
                {summaryQuery.data.cities.map((summaryCity) => (
                  <li
                    key={summaryCity.id}
                    className="cell"
                    ref={(element) => {
                      if (element) cityChipRefs.current.set(summaryCity.id, element);
                      else cityChipRefs.current.delete(summaryCity.id);
                    }}
                  >
                    <CityChip
                      {...{
                        city: summaryCity,
                        lessonCount: summaryCity.lessonCount,
                        selected: city?.id === summaryCity.id,
                        onSelect: () =>
                          city?.id === summaryCity.id ? clearCity() : selectCity({ id: summaryCity.id, name: summaryCity.name }),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!isEmpty &&
            dayGroups.map((group) => (
              <DayGroup key={group.date} {...{ heading: dayGroupHeading(group.date), items: group.items, surface: 'womensArea' }} />
            ))}

          {!isEmpty && lessonsQuery.hasNextPage && (
            <QuietButton
              className="loadMore"
              {...{
                label: lessonsQuery.isFetchingNextPage ? consts.LOADING_MORE_LABEL : consts.MORE_LABEL,
                onClick: () => lessonsQuery.fetchNextPage(),
                disabled: lessonsQuery.isFetchingNextPage,
              }}
            />
          )}

          {isSettled && isEmpty && city && !hasFilter && (
            <>
              <StateCard
                variant="empty"
                headingLevel="h2"
                heading={consts.noLessonsInCityHeading(city.name)}
                body={cityEmptyBody(city.name)}
                action={{ actionLabel: consts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
              />

              {isWidenLoading && <DayGroupSkeleton />}

              {showWidenedGroup && resolvedArea && areaFallbackQuery.data && (
                <DayGroup
                  {...{
                    heading: consts.widenedGroupHeading(resolvedArea.areaName),
                    items: areaFallbackQuery.data.items,
                    surface: 'womensArea',
                  }}
                />
              )}
            </>
          )}

          {isSettled && isEmpty && hasFilter && (
            <StateCard
              variant="surface"
              headingLevel="h2"
              heading={filteredEmptyHeading}
              body={consts.FILTERED_EMPTY_BODY}
              action={{ actionLabel: consts.CLEAR_FILTERS_LABEL, actionStyle: 'quiet', onAction: clearDateAndSearchFilters }}
            />
          )}

          {isSettled && isEmpty && !city && !hasFilter && (
            <>
              <StateCard
                variant="empty"
                headingLevel="h2"
                heading={consts.NOTHING_YET_HEADING}
                body={consts.NOTHING_YET_BODY}
                action={{ actionLabel: consts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
              />

              {summaryQuery.data.kind === 'empty' && (
                <RabbiRail
                  {...{
                    heading: consts.RAIL_HEADING,
                    rabbis: summaryQuery.data.rabbaniyot,
                    allLink: { label: consts.ALL_RABBANIYOT_LABEL, to: consts.ALL_RABBANIYOT_PATH },
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </main>
  );
})`
  ${styles.WomenPage}
`;
