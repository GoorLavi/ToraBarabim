import styled from 'styled-components';

import type { RabbiListRowSkeletonProps } from './models';
import * as styles from './styles';

export const RabbiListRowSkeleton = styled(({ className }: RabbiListRowSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="avatar" />
    <div className="text">
      <div className="nameBar" />
      <div className="metaBar" />
    </div>
  </div>
))`
  ${styles.RabbiListRowSkeleton}
`;
