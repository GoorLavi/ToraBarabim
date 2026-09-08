import styled from 'styled-components';

import type { LessonRowSkeletonProps } from './models';
import * as styles from './styles';

// A plain block, not a shaped skeleton: the loading frame draws the row
// skeleton as a solid 358x110 block, unlike the poster card's shaped
// skeleton (design spec, "Phone, loading").
export const LessonRowSkeleton = styled(({ className }: LessonRowSkeletonProps) => <div className={className} aria-hidden="true" />)`
  ${styles.LessonRowSkeleton}
`;
