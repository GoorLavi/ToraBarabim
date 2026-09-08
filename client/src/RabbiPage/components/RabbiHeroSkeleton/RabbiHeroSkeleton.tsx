import styled from 'styled-components';

import type { RabbiHeroSkeletonProps } from './models';
import * as styles from './styles';

// Static, no shimmer (design-system.md, Feel): the frame's own layer name
// is "טעינה (סטטי, בלי הבהוב)". Keeps the real hero's block size so nothing
// jumps once the rabbi loads (design spec, "Phone, loading").
export const RabbiHeroSkeleton = styled(({ className }: RabbiHeroSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="poster" />
    <div className="names">
      <div className="bar name" />
      <div className="bar title" />
      <div className="bar meta" />
    </div>
  </div>
))`
  ${styles.RabbiHeroSkeleton}
`;
