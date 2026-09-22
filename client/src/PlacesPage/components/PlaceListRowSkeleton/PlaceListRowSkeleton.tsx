import styled from 'styled-components';

import type { PlaceListRowSkeletonProps } from './models';
import * as styles from './styles';

export const PlaceListRowSkeleton = styled(({ className }: PlaceListRowSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="thumbnail" />
    <div className="text">
      <div className="nameBar" />
      <div className="metaBar" />
    </div>
  </div>
))`
  ${styles.PlaceListRowSkeleton}
`;
