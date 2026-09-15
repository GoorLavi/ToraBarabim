import styled from 'styled-components';

import * as consts from './consts';
import type { CityPickerAreaSkeletonProps } from './models';
import * as styles from './styles';

// A dedicated skeleton rather than a reuse of `CityAreaSectionSkeleton`
// (~/components/CityAreaSectionSkeleton): that one grows to 3 and then 4
// columns from `md` up, matching the full-width `/cities` grid, while this
// panel is always narrow and stays at a fixed 2 columns regardless of
// viewport; the two also use different fill tokens and cell heights.
export const CityPickerAreaSkeleton = styled(({ className }: CityPickerAreaSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="captionBar" />
    <div className="grid">
      {consts.CELL_SKELETON_KEYS.map((key) => (
        <div className="cell" key={key} />
      ))}
    </div>
  </div>
))`
  ${styles.CityPickerAreaSkeleton}
`;
