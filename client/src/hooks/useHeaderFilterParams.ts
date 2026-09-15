import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { isWomenPagePath } from './helpers';

export interface HeaderFilterParams {
  searchParams: URLSearchParams;
  applyParams: (build: (params: URLSearchParams) => void, options?: { replace?: boolean }) => void;
}

// The home page and /women are the two screens these filters act on in
// place (section 7: "On /women, date, city and search act in place"): each
// reads and writes its own URL, so `applyParams` there behaves exactly like
// `setSearchParams`. Everywhere else the header is a launch pad, not a
// filter band, so a chip, a search term or a city takes the reader to `/`
// instead, carrying only the one param this call sets rather than whatever
// unrelated query string the page it was clicked from happened to hold.
// That cross-page jump always pushes a new history entry regardless of
// `options.replace`: `replace` only makes sense once already acting in
// place, where it stops a debounced search commit from spamming the back
// button with one entry per keystroke pause. useDateFilter, useSelectedCity
// and useSearchQuery all share this decision, which is why it lives in one
// place rather than three; useAudienceFilter does not, since leaving
// `/women` for a general audience carries more than the one param this
// hook's own elsewhere branch carries.
export const useHeaderFilterParams = (): HeaderFilterParams => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const actsInPlace = location.pathname === '/' || isWomenPagePath(location.pathname);

  const applyParams: HeaderFilterParams['applyParams'] = (build, options) => {
    if (actsInPlace) {
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
