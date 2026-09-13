import { useCallback, useSyncExternalStore } from 'react';

// Shared by every media-query-driven layout hook under FilterControls
// (DateFilterChips' desktop check, the pinned bar's breakpoint checks).
// `matchesOnServer` is the caller's honest "before we know the viewport"
// answer for that specific query, since there is no one default that is
// right for both a min-width and a max-width query.
export const useMediaQuery = (query: string, matchesOnServer: boolean): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => matchesOnServer, [matchesOnServer]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
