import { CourseCard } from '~/components/CourseCard/CourseCard';
import { Rail } from '~/components/Rail/Rail';

import * as consts from './consts';
import type { CourseRailProps } from './models';

// A rail of `CourseCard`s, ending flush at one or two courses (2026-09-25
// amendment: no "מה זה קורס?" tile). Owns nothing but the cards; the row
// itself is `Rail`'s (components/Rail).
export const CourseRail = ({ className, title, items, surface }: CourseRailProps) => (
  <Rail {...{ className, title, prevLabel: consts.PREV_LABEL, nextLabel: consts.NEXT_LABEL }}>
    {items.map((course, index) => (
      <li key={course.id}>
        <CourseCard {...{ course, clickContext: { surface, position: index } }} />
      </li>
    ))}
  </Rail>
);
