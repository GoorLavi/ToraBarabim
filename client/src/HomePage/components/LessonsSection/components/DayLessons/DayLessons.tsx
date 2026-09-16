import { useState } from 'react';
import styled from 'styled-components';

import { LessonsGrid } from '~/components/LessonsGrid/LessonsGrid';
import { TextLink } from '~/HomePage/components/TextLink/TextLink';

import { SEE_ALL_LABEL } from '../../consts';
import { INITIAL_VISIBLE_COUNT } from './consts';
import type { DayLessonsProps } from './models';
import * as styles from './styles';

// No date inside the link's own label: the heading right above already
// states the day (LessonsSection/consts.ts, SEE_ALL_LABEL).
export const DayLessons = styled(({ className, headingLabel, items, showSeeAllLink, moreLabel, countLabel }: DayLessonsProps) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <section className={className}>
      <div className="heading">
        <h2 className="title" dir="auto">{headingLabel}</h2>
        {showSeeAllLink && (
          <TextLink className="seeAll" to="/lessons" withChevron>
            {SEE_ALL_LABEL}
          </TextLink>
        )}
      </div>

      {countLabel && <p className="count">{countLabel}</p>}

      <LessonsGrid {...{ items: visibleItems, surface: 'general' }} />

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
