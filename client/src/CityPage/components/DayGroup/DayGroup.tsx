import styled from 'styled-components';

import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import type { DayGroupProps } from './models';
import * as styles from './styles';

// Reused for both a calendar day and the area-widened fallback: either way
// it is one heading over one lesson grid (design spec, "One block per day"
// and "One day group whose heading is the area, not a day").
export const DayGroup = styled(({ className, heading, items }: DayGroupProps) => (
  <section className={className}>
    <h2 className="heading" dir="auto">
      {heading}
    </h2>
    <ul className="grid">
      {items.map((item) => (
        <li className="cell" key={`${item.lessonId}-${item.date}`}>
          <LessonCard lesson={item} />
        </li>
      ))}
    </ul>
  </section>
))`
  ${styles.DayGroup}
`;
