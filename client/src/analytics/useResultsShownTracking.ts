import { useEffect, useRef } from 'react';

import { MIXPANEL_EVENTS } from './consts';
import { trackEvent } from './mixpanel';
import type { AnalyticsEventProps } from './models';

interface ResultsShownQueryState {
  // Identifies the result set, never the query, so a page that paginates
  // (AreaPage growing its `pageSize`; CityPage's infinite query, whose
  // `dataUpdatedAt` also advances on `fetchNextPage`) does not re-fire on
  // "load more". Callers derive this from their query key with the
  // paginating dimension left out; it must never be the query key itself
  // where the two differ.
  resultSetKey: unknown;
  dataUpdatedAt: number;
  isPending: boolean;
  isError: boolean;
}

// Fires once per settled result set, guarded by `resultSetKey` rather than
// by `dataUpdatedAt` alone: an infinite query's `dataUpdatedAt` also
// advances on `fetchNextPage`, but its query key does not, so the guard
// below skips the re-fire a plain `dataUpdatedAt` dependency would
// otherwise cause. `props` is read from a ref rather than listed as a
// dependency, since a fresh object identity every render must never by
// itself cause a re-fire.
export const useResultsShownTracking = (
  query: ResultsShownQueryState,
  props: AnalyticsEventProps[typeof MIXPANEL_EVENTS.resultsShown],
): void => {
  const propsRef = useRef(props);
  propsRef.current = props;
  const firedKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (query.isPending || query.isError) return;
    const key = JSON.stringify(query.resultSetKey);
    if (firedKeyRef.current === key) return;
    firedKeyRef.current = key;
    trackEvent(MIXPANEL_EVENTS.resultsShown, propsRef.current);
  }, [query.resultSetKey, query.dataUpdatedAt, query.isPending, query.isError]);
};
