import type { CityAreaSuggestionGroup, CitySearchResult } from '@torabarabim/common';

import type { SelectedCity } from '~/hooks/models';

export interface CityPickerProps {
  className?: string;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity) => void;
  onClearCity: () => void;
}

// A discriminated union rather than a data object plus loading/error flags,
// so a screen can never render, say, an error title next to a stale result
// list (root CLAUDE.md, "make illegal states unrepresentable").
export type CitySuggestionsViewState =
  | { kind: 'loading' }
  | { kind: 'error'; retry: () => void }
  | { kind: 'empty' }
  | { kind: 'loaded'; areas: CityAreaSuggestionGroup[] };

export type CitySearchViewState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; retry: () => void }
  | { kind: 'empty' }
  | { kind: 'results'; items: CitySearchResult[]; isFetching: boolean };
