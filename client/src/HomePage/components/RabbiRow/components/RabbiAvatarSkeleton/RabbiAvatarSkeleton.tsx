import styled from 'styled-components';

import type { RabbiAvatarSkeletonProps } from './models';
import * as styles from './styles';

export const RabbiAvatarSkeleton = styled(({ className }: RabbiAvatarSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="photo" />
    <div className="name" />
  </div>
))`
  ${styles.RabbiAvatarSkeleton}
`;
