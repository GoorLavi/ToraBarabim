import classNames from 'classnames';
import styled from 'styled-components';

import { DedicationUnit } from '~/components/DedicationUnit/DedicationUnit';

import * as consts from './consts';
import type { DedicationBandDrawnProps, DedicationBandProps } from './models';
import * as styles from './styles';
import { useDedicationCrawl } from './useDedicationCrawl';

// Mounted only once a non-empty group exists, so `useDedicationCrawl`'s
// mount-time effects (the resize measurement in particular) attach to real
// DOM instead of the null refs a band with no markup yet would hand them.
// Owns the `overflowing`/`dragging` classes itself, because they belong on
// the same element the hook measures, and that element cannot exist before
// this component does (B1: the effect used to run once, before this DOM
// existed, and a deps-`[]` effect never runs again).
const DedicationBandDrawn = ({ className, group, variant }: DedicationBandDrawnProps) => {
  const crawl = useDedicationCrawl();

  return (
    <section className={classNames(className, { overflowing: crawl.isOverflowing, dragging: crawl.isDragging })}>
      <div
        className="viewport"
        ref={crawl.viewportRef}
        role={crawl.isOverflowing ? 'region' : undefined}
        tabIndex={crawl.isOverflowing ? 0 : undefined}
        aria-label={crawl.isOverflowing ? consts.VIEWPORT_ARIA_LABEL : undefined}
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
    </section>
  );
};

// The same component at every placement, never a second one: `variant`
// names the field it sits on (design-system.md, Placement). Each placement
// is fixed to one `DedicationType`; a missing or empty group renders
// nothing at all, and a group hands off to `DedicationBandDrawn`, whose own
// DOM and measurement effects mount together (B1/B6 fix).
export const DedicationBand = styled(({ className, group, variant }: DedicationBandProps) => {
  if (!group || group.items.length === 0) return null;

  return <DedicationBandDrawn className={classNames(className, variant)} {...{ group, variant }} />;
})`
  ${styles.DedicationBand}
`;
