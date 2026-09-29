import { useRef } from 'react';
import styled from 'styled-components';

import { scrollRailBy } from './helpers';
import type { RailProps } from './models';
import * as styles from './styles';
import { useRailScrollTracking } from './useRailScrollTracking';
import { useScrollEdges } from './useScrollEdges';

// The shared shell behind every horizontally scrolling row on the home
// page: the heading, the arrow pair, the scroll container and its edge
// tracking (design-system.md, "Horizontal rails"). A caller supplies its
// own `<li>` items as `children` and never reaches into this component to
// change what a rail carries.
export const Rail = styled(({ className, title, prevLabel, nextLabel, children }: RailProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { atStart, atEnd } = useScrollEdges(scrollerRef);
  useRailScrollTracking(scrollerRef, title);

  const scroll = (direction: 'prev' | 'next'): void => {
    if (scrollerRef.current) scrollRailBy(scrollerRef.current, direction);
  };

  return (
    <section className={className}>
      <h2 className="heading" dir="auto">
        {title}
      </h2>

      <div className="scrollerWrap">
        <button type="button" className="arrow prev" disabled={atStart} onClick={() => scroll('prev')} aria-label={prevLabel}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="scrollerGroup" ref={scrollerRef}>
          <ul className="scroller">{children}</ul>
        </div>

        <button type="button" className="arrow next" disabled={atEnd} onClick={() => scroll('next')} aria-label={nextLabel}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
})`
  ${styles.Rail}
`;
