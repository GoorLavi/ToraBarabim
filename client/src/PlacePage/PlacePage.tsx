import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { BackLink } from '~/components/BackLink/BackLink';
import { DayGroup } from '~/components/DayGroup/DayGroup';
import { DayGroupSkeleton } from '~/components/DayGroupSkeleton/DayGroupSkeleton';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { StateCard } from '~/components/StateCard/StateCard';
import { dayGroupHeading, groupByDay } from '~/helpers';

import { PlaceEmptyLessons } from './components/PlaceEmptyLessons/PlaceEmptyLessons';
import { PlaceHero } from './components/PlaceHero/PlaceHero';
import * as consts from './consts';
import { placeErrorCopy } from './helpers';
import type { PlacePageProps } from './models';
import * as styles from './styles';
import { usePlaceDetail } from './usePlaceDetail';
import { usePlaceLessons } from './usePlaceLessons';
import { useWidenedCityLessons } from './useWidenedCityLessons';

// The head card never gets a loading skeleton: its data is small enough to
// sit in the first-paint payload, so while `placeQuery` is pending nothing
// beyond the back link renders (build brief, "the head does not get a
// skeleton"). Only the lesson section below it gets `DayGroupSkeleton`.
// Call 1 (place detail) resolves the route's id. Call 2 (this place's own
// lessons) waits on it. Call 3 (other lessons in the same city) only fires
// once call 2 comes back empty (useWidenedCityLessons.ts).
export const PlacePage = styled(({ className }: PlacePageProps) => {
  const { placeId = '' } = useParams();
  const placeQuery = usePlaceDetail(placeId);
  const place = placeQuery.data;
  const errorCopy = placeQuery.error ? placeErrorCopy(placeQuery.error) : null;

  const lessonsQuery = usePlaceLessons(place?.id, Boolean(place));
  const items = lessonsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  // A failed "load more" (isFetchNextPageError) leaves the already-loaded
  // pages in place, so it is never this, the full-section error: that only
  // fires when there is no data to show at all (mirrors CityPage.tsx).
  const hasInitialError = lessonsQuery.isError && !lessonsQuery.data;
  const isPlaceResolvedEmpty = lessonsQuery.isSuccess && items.length === 0;
  const widenedQuery = useWidenedCityLessons(place?.citySlug, isPlaceResolvedEmpty);

  const lessonCount = lessonsQuery.isSuccess ? (lessonsQuery.data.pages[0]?.total ?? items.length) : undefined;
  const dayGroups = groupByDay(items);

  return (
    <main className={className}>
      <BackLink to="/places" label={consts.BACK_TO_ALL_PLACES_LABEL} />

      {errorCopy?.kind === 'not-found' && (
        <StateCard
          variant="surface"
          headingLevel="h1"
          heading={errorCopy.heading}
          body={errorCopy.body}
          action={{ actionLabel: consts.ALL_PLACES_LABEL, actionStyle: 'primary', actionTo: '/places' }}
        />
      )}

      {errorCopy?.kind === 'error' && (
        <StateCard
          variant="surface"
          headingLevel="h1"
          heading={errorCopy.heading}
          body={errorCopy.body}
          // No trackEvent(retryClick) here: RetrySurface (analytics/consts.ts)
          // has no 'placePageDetail' member yet and that file is outside this
          // builder's prefixes. Flagged in the build report.
          action={{ actionLabel: consts.RETRY_LABEL, actionStyle: 'primary', onAction: () => placeQuery.refetch() }}
        />
      )}

      {place && (
        <>
          <PlaceHero {...{ place, lessonCount }} />

          {lessonsQuery.isPending && <DayGroupSkeleton />}

          {!lessonsQuery.isPending && hasInitialError && (
            <StateCard
              variant="surface"
              headingLevel="h2"
              heading={consts.LESSONS_ERROR_HEADING}
              body={consts.LESSONS_ERROR_BODY}
              // See the detail error above: same analytics gap, same flag.
              action={{ actionLabel: consts.RETRY_LABEL, actionStyle: 'primary', onAction: () => lessonsQuery.refetch() }}
            />
          )}

          {!lessonsQuery.isPending && !hasInitialError && isPlaceResolvedEmpty && (
            <PlaceEmptyLessons
              cityName={place.city}
              widenedItems={widenedQuery.data?.items}
              isWidenedPending={widenedQuery.isPending}
              isWidenedError={widenedQuery.isError}
            />
          )}

          {!lessonsQuery.isPending && !hasInitialError && !isPlaceResolvedEmpty && (
            <>
              {dayGroups.map((group) => (
                <DayGroup
                  key={group.date}
                  {...{
                    heading: dayGroupHeading(group.date),
                    items: group.items,
                    surface: 'general' as const,
                    // 'cityPage' stands in for a 'placePage' click surface
                    // that does not exist yet in analytics/consts.ts
                    // (outside this builder's prefixes): flagged in the
                    // build report rather than added here.
                    clickSurface: 'cityPage' as const,
                  }}
                />
              ))}

              {lessonsQuery.hasNextPage && (
                <QuietButton
                  className="loadMore"
                  {...{
                    label: lessonsQuery.isFetchNextPageError ? consts.LOAD_MORE_ERROR_LABEL : consts.loadMoreLabel(place.name),
                    onClick: () => lessonsQuery.fetchNextPage(),
                    disabled: lessonsQuery.isFetchingNextPage,
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
  ${styles.PlacePage}
`;
