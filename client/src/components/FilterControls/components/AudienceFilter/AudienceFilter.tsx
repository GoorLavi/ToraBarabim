import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import type { CityDetailResponse } from '@torabarabim/common';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';
import styled from 'styled-components';

import { CITY_DETAIL_ROUTE_ID } from '~/hooks/consts';
import { isWomenPagePath } from '~/hooks/helpers';

import { FilterDrawer } from '../FilterDrawer/FilterDrawer';
import { useIsWideViewport } from '../useIsWideViewport';
import { AudiencePanel } from './components/AudiencePanel/AudiencePanel';
import * as consts from './consts';
import { buttonLabel, womenPagePath } from './helpers';
import type { AudienceFilterProps, AudienceOption } from './models';
import * as styles from './styles';

// Every value but נשים behaves like every other header control: it filters
// the home page in place, or launches a filtered home page from elsewhere
// (useAudienceFilter, useHeaderFilterParams). נשים is the one option that
// always navigates, to /women, carrying city and date across. Below `sm`
// the menu opens as the same bottom drawer the city picker uses
// (useIsWideViewport, FilterDrawer); from `sm` up it stays an anchored
// popover, closed the same way CityPicker's own popover is (a real
// outside-pointer listener, not `onBlur`, which Safari never fires from a
// click). `isWomenPagePath`, not a bare pathname comparison, so `/women/`
// (a trailing slash) still reads as the women's page.
export const AudienceFilter = styled(({ className, filter, onSelectFilter, onClearFilter }: AudienceFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isWide = useIsWideViewport();
  const pillRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const cityRouteData = useRouteLoaderData(CITY_DETAIL_ROUTE_ID) as CityDetailResponse | undefined;
  const isWomenPage = isWomenPagePath(location.pathname);

  const close = (): void => {
    setIsOpen(false);
    pillRef.current?.focus();
  };

  // Mirrors CityPicker.tsx: the desktop popover is never portalled, so a
  // plain outside-pointer listener on the real DOM tree is enough.
  useEffect(() => {
    if (!isOpen || !isWide) return;

    const handlePointerDown = (event: PointerEvent): void => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, isWide]);

  const selectOption = (option: AudienceOption): void => {
    close();
    if (option === 'women') {
      navigate(womenPagePath(location.search, cityRouteData));
      return;
    }
    if (option === 'all') {
      onClearFilter();
      return;
    }
    onSelectFilter(option);
  };

  return (
    <div className={classNames(className, { open: isOpen })} ref={rootRef}>
      <button
        type="button"
        ref={pillRef}
        className={classNames('pill', { selected: Boolean(filter) || isWomenPage })}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 20c0-3.9 3.6-6 7-6s7 2.1 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="label" dir="auto">
          {buttonLabel(filter, isWomenPage)}
        </span>
        <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && !isWide && (
        <FilterDrawer {...{ ariaLabel: consts.POPOVER_TITLE, onDismiss: close }}>
          <AudiencePanel {...{ isDrawer: true, isWide, filter, isWomenPage, onSelectOption: selectOption, onClose: close }} />
        </FilterDrawer>
      )}

      {isOpen && isWide && (
        <div className="popover" role="dialog" aria-label={consts.POPOVER_TITLE}>
          <AudiencePanel {...{ isDrawer: false, isWide, filter, isWomenPage, onSelectOption: selectOption, onClose: close }} />
        </div>
      )}
    </div>
  );
})`
  ${styles.AudienceFilter}
`;
