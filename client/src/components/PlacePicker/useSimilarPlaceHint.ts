import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Place } from '@torabarabim/common';

import { fetchSimilarPlaces } from './api';
import { PLACE_PICKER_QUERY_KEYS, SIMILAR_HINT_DEBOUNCE_MS } from './consts';

export interface SimilarPlaceHint {
  match: Place | undefined;
  dismiss: () => void;
}

// Fires only once a city is chosen and typing has settled (debounced, never
// per keystroke), and only while the currently typed name/street has not
// already been dismissed: `dismissedKey` remembers the exact value that was
// waved off, so the hint stays gone for that value but returns the moment
// either field changes again. Dismissal is local UI state only, never
// stored on the record.
export const useSimilarPlaceHint = (cityCode: number | undefined, name: string, street: string): SimilarPlaceHint => {
  const [debounced, setDebounced] = useState({ name, street });
  const [dismissedKey, setDismissedKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced({ name, street }), SIMILAR_HINT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [name, street]);

  const trimmedName = debounced.name.trim();
  const trimmedStreet = debounced.street.trim();
  const enabled = cityCode !== undefined && (Boolean(trimmedName) || Boolean(trimmedStreet));
  const key = `${cityCode ?? ''}|${trimmedName}|${trimmedStreet}`;

  const query = useQuery({
    queryKey: PLACE_PICKER_QUERY_KEYS.similar({ cityCode, name: trimmedName || undefined, street: trimmedStreet || undefined }),
    queryFn: () => fetchSimilarPlaces({ cityCode: cityCode as number, name: trimmedName || undefined, street: trimmedStreet || undefined }),
    enabled,
  });

  const [firstMatch] = query.data?.items ?? [];
  const match = enabled && key !== dismissedKey ? firstMatch : undefined;

  return { match, dismiss: () => setDismissedKey(key) };
};
