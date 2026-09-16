import { useTheme } from 'styled-components';

import { useMediaQuery } from '../useMediaQuery';

// The threshold between the bottom drawer and the anchored popover: `sm`
// (480), not the `md` (768) DateFilterChips's own desktop check uses.
// Shared by CityPicker and AudienceFilter, the header's two picker-style
// controls, rather than each keeping its own copy.
export const useIsWideViewport = (): boolean => {
  const theme = useTheme();
  const query = `(min-width: ${theme.breakpoints.sm})`;

  // Mobile-first: before we know the viewport, assume the narrow layout.
  return useMediaQuery(query, false);
};
