import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// `<ScrollRestoration />` only exists on a data router (`RouterProvider`);
// this app runs `<BrowserRouter>`, so the layout route resets scroll itself.
// A `POP` (back or forward) is left alone: the browser restores the scroll
// position it recorded for that history entry on its own. A `PUSH` or
// `REPLACE` jumps to the top, including when only the query string changes,
// since a filter applied from another page changes `search` and lands on
// `/`.
export const useScrollRestoration = () => {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
  }, [pathname, search, navigationType]);
};
