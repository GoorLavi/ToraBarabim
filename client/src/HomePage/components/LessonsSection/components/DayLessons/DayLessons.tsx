import { useState } from 'react';
import styled from 'styled-components';

import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import { SEE_ALL_LABEL } from '../../consts';
import { INITIAL_VISIBLE_COUNT } from './consts';
import type { DayLessonsProps } from './models';
import * as styles from './styles';

// The "see all" link has no destination yet: there is no lessons listing
// page in this slice. Rendered as static text, not an interactive element,
// so it never announces itself as clickable to assistive tech (see this
// component's entry in the client builder's report). No date in it either
// (LessonsSection/consts.ts, SEE_ALL_LABEL): the heading right above already
// states the day.
export const DayLessons = styled(({ className, headingLabel, items, showSeeAllLink, moreLabel }: DayLessonsProps) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <section className={className}>
      <div className="heading">
        <h2 dir="auto">{headingLabel}</h2>
        {showSeeAllLink && <span className="seeAll">{SEE_ALL_LABEL}</span>}
      </div>

      <ul className="grid">
        {visibleItems.map((item) => (
          <li key={`${item.lessonId}-${item.date}`}>
            <LessonCard lesson={item} />
          </li>
        ))}
      </ul>

      {hasMore && (
        <button type="button" className="more" onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_COUNT)}>
          {moreLabel}
        </button>
      )}
    </section>
  );
})`
  ${styles.DayLessons}
`;
