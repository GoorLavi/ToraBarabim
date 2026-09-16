import type { Area } from '@torabarabim/common';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { directionForValue } from '~/helpers';

import { PanelFrame } from '../../../PanelFrame/PanelFrame';
import * as parentConsts from '../../consts';
import { useCitySearchResults } from '../../useCitySearchResults';
import { useCitySuggestions } from '../../useCitySuggestions';
import { CitySearchResults } from './components/CitySearchResults/CitySearchResults';
import { GroupedCityList } from './components/GroupedCityList/GroupedCityList';
import * as consts from './consts';
import type { CityPickerPanelProps } from './models';
import * as styles from './styles';

// Fixed region (handle, heading, search) then a single scrolling region
// below a hairline, identical in content and order whether this renders
// inside the drawer or the popover (build spec, "Panel anatomy"). The
// handle, heading row and the dialog's focus/Escape/Tab behaviour are
// `PanelFrame`'s job; this owns the search field and the list below it.
export const CityPickerPanel = styled(({ className, isDrawer, isWide, recentCities, onSelect, onClose }: CityPickerPanelProps) => {
  const [query, setQuery] = useState('');
  const [expandedAreaCodes, setExpandedAreaCodes] = useState<ReadonlySet<Area>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollRegionRef = useRef<HTMLDivElement>(null);

  const suggestions = useCitySuggestions();
  const search = useCitySearchResults(query);
  const isQueryEmpty = query.trim().length === 0;

  // Clearing the field restores the grouped list and scrolls it back to the
  // top (build spec, "Typing state"); a fresh, non-empty query never fires
  // this, since it did not just transition from non-empty to empty.
  useEffect(() => {
    if (isQueryEmpty) scrollRegionRef.current?.scrollTo({ top: 0 });
  }, [isQueryEmpty]);

  const expandArea = (area: Area): void => {
    setExpandedAreaCodes((previous) => new Set(previous).add(area));
  };

  return (
    <PanelFrame
      className={className}
      {...{
        isDrawer,
        isWide,
        heading: parentConsts.PANEL_HEADING,
        closeLabel: parentConsts.CLOSE_PANEL_LABEL,
        onClose,
        initialFocusRef: searchInputRef,
        fixedContent: (
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
        ),
      }}
    >
      <div className="scrollRegion" ref={scrollRegionRef}>
        {isQueryEmpty ? (
          <GroupedCityList
            {...{ suggestions, recentCities, expandedAreaCodes, onExpandArea: expandArea, onSelect }}
          />
        ) : (
          <CitySearchResults {...{ search, onSelect, onBackToList: () => setQuery('') }} />
        )}
      </div>
    </PanelFrame>
  );
})`
  ${styles.CityPickerPanel}
`;
