import { useTheme } from 'styled-components';

import { useMediaQuery } from '../../useMediaQuery';

// The one threshold that decides sheet versus popover (build spec, "Where
// it lives"): reads the same `md` breakpoint token the rest of the theme
// uses, rather than a second, hand-typed 768.
export const useIsDesktopViewport = (): boolean => {
  const theme = useTheme();
  const query = `(min-width: ${theme.breakpoints.md})`;

  // Mobile-first: before we know the viewport, assume the narrow layout.
  return useMediaQuery(query, false);
};
