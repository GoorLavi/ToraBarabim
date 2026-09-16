import styled from 'styled-components';

import * as consts from './consts';
import type { RabbiRailSkeletonProps } from './models';
import * as styles from './styles';

export const RabbiRailSkeleton = styled(({ className }: RabbiRailSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="bar heading" />
    <div className="circles">
      {consts.CIRCLE_KEYS.map((key) => (
        <div className="circle" key={key} />
      ))}
    </div>
  </div>
))`
  ${styles.RabbiRailSkeleton}
`;
