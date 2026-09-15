import type { Area } from '@torabarabim/common';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styled from 'styled-components';

import { directionForValue } from '~/helpers';

import * as parentConsts from '../../consts';
import { useCitySearchResults } from '../../useCitySearchResults';
import { useCitySuggestions } from '../../useCitySuggestions';
import { CitySearchResults } from './components/CitySearchResults/CitySearchResults';
import { GroupedCityList } from './components/GroupedCityList/GroupedCityList';
import * as consts from './consts';
import * as helpers from './helpers';
import type { CityPickerPanelProps } from './models';
import * as styles from './styles';

// Fixed region (handle, heading, search) then a single scrolling region
// below a hairline, identical in content and order whether this renders
// inside the drawer or the popover (build spec, "Panel anatomy").
export const CityPickerPanel = styled(({ className, isDrawer, isWide, recentCities, onSelect, onClose }: CityPickerPanelProps) => {
  const [query, setQuery] = useState('');
  const [expandedAreaCodes, setExpandedAreaCodes] = useState<ReadonlySet<Area>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollRegionRef = useRef<HTMLDivElement>(null);

  const suggestions = useCitySuggestions();
  const search = useCitySearchResults(query);
  const isQueryEmpty = query.trim().length === 0;

  // Below `sm` the keyboard would swallow the grouped list and push a
  // bottom-anchored drawer under itself on iOS, so focus goes to the panel
  // instead; from `sm` up there is no software keyboard to fight.
  useEffect(() => {
    if (isWide) searchInputRef.current?.focus();
    else panelRef.current?.focus();
  }, [isWide]);

  // Clearing the field restores the grouped list and scrolls it back to the
  // top (build spec, "Typing state"); a fresh, non-empty query never fires
  // this, since it did not just transition from non-empty to empty.
  useEffect(() => {
    if (isQueryEmpty) scrollRegionRef.current?.scrollTo({ top: 0 });
  }, [isQueryEmpty]);

  const expandArea = (area: Area): void => {
    setExpandedAreaCodes((previous) => new Set(previous).add(area));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusable = helpers.focusableElementsIn(panelRef.current);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={className} ref={panelRef} tabIndex={-1} onKeyDown={handleKeyDown}>
      {isDrawer && <div className="handle" aria-hidden="true" />}

      <div className="headingRow">
        <h2 className="heading">{parentConsts.PANEL_HEADING}</h2>
        <button type="button" className="close" aria-label={parentConsts.CLOSE_PANEL_LABEL} onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="searchRow">
        <input
          type="text"
          ref={searchInputRef}
          className="search"
          aria-label={consts.SEARCH_LABEL}
          placeholder={consts.SEARCH_PLACEHOLDER}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          dir={directionForValue(query)}
        />
        {query.length > 0 && (
          <button type="button" className="clear" aria-label={consts.CLEAR_SEARCH_LABEL} onClick={() => setQuery('')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="hairline" />

      <div className="scrollRegion" ref={scrollRegionRef}>
        {isQueryEmpty ? (
          <GroupedCityList
            {...{ suggestions, recentCities, expandedAreaCodes, onExpandArea: expandArea, onSelect }}
          />
        ) : (
          <CitySearchResults {...{ search, onSelect, onBackToList: () => setQuery('') }} />
        )}
      </div>
    </div>
  );
})`
  ${styles.CityPickerPanel}
`;
