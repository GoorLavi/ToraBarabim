import classNames from 'classnames';
import styled from 'styled-components';

import { DedicationUnit } from '~/components/DedicationUnit/DedicationUnit';

import * as consts from './consts';
import type { DedicationBandProps, DedicationBandTrackProps } from './models';
import * as styles from './styles';
import { useDedicationCrawl } from './useDedicationCrawl';

// Split out of `DedicationBand` because `useDedicationCrawl` is a hook: the
// rules of hooks forbid calling it after `DedicationBand`'s own early
// return on an absent or empty group, so the track, which only ever mounts
// once a group is known non-empty, is its own component instead. Owns the
// `overflowing`/`dragging` classes itself, because they belong on the same
// element the hook measures.
const DedicationBandTrack = ({ className, group, variant }: DedicationBandTrackProps) => {
  const crawl = useDedicationCrawl();

  return (
    <section className={classNames(className, { overflowing: crawl.isOverflowing, dragging: crawl.isDragging })}>
      <div
        className="viewport"
        ref={crawl.viewportRef}
        role={crawl.isOverflowing ? 'region' : undefined}
        tabIndex={crawl.isOverflowing ? 0 : undefined}
        aria-label={crawl.isOverflowing ? consts.VIEWPORT_ARIA_LABEL_BY_TYPE[group.type] : undefined}
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
        {/* The crawl's own looped duplicate, needed only for the seamless
            wrap: hidden from a screen reader so it never meets this band's
            own names twice. */}
        {crawl.isOverflowing && (
          <div className="track duplicate" aria-hidden="true">
            {group.items.map((dedication) => (
              <DedicationUnit key={dedication.id} {...{ text: dedication.text, variant }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// The same component at every placement, never a second one: `variant`
// names the field it sits on (design-system.md, Placement). Each placement
// is fixed to one `DedicationType`; a missing or empty group renders
// nothing at all, and a group hands off to `DedicationBandTrack`.
export const DedicationBand = styled(({ className, group, variant }: DedicationBandProps) => {
  if (!group || group.items.length === 0) return null;

  return <DedicationBandTrack className={classNames(className, variant)} {...{ group, variant }} />;
})`
  ${styles.DedicationBand}
`;
