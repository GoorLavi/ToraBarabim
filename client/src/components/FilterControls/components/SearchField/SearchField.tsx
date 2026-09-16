import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { useActiveFilters } from '~/analytics/useActiveFilters';
import { directionForValue } from '~/helpers';

import * as consts from './consts';
import type { SearchFieldProps } from './models';
import * as styles from './styles';

// A local draft renders every keystroke instantly; the committed `value`
// (URL state, and therefore the network request) only follows after the
// debounce settles, so typing never feels like it is waiting on a request.
export const SearchField = styled(({ className, value, onChange }: SearchFieldProps) => {
  const [draft, setDraft] = useState(value);
  const activeFilters = useActiveFilters();
  // Read from a ref rather than listed as an effect dependency: `Layout`
  // builds a fresh `filters` object on every render, and including it here
  // would restart the debounce timer on an unrelated city or date change
  // while someone is mid-keystroke.
  const activeFiltersRef = useRef(activeFilters);
  activeFiltersRef.current = activeFilters;

  useEffect(() => {
    if (draft.trim() === value) return;
    const timer = window.setTimeout(() => {
      onChange(draft);
      // Tracked value matches what `onChange` actually commits (useSearchQuery
      // trims before writing to the URL), not the raw keystroke buffer.
      const committed = draft.trim();
      if (committed.length > 0) {
        const filters = activeFiltersRef.current;
        trackEvent(MIXPANEL_EVENTS.search, {
          query: committed,
          queryLength: committed.length,
          ...(filters.cityId ? { cityId: filters.cityId } : {}),
          ...(filters.cityName ? { cityName: filters.cityName } : {}),
          dateOption: filters.dateOption,
          ...(filters.date ? { date: filters.date } : {}),
        });
      }
    }, consts.DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, value, onChange]);

  // Picks up a committed value that changed from outside typing: browser
  // back/forward, or opening a link that already carries `q`.
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const clear = (): void => {
    setDraft('');
    onChange('');
  };

  return (
    <form className={className} role="search" onSubmit={(event) => event.preventDefault()}>
      <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        className="input"
        aria-label={consts.LABEL}
        placeholder={consts.PLACEHOLDER}
        value={draft}
        maxLength={consts.MAX_LENGTH}
        onChange={(event) => setDraft(event.target.value)}
        dir={directionForValue(draft)}
      />
      {draft.length > 0 && (
        <button type="button" className="clear" aria-label={consts.CLEAR_LABEL} onClick={clear}>
          <svg className="glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </form>
  );
})`
  ${styles.SearchField}
`;
