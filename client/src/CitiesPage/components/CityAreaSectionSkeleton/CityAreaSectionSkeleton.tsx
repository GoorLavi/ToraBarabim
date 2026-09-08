import styled from 'styled-components';

import * as consts from './consts';
import type { CityAreaSectionSkeletonProps } from './models';
import * as styles from './styles';

export const CityAreaSectionSkeleton = styled(({ className }: CityAreaSectionSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="headingBar" />
    <div className="grid">
      {consts.CHIP_SKELETON_KEYS.map((key) => (
        <div className="chipBar" key={key} />
      ))}
    </div>
  </div>
))`
  ${styles.CityAreaSectionSkeleton}
`;
