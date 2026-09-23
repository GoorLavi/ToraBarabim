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
  // The value this field last put into circulation, trimmed the way
  // `useSearchQuery` trims it on its way to the URL. A committed value
  // travels out to the URL and comes back as `value`, and on a route with a
  // loader that round trip can outlast the next few keystrokes. Comparing
  // against it is what tells the field's own echo apart from a genuine
  // outside change, so the sync effect below does not reset the input to a
  // value that is already stale and delete whatever was typed meanwhile.
  const lastCommittedRef = useRef(value);
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
      // What `onChange` actually commits (useSearchQuery trims before
      // writing to the URL), not the raw keystroke buffer: both the echo
      // guard above and the tracked query below want that value.
      const committed = draft.trim();
      lastCommittedRef.current = committed;
      onChange(draft);
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
  // back/forward, or opening a link that already carries `q`. The ref is
  // moved here too, not only on commit, so that going back and then forward
  // again still reaches the field: the value it lands on is one this field
  // committed earlier, and without this it would look like its own echo.
  useEffect(() => {
    if (value === lastCommittedRef.current) return;
    lastCommittedRef.current = value;
    setDraft(value);
  }, [value]);

  const clear = (): void => {
    lastCommittedRef.current = '';
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
