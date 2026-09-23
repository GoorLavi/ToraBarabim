import classNames from 'classnames';
import styled from 'styled-components';

import { DedicationUnit } from '~/components/DedicationUnit/DedicationUnit';

import * as consts from './consts';
import type { DedicationBandProps } from './models';
import * as styles from './styles';
import { useDedicationCrawl } from './useDedicationCrawl';

// The same component at both placements, never a second one: `variant`
// names the field it sits on (design-system.md, Placement). Renders nothing
// at all when there is no drawn group, which covers both "the draw has not
// run yet" (the very first render, server and client alike) and "the pool
// is genuinely empty": neither shows an empty band or a spacer.
export const DedicationBand = styled(({ className, group, variant }: DedicationBandProps) => {
  const crawl = useDedicationCrawl();

  if (!group || group.items.length === 0) return null;

  return (
    <section className={classNames(className, variant, { overflowing: crawl.isOverflowing, dragging: crawl.isDragging })}>
      <div
        className="viewport"
        ref={crawl.viewportRef}
        tabIndex={0}
        role="region"
        aria-label={consts.VIEWPORT_ARIA_LABEL}
        onPointerDown={crawl.onPointerDown}
        onPointerMove={crawl.onPointerMove}
        onPointerUp={crawl.onPointerUp}
        onPointerCancel={crawl.onPointerCancel}
        onPointerEnter={crawl.onPointerEnter}
        onPointerLeave={crawl.onPointerLeave}
        onFocus={crawl.onFocus}
        onBlur={crawl.onBlur}
        onKeyDown={crawl.onKeyDown}
      >
        <div className="track" ref={crawl.trackRef}>
          {group.items.map((dedication) => (
            <DedicationUnit key={dedication.id} {...{ text: dedication.text, variant }} />
          ))}
        </div>
        {/* Accepted deliberately: a screen reader meets the same names
            twice, once per region (design-system.md, Placement), so this
            duplicate, needed only for the crawl's seamless wrap, is the one
            copy that must stay hidden from it. */}
        {crawl.isOverflowing && (
          <div className="track duplicate" aria-hidden="true">
            {group.items.map((dedication) => (
              <DedicationUnit key={dedication.id} {...{ text: dedication.text, variant }} />
            ))}
          </div>
        )}
      </div>

      {crawl.isOverflowing && (
        <>
          <div className="fade start" />
          <div className="fade end" />
        </>
      )}
    </section>
  );
})`
  ${styles.DedicationBand}
`;
