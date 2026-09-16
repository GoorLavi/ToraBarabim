import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { useResultsShownTracking } from '~/analytics/useResultsShownTracking';
import { BackLink } from '~/components/BackLink/BackLink';
import { DayGroup } from '~/components/DayGroup/DayGroup';
import { DayGroupSkeleton } from '~/components/DayGroupSkeleton/DayGroupSkeleton';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { RabbiRail } from '~/components/RabbiRail/RabbiRail';
import { RabbiRailSkeleton } from '~/components/RabbiRailSkeleton/RabbiRailSkeleton';
import { StateCard } from '~/components/StateCard/StateCard';
import { TitleSkeleton } from '~/components/TitleSkeleton/TitleSkeleton';
import { BACK_TO_ALL_CITIES_LABEL } from '~/consts';
import { dayGroupHeading, groupByDay } from '~/helpers';

import { AreaLink } from './components/AreaLink/AreaLink';
import { CityEmptyState } from './components/CityEmptyState/CityEmptyState';
import * as consts from './consts';
import { cityErrorCopy } from './helpers';
import type { CityPageProps } from './models';
import * as styles from './styles';
import { useAreaLessons } from './useAreaLessons';
import { useCityDetail } from './useCityDetail';
import { useCityLessons } from './useCityLessons';

// Once someone has chosen where, the only question left is when (design
// spec, guidance intent): lessons group by day, with a rail of who teaches
// here above them. Call 1 (city detail) resolves the slug into the numeric
// code call 2 needs, so call 2 cannot fire speculatively with the slug; call
// 3 (the area) only fires once call 2 comes back empty (useCityLessons.ts,
// useAreaLessons.ts).
export const CityPage = styled(({ className }: CityPageProps) => {
  const { slug: citySlug = '' } = useParams();
  const cityQuery = useCityDetail(citySlug);
  const city = cityQuery.data;
  const errorCopy = cityQuery.error ? cityErrorCopy(cityQuery.error) : null;

  const lessonsQuery = useCityLessons(city?.id, Boolean(city));
  const items = lessonsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = lessonsQuery.data?.pages[0]?.total ?? 0;
  // A failed "load more" (isFetchNextPageError) leaves the already-loaded
  // pages in place, so it is never this, the full-page error: that only
  // fires when there is no data to show at all.
  const hasInitialError = lessonsQuery.isError && !lessonsQuery.data;
  const isCityResolvedEmpty = lessonsQuery.isSuccess && items.length === 0;
  const areaQuery = useAreaLessons(city?.area, Boolean(isCityResolvedEmpty));

  const areaName = city?.areaName ?? '';
  const dayGroups = groupByDay(items);
  const canShowRail = Boolean(city && !isCityResolvedEmpty && city.rabbis.length > 0);
  const canShowSubheading = Boolean(!isCityResolvedEmpty && lessonsQuery.isSuccess);

  useResultsShownTracking(
    {
      resultSetKey: consts.CITY_PAGE_QUERY_KEYS.lessons(city?.id ?? ''),
      dataUpdatedAt: lessonsQuery.dataUpdatedAt,
      isPending: lessonsQuery.isPending,
      isError: lessonsQuery.isError,
    },
    {
      surface: 'cityPage',
      resultCount: items.length,
      hasResults: items.length > 0,
      ...(city?.id ? { cityId: city.id } : {}),
      ...(city?.name ? { cityName: city.name } : {}),
    },
  );

  return (
    <main className={className}>
      <BackLink to="/cities" label={BACK_TO_ALL_CITIES_LABEL} />

      {cityQuery.isPending && (
        <>
          <TitleSkeleton />
          <RabbiRailSkeleton />
          <DayGroupSkeleton />
        </>
      )}

      {errorCopy?.kind === 'not-found' && (
        <StateCard
          variant="surface"
          headingLevel="h1"
          heading={errorCopy.heading}
          body={errorCopy.body}
          action={{ actionLabel: consts.ALL_CITIES_LABEL, actionStyle: 'primary', actionTo: '/cities' }}
        />
      )}

      {errorCopy?.kind === 'error' && (
        <StateCard
          variant="surface"
          headingLevel="h1"
          heading={errorCopy.heading}
          body={errorCopy.body}
          action={{
            actionLabel: consts.RETRY_LABEL,
            actionStyle: 'primary',
            onAction: () => {
              trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'cityPageDetail' });
              cityQuery.refetch();
            },
          }}
        />
      )}

      {city && (
        <>
          <div className="title">
            <h1 className="heading" dir="auto">
              {consts.cityHeading(city.name)}
            </h1>

            {canShowSubheading && (
              <>
                <p className="sub">{consts.citySubheading(total)}</p>
                <AreaLink areaSlug={city.areaSlug} {...{ areaName }} />
              </>
            )}
          </div>

          {canShowRail && <RabbiRail {...{ heading: consts.whoTeachesHeading(city.name), rabbis: city.rabbis }} />}

          {lessonsQuery.isPending && <DayGroupSkeleton />}

          {!lessonsQuery.isPending && hasInitialError && (
            <StateCard
              variant="surface"
              headingLevel="h2"
              heading={consts.ERROR_HEADING}
              body={consts.ERROR_BODY}
              action={{
                actionLabel: consts.RETRY_LABEL,
                actionStyle: 'primary',
                onAction: () => {
                  trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'cityPageLessons' });
                  lessonsQuery.refetch();
                },
              }}
            />
          )}

          {!lessonsQuery.isPending && !hasInitialError && isCityResolvedEmpty && (
            <CityEmptyState
              cityName={city.name}
              areaSlug={city.areaSlug}
              areaName={areaName}
              areaItems={areaQuery.data?.items}
              isAreaPending={areaQuery.isPending}
              isAreaError={areaQuery.isError}
            />
          )}

          {!lessonsQuery.isPending && !hasInitialError && !isCityResolvedEmpty && (
            <>
              {dayGroups.map((group) => (
                <DayGroup
                  key={group.date}
                  {...{
                    heading: dayGroupHeading(group.date),
                    items: group.items,
                    surface: 'general' as const,
                    clickSurface: 'cityPage' as const,
                  }}
                />
              ))}

              {lessonsQuery.hasNextPage && (
                <QuietButton
                  className="loadMore"
                  {...{
                    label: lessonsQuery.isFetchNextPageError ? consts.LOAD_MORE_ERROR_LABEL : consts.loadMoreLabel(city.name),
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
  ${styles.CityPage}
`;
