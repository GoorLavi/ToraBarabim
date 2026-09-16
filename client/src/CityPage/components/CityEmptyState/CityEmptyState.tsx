import styled from 'styled-components';

import * as pageConsts from '~/CityPage/consts';
import { StateCard } from '~/components/StateCard/StateCard';
import { DayGroup } from '~/components/DayGroup/DayGroup';
import { DayGroupSkeleton } from '~/components/DayGroupSkeleton/DayGroupSkeleton';

import { AreaLink } from '../AreaLink/AreaLink';
import type { CityEmptyStateProps } from './models';
import * as styles from './styles';

// The ratified empty state, widened to the area, the one axis this page
// actually has (design-system.md, "Every data screen has three states";
// design spec, "the state the design system says carries the most
// weight"). While the area fetch is still pending its body optimistically
// reads as "widened", correcting to the "also empty" copy once resolved;
// an area-fetch failure degrades quietly, the same choice
// RabbiEmptyLessons makes for its own fallback. The area link stays
// reachable regardless of how that fetch resolves: the person landed here
// through the city, and the area page is the route onward
// (design spec, "close the hole CityEmptyState left").
export const CityEmptyState = styled(
  ({ className, cityName, areaName, areaSlug, areaItems, isAreaPending, isAreaError }: CityEmptyStateProps) => {
    const isAreaAlsoEmpty = !isAreaPending && !isAreaError && areaItems?.length === 0;
    const body = isAreaAlsoEmpty ? pageConsts.areaAlsoEmptyBody(areaName) : pageConsts.widenedToAreaBody(cityName, areaName);
    const showAreaGroup = !isAreaError && (isAreaPending || (areaItems && areaItems.length > 0));

    return (
      <div className={className}>
        <StateCard
          variant="empty"
          headingLevel="h2"
          heading={pageConsts.noLessonsHeading(cityName)}
          body={body}
          action={{ actionLabel: pageConsts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
        />

        {showAreaGroup &&
          (isAreaPending ? (
            <DayGroupSkeleton />
          ) : (
            <DayGroup heading={pageConsts.areaGroupHeading(areaName)} items={areaItems ?? []} surface="general" />
          ))}

        <AreaLink {...{ areaSlug, areaName }} />
      </div>
    );
  },
)`
  ${styles.CityEmptyState}
`;
