import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styled from 'styled-components';

import { SiteLogoLink } from '~/components/SiteLogoLink/SiteLogoLink';

import { FilterFieldsGrid } from '../FilterFieldsGrid/FilterFieldsGrid';
import { FilterSummaryPill } from './components/FilterSummaryPill/FilterSummaryPill';
import * as consts from './consts';
import { filterSummaryLabel } from './helpers';
import type { PinnedHeaderBarProps } from './models';
import * as styles from './styles';

// Below `lg` only: the full header scrolls away in normal flow, and this
// fixed bar takes its place once it has completely left the viewport
// (FilterControls, usePinnedHeaderVisibility). Tapping the pill expands it
// in place into the same header shown at the top, so there is nothing new
// to learn; the pill itself only exists while that panel is closed.
export const PinnedHeaderBar = styled(({ className, isVisible, ...fieldsProps }: PinnedHeaderBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const wasExpandedRef = useRef(false);

  // Runs after the DOM already reflects the new `isExpanded` value, so the
  // element being focused actually exists: the first chip once the panel
  // has just opened, the summary pill once it has just closed.
  useEffect(() => {
    if (isExpanded) {
      rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    } else if (wasExpandedRef.current) {
      rootRef.current?.querySelector<HTMLButtonElement>('.summaryPill')?.focus();
    }
    wasExpandedRef.current = isExpanded;
  }, [isExpanded]);

  // No scroll lock: scrolling the page closes the panel instead.
  useEffect(() => {
    if (!isExpanded) return;
    const handleScroll = (): void => setIsExpanded(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  // The bar disappearing (scrolled back above the threshold) always closes
  // whatever panel it was showing, so the two states never disagree.
  useEffect(() => {
    if (!isVisible) setIsExpanded(false);
  }, [isVisible]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    setIsExpanded(false);
  };

  const summary = filterSummaryLabel(fieldsProps.option, fieldsProps.customDate, fieldsProps.city, fieldsProps.searchQuery);

  // Choosing a date or a city closes the panel like any other disclosure;
  // typing a search term does not, or every keystroke would close it. From
  // a page other than `/` this also carries the reader across a route
  // change (useHeaderFilterParams), which does not by itself close the
  // panel: `FilterControls` sits in the shared layout above the routed
  // page, so it is never remounted by that navigation.
  const expandedFieldsProps = {
    ...fieldsProps,
    onSelectOption: (option: Parameters<typeof fieldsProps.onSelectOption>[0]) => {
      fieldsProps.onSelectOption(option);
      setIsExpanded(false);
    },
    onSelectCustomDate: (isoDate: string) => {
      fieldsProps.onSelectCustomDate(isoDate);
      setIsExpanded(false);
    },
    onClearDate: () => {
      fieldsProps.onClearDate();
      setIsExpanded(false);
    },
    onSelectCity: (city: Parameters<typeof fieldsProps.onSelectCity>[0]) => {
      fieldsProps.onSelectCity(city);
      setIsExpanded(false);
    },
    onClearCity: () => {
      fieldsProps.onClearCity();
      setIsExpanded(false);
    },
  };

  return (
    <div ref={rootRef} className={classNames(className, { visible: isVisible })}>
      {!isExpanded && (
        <div className="collapsedBar">
          <div className="collapsedBarInner">
            <SiteLogoLink />
            <FilterSummaryPill className="summaryPill" summary={summary} onClick={() => setIsExpanded(true)} />
          </div>
        </div>
      )}

      {isExpanded && (
        <>
          {/* Transparent: swallows the first outside tap so it only closes
              the panel instead of also activating whatever is underneath. */}
          <div className="catcher" aria-hidden="true" onClick={() => setIsExpanded(false)} />
          <div
            className="expandedPanel"
            role="dialog"
            aria-modal="false"
            aria-label={consts.FILTER_PANEL_LABEL}
            onKeyDown={handleKeyDown}
          >
            <FilterFieldsGrid className="fields" {...expandedFieldsProps} />
          </div>
        </>
      )}
    </div>
  );
})`
  ${styles.PinnedHeaderBar}
`;
