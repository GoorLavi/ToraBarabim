import styled from 'styled-components';

import type { TitleSkeletonProps } from './models';
import * as styles from './styles';

export const TitleSkeleton = styled(({ className }: TitleSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="bar heading" />
    <div className="bar sub" />
  </div>
))`
  ${styles.TitleSkeleton}
`;
