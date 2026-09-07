import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';

// The one threshold that decides sheet versus popover (build spec, "Where
// it lives"): reads the same `md` breakpoint token the rest of the theme
// uses, rather than a second, hand-typed 768.
export const useIsDesktopViewport = (): boolean => {
  const theme = useTheme();
  const query = `(min-width: ${theme.breakpoints.md})`;
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent): void => setIsDesktop(event.matches);

    setIsDesktop(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return isDesktop;
};
