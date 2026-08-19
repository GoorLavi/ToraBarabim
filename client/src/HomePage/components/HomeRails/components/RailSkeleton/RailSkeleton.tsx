import styled from 'styled-components';

import * as consts from './consts';
import type { RailSkeletonProps } from './models';
import * as styles from './styles';

export const RailSkeleton = styled(({ className }: RailSkeletonProps) => (
  <div className={className}>
    <div className="headingBar" />
    <div className="cards">
      {consts.CARD_KEYS.map((key) => (
        <div key={key} className="card">
          <div className="poster" />
          <div className="body" />
        </div>
      ))}
    </div>
  </div>
))`
  ${styles.RailSkeleton}
`;
