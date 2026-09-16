import styled from 'styled-components';

import { LessonsGrid } from '~/components/LessonsGrid/LessonsGrid';

import type { DayGroupProps } from './models';
import * as styles from './styles';

// Reused for both a calendar day and the area-widened fallback: either way
// it is one heading over one lesson grid (design spec, "One block per day"
// and "One day group whose heading is the area, not a day").
export const DayGroup = styled(({ className, heading, items, surface, clickSurface }: DayGroupProps) => (
  <section className={className}>
    <h2 className="heading" dir="auto">
      {heading}
    </h2>
    <LessonsGrid {...{ items, surface, clickSurface }} />
  </section>
))`
  ${styles.DayGroup}
`;
