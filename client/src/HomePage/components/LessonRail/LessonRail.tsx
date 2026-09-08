import { useRef } from 'react';
import styled from 'styled-components';

import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import * as consts from './consts';
import { scrollRailBy } from './helpers';
import type { LessonRailProps } from './models';
import * as styles from './styles';
import { useScrollEdges } from './useScrollEdges';

export const LessonRail = styled(({ className, title, items }: LessonRailProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { atStart, atEnd } = useScrollEdges(scrollerRef);

  const scroll = (direction: 'prev' | 'next'): void => {
    if (scrollerRef.current) scrollRailBy(scrollerRef.current, direction);
  };

  return (
    <section className={className}>
      <h2 className="heading" dir="auto">
        {title}
      </h2>

      <div className="scrollerWrap">
        <button type="button" className="arrow prev" disabled={atStart} onClick={() => scroll('prev')} aria-label={consts.PREV_LABEL}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="scrollerGroup" ref={scrollerRef}>
          <ul className="scroller">
            {items.map((item) => (
              <li key={`${item.lessonId}-${item.date}`}>
                <LessonCard lesson={item} />
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="arrow next" disabled={atEnd} onClick={() => scroll('next')} aria-label={consts.NEXT_LABEL}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
})`
  ${styles.LessonRail}
`;
