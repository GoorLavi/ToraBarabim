import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { BackLink } from '~/components/BackLink/BackLink';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { StateCard } from '~/components/StateCard/StateCard';

import { CityEmptyState } from './components/CityEmptyState/CityEmptyState';
import { DayGroup } from './components/DayGroup/DayGroup';
import { DayGroupSkeleton } from './components/DayGroupSkeleton/DayGroupSkeleton';
import { RabbiRail } from './components/RabbiRail/RabbiRail';
import { RabbiRailSkeleton } from './components/RabbiRailSkeleton/RabbiRailSkeleton';
import { TitleSkeleton } from './components/TitleSkeleton/TitleSkeleton';
import * as consts from './consts';
import { cityErrorCopy, dayGroupHeading, groupByDay } from './helpers';
import type { CityPageProps } from './models';
import * as styles from './styles';
import { useAreaLessons } from './useAreaLessons';
import { useCityDetail } from './useCityDetail';
import { useCityLessons } from './useCityLessons';

// Once someone has chosen where, the only question left is when (design
// spec, guidance intent): lessons group by day, with a rail of who teaches
// here above them. Call 1 (city detail) resolves the name into the numeric
// code call 2 needs, so call 2 cannot fire speculatively with the name; call
// 3 (the area) only fires once call 2 comes back empty (useCityLessons.ts,
// useAreaLessons.ts).
export const CityPage = styled(({ className }: CityPageProps) => {
  const { cityName = '' } = useParams();
  const cityQuery = useCityDetail(cityName);
  const city = cityQuery.data;
  const errorCopy = cityQuery.error ? cityErrorCopy(cityQuery.error) : null;

  const [pageSize, setPageSize] = useState(consts.CITY_LESSONS_PAGE_SIZE);
  const lessonsQuery = useCityLessons(city?.id, pageSize);
  const isCityResolvedEmpty = lessonsQuery.data?.items.length === 0;
  const areaQuery = useAreaLessons(city?.area, Boolean(isCityResolvedEmpty));

  const areaName = city?.areaName ?? '';
  const dayGroups = lessonsQuery.data ? groupByDay(lessonsQuery.data.items) : [];
  const hasMore = Boolean(lessonsQuery.data && lessonsQuery.data.items.length < lessonsQuery.data.total);
  const canShowRail = Boolean(city && !isCityResolvedEmpty && city.rabbis.length > 0);
  const canShowSubheading = Boolean(!isCityResolvedEmpty && lessonsQuery.data);

  return (
    <div className={className}>
      <BackLink to="/cities" label={consts.BACK_TO_ALL_CITIES_LABEL} />

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
          action={{ actionLabel: consts.RETRY_LABEL, actionStyle: 'primary', onAction: () => cityQuery.refetch() }}
        />
      )}

      {city && (
        <>
          <div className="title">
            <h1 className="heading" dir="auto">
              {consts.cityHeading(city.name)}
            </h1>

            {canShowSubheading && lessonsQuery.data && (
              <>
                <p className="sub">{consts.citySubheading(lessonsQuery.data.total)}</p>
                <Link className="areaLink" to={`/lessons?area=${city.area}`}>
                  <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span dir="auto">{consts.areaLinkLabel(areaName)}</span>
                </Link>
              </>
            )}
          </div>

          {canShowRail && <RabbiRail cityName={city.name} rabbis={city.rabbis} />}

          {lessonsQuery.isPending && <DayGroupSkeleton />}

          {!lessonsQuery.isPending && lessonsQuery.isError && (
            <StateCard
              variant="surface"
              headingLevel="h2"
              heading={consts.ERROR_HEADING}
              body={consts.ERROR_BODY}
              action={{ actionLabel: consts.RETRY_LABEL, actionStyle: 'primary', onAction: () => lessonsQuery.refetch() }}
            />
          )}

          {!lessonsQuery.isPending && !lessonsQuery.isError && isCityResolvedEmpty && (
            <CityEmptyState
              cityName={city.name}
              areaName={areaName}
              areaItems={areaQuery.data?.items}
              isAreaPending={areaQuery.isPending}
              isAreaError={areaQuery.isError}
            />
          )}

          {!lessonsQuery.isPending && !lessonsQuery.isError && !isCityResolvedEmpty && (
            <>
              {dayGroups.map((group) => (
                <DayGroup key={group.date} heading={dayGroupHeading(group.date)} items={group.items} />
              ))}

              {hasMore && (
                <QuietButton
                  className="loadMore"
                  label={consts.loadMoreLabel(city.name)}
                  onClick={() => setPageSize((current) => current + consts.CITY_LESSONS_PAGE_SIZE)}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
})`
  ${styles.CityPage}
`;
