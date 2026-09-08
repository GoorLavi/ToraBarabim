import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export interface HeaderFilterParams {
  searchParams: URLSearchParams;
  applyParams: (build: (params: URLSearchParams) => void, options?: { replace?: boolean }) => void;
}

// The home page is the one screen these filters act on in place: `/` reads
// and writes its own URL, so `applyParams` there behaves exactly like
// `setSearchParams`. Everywhere else the header is a launch pad, not a
// filter band, so a chip, a search term or a city takes the reader to `/`
// instead, carrying only the one param this call sets rather than whatever
// unrelated query string the page it was clicked from happened to hold.
// That cross-page jump always pushes a new history entry regardless of
// `options.replace`: `replace` only makes sense once already on `/`, where
// it stops a debounced search commit from spamming the back button with one
// entry per keystroke pause; the one-time move to `/` from somewhere else
// should still leave a "back" that returns the reader to where they were.
// useDateFilter, useSelectedCity and useSearchQuery all share this
// decision, which is why it lives in one place rather than three.
export const useHeaderFilterParams = (): HeaderFilterParams => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isHome = location.pathname === '/';

  const applyParams: HeaderFilterParams['applyParams'] = (build, options) => {
    if (isHome) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        build(next);
        return next;
      }, options);
      return;
    }

    const next = new URLSearchParams();
    build(next);
    navigate({ pathname: '/', search: next.toString() });
  };

  return { searchParams, applyParams };
};
