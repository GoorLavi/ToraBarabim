import { SEARCH_QUERY_PARAM } from './consts';
import { useHeaderFilterParams } from './useHeaderFilterParams';

export interface SearchQueryState {
  query: string;
  setQuery: (value: string) => void;
}

// `replace: true` keeps a debounced commit from spamming the browser's back
// button with one history entry per keystroke pause, once already on `/`.
// `useHeaderFilterParams` decides whether a change applies to the current
// URL or navigates there from elsewhere.
export const useSearchQuery = (): SearchQueryState => {
  const { searchParams, applyParams } = useHeaderFilterParams();
  const query = searchParams.get(SEARCH_QUERY_PARAM) ?? '';

  const setQuery = (value: string): void => {
    applyParams(
      (params) => {
        const trimmed = value.trim();
        if (trimmed) {
          params.set(SEARCH_QUERY_PARAM, trimmed);
        } else {
          params.delete(SEARCH_QUERY_PARAM);
        }
      },
      { replace: true },
    );
  };

  return { query, setQuery };
};
