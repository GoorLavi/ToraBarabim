import { useSearchParams } from 'react-router-dom';

import { SEARCH_QUERY_PARAM } from './consts';

export interface SearchQueryState {
  query: string;
  setQuery: (value: string) => void;
}

// URL state is the source of truth, the same pattern as useDateFilter and
// useSelectedCity: a search someone runs is a link they can send to a
// friend. `replace: true` keeps a debounced commit from spamming the
// browser's back button with one history entry per keystroke pause.
export const useSearchQuery = (): SearchQueryState => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(SEARCH_QUERY_PARAM) ?? '';

  const setQuery = (value: string): void => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const trimmed = value.trim();
        if (trimmed) {
          next.set(SEARCH_QUERY_PARAM, trimmed);
        } else {
          next.delete(SEARCH_QUERY_PARAM);
        }
        return next;
      },
      { replace: true },
    );
  };

  return { query, setQuery };
};
