import styled from 'styled-components';

import { AreaLink } from '~/components/AreaLink/AreaLink';
import { LessonsGrid } from '~/components/LessonsGrid/LessonsGrid';
import { LessonsGridSkeleton } from '~/components/LessonsGridSkeleton/LessonsGridSkeleton';
import { StateCard } from '~/components/StateCard/StateCard';
import * as pageConsts from '~/PlacePage/consts';

import type { PlaceEmptyLessonsProps } from './models';
import * as styles from './styles';

// The ratified empty state, widened to the one axis this fallback has: not
// "this place", but the city it sits in (design-system.md, "Every data
// screen has three states"; build brief, "a real widened result below it").
// A failed or still-empty widened fetch degrades quietly: the place's own
// "no lessons" message above already stands on its own, so this block
// simply does not render rather than showing a second error, mirroring
// RabbiEmptyLessons and CityEmptyState. When the city is also empty this
// widens a second time, to the area, mirroring CityEmptyState's own
// city-to-area cascade one level later: a place page dead-ending on
// "כתבו לנו" alone, with less to act on than either sibling page, was
// findable and flagged as a must-fix (design gate finding F2).
export const PlaceEmptyLessons = styled(
  ({
    className,
    cityName,
    widenedItems,
    isWidenedPending,
    isWidenedError,
    areaName,
    areaSlug,
    areaItems,
    isAreaPending,
    isAreaError,
  }: PlaceEmptyLessonsProps) => {
    const isWidenedAlsoEmpty = !isWidenedPending && !isWidenedError && widenedItems?.length === 0;
    const body = isWidenedAlsoEmpty ? pageConsts.cityAlsoEmptyBody(cityName) : pageConsts.widenedToCityBody(cityName);
    const showCityGrid = !isWidenedError && (isWidenedPending || (widenedItems && widenedItems.length > 0));
    const showAreaGrid = isWidenedAlsoEmpty && !isAreaError && (isAreaPending || (areaItems && areaItems.length > 0));
    const canShowAreaLink = isWidenedAlsoEmpty && Boolean(areaSlug) && Boolean(areaName);

    return (
      <div className={className}>
        <StateCard
          variant="empty"
          headingLevel="h2"
          heading={pageConsts.EMPTY_HEADING}
          body={body}
          action={{ actionLabel: pageConsts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
        />

        {showCityGrid && (
          <div className="widened">
            <h2 className="heading" dir="auto">
              {pageConsts.otherCityLessonsHeading(cityName)}
            </h2>

            {isWidenedPending ? (
              <LessonsGridSkeleton {...{ cellCount: pageConsts.WIDENED_CITY_LESSONS_PAGE_SIZE }} />
            ) : (
              <LessonsGrid {...{ items: widenedItems ?? [], surface: 'general', clickSurface: 'placePage' as const }} />
            )}
          </div>
        )}

        {showAreaGrid && (
          <div className="widened">
            <h2 className="heading" dir="auto">
              {pageConsts.otherAreaLessonsHeading(areaName ?? '')}
            </h2>

            {isAreaPending ? (
              <LessonsGridSkeleton {...{ cellCount: pageConsts.WIDENED_AREA_LESSONS_PAGE_SIZE }} />
            ) : (
              <LessonsGrid {...{ items: areaItems ?? [], surface: 'general', clickSurface: 'placePage' as const }} />
            )}
          </div>
        )}

        {canShowAreaLink && areaSlug && areaName && <AreaLink {...{ areaSlug, areaName }} />}
      </div>
    );
  },
)`
  ${styles.PlaceEmptyLessons}
`;
