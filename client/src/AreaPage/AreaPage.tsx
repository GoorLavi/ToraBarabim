import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { useResultsShownTracking } from '~/analytics/useResultsShownTracking';
import { BackLink } from '~/components/BackLink/BackLink';
import { CityAreaSectionSkeleton } from '~/components/CityAreaSectionSkeleton/CityAreaSectionSkeleton';
import { CityChip } from '~/components/CityChip/CityChip';
import { DayGroup } from '~/components/DayGroup/DayGroup';
import { DayGroupSkeleton } from '~/components/DayGroupSkeleton/DayGroupSkeleton';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { StateCard } from '~/components/StateCard/StateCard';
import { TitleSkeleton } from '~/components/TitleSkeleton/TitleSkeleton';
import { BACK_TO_ALL_CITIES_LABEL } from '~/consts';
import { dayGroupHeading, groupByDay } from '~/helpers';

import { AreaEmptyState } from './components/AreaEmptyState/AreaEmptyState';
import * as consts from './consts';
import { areaErrorCopy } from './helpers';
import type { AreaPageProps } from './models';
import * as styles from './styles';
import { useAreaDetail } from './useAreaDetail';
import { useAreaLessons } from './useAreaLessons';
import { useOtherAreas } from './useOtherAreas';

// The cities strip is the page's reason to exist rather than a `?area=`
// query string, so it sits above the lessons and stays up even if the
// lessons call fails (design spec, "choose where, then read when"). Call 1
// (area detail) resolves the slug into the `Area` enum call 2 needs, so
// call 2 cannot fire speculatively with the slug; call 3 (other areas)
// only fires once call 1 comes back with no cities (useAreaLessons.ts,
// useOtherAreas.ts).
export const AreaPage = styled(({ className }: AreaPageProps) => {
  const { slug: areaSlug = '' } = useParams();
  const areaQuery = useAreaDetail(areaSlug);
  const area = areaQuery.data;
  const errorCopy = areaQuery.error ? areaErrorCopy(areaQuery.error) : null;

  const hasCities = Boolean(area && area.cities.length > 0);
  const [pageSize, setPageSize] = useState(consts.AREA_LESSONS_PAGE_SIZE);
  const lessonsQuery = useAreaLessons(hasCities ? area?.area : undefined, pageSize);
  const isWindowEmpty = Boolean(lessonsQuery.data && lessonsQuery.data.items.length === 0);
  const otherAreasQuery = useOtherAreas(Boolean(areaQuery.isSuccess && area && !hasCities));

  const areaName = area?.areaName ?? '';
  const dayGroups = lessonsQuery.data ? groupByDay(lessonsQuery.data.items) : [];
  const hasMore = Boolean(lessonsQuery.data && lessonsQuery.data.items.length < lessonsQuery.data.total);
  const canShowSubheading = Boolean(hasCities && lessonsQuery.data && lessonsQuery.data.items.length > 0);

  useResultsShownTracking(
    {
      resultSetKey: consts.AREA_PAGE_QUERY_KEYS.lessonsResultSet(hasCities ? area?.area : undefined),
      dataUpdatedAt: lessonsQuery.dataUpdatedAt,
      isPending: lessonsQuery.isPending,
      isError: lessonsQuery.isError,
    },
    {
      surface: 'areaPage',
      resultCount: lessonsQuery.data?.items.length ?? 0,
      hasResults: (lessonsQuery.data?.items.length ?? 0) > 0,
      ...(areaName ? { areaName } : {}),
    },
  );

  return (
    <main className={className}>
      <BackLink to="/cities" label={BACK_TO_ALL_CITIES_LABEL} />

      {areaQuery.isPending && (
        <>
          <TitleSkeleton />
          <CityAreaSectionSkeleton />
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
              trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'areaPageDetail' });
              areaQuery.refetch();
            },
          }}
        />
      )}

      {area && (
        <>
          <div className="title">
            <h1 className="heading" dir="auto">
              {consts.areaHeading(area.areaName)}
            </h1>

            {canShowSubheading && lessonsQuery.data && (
              <p className="sub">{consts.areaSubheading(lessonsQuery.data.total, area.cities.length)}</p>
            )}
          </div>

          {!hasCities && (
            <AreaEmptyState
              areaName={areaName}
              otherAreas={otherAreasQuery.data?.areas}
              isOtherAreasPending={otherAreasQuery.isPending}
              isOtherAreasError={otherAreasQuery.isError}
            />
          )}

          {hasCities && (
            <>
              <section className="citiesSection">
                <h2 className="heading">{consts.citiesHeading(area.areaName)}</h2>
                <ul className="grid">
                  {area.cities.map((city) => (
                    <li key={city.id} className="cell">
                      <CityChip city={city} />
                    </li>
                  ))}
                </ul>
              </section>

              {lessonsQuery.isPending && <DayGroupSkeleton />}

              {!lessonsQuery.isPending && lessonsQuery.isError && (
                <StateCard
                  variant="surface"
                  headingLevel="h2"
                  heading={consts.ERROR_HEADING}
                  body={consts.ERROR_BODY}
                  action={{
                    actionLabel: consts.RETRY_LABEL,
                    actionStyle: 'primary',
                    onAction: () => {
                      trackEvent(MIXPANEL_EVENTS.retryClick, { surface: 'areaPageLessons' });
                      lessonsQuery.refetch();
                    },
                  }}
                />
              )}

              {!lessonsQuery.isPending && !lessonsQuery.isError && isWindowEmpty && (
                <StateCard
                  variant="empty"
                  headingLevel="h2"
                  heading={consts.windowEmptyHeading(areaName)}
                  body={consts.WINDOW_EMPTY_BODY}
                  action={{ actionLabel: consts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
                />
              )}

              {!lessonsQuery.isPending && !lessonsQuery.isError && !isWindowEmpty && (
                <>
                  {dayGroups.map((group) => (
                    <DayGroup key={group.date} {...{ heading: dayGroupHeading(group.date), items: group.items, surface: 'areaPage' as const }} />
                  ))}

                  {hasMore && (
                    <QuietButton
                      className="loadMore"
                      label={consts.loadMoreLabel(area.areaName)}
                      onClick={() => setPageSize((current) => current + consts.AREA_LESSONS_PAGE_SIZE)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
})`
  ${styles.AreaPage}
`;
