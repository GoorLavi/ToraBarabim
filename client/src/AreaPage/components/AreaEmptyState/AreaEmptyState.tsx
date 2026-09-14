import styled from 'styled-components';

import { CityAreaSectionSkeleton } from '~/components/CityAreaSectionSkeleton/CityAreaSectionSkeleton';
import { StateCard } from '~/components/StateCard/StateCard';

import * as pageConsts from '~/AreaPage/consts';

import { AreaChip } from '../AreaChip/AreaChip';
import type { AreaEmptyStateProps } from './models';
import * as styles from './styles';

// The genuinely empty area: there is no date axis and no wider place to
// widen to, so the honest widening is sideways, to the other areas that do
// have lessons (design spec, "the area is genuinely empty").
export const AreaEmptyState = styled(
  ({ className, areaName, otherAreas, isOtherAreasPending, isOtherAreasError }: AreaEmptyStateProps) => (
    <div className={className}>
      <StateCard
        variant="empty"
        headingLevel="h2"
        heading={pageConsts.noLessonsHeading(areaName)}
        body={pageConsts.AREA_EMPTY_BODY}
        action={{ actionLabel: pageConsts.CONTACT_US_LABEL, actionStyle: 'primary', actionTo: '/contact' }}
      />

      {!isOtherAreasError &&
        (isOtherAreasPending ? (
          <CityAreaSectionSkeleton />
        ) : (
          otherAreas &&
          otherAreas.length > 0 && (
            <section className="otherAreas">
              <h2 className="heading">{pageConsts.OTHER_AREAS_HEADING}</h2>
              <ul className="grid">
                {otherAreas.map((area) => (
                  <li key={area.area} className="cell">
                    <AreaChip {...{ area }} />
                  </li>
                ))}
              </ul>
            </section>
          )
        ))}
    </div>
  ),
)`
  ${styles.AreaEmptyState}
`;
