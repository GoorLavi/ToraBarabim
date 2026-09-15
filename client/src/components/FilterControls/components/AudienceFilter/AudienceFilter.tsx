import classNames from 'classnames';
import { useState } from 'react';
import type { FocusEvent } from 'react';
import type { CityDetailResponse } from '@torabarabim/common';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';
import styled from 'styled-components';

import { CITY_DETAIL_ROUTE_ID } from '~/hooks/consts';
import { isWomenPagePath } from '~/hooks/helpers';

import * as consts from './consts';
import { buttonLabel, isOptionSelected, womenPagePath } from './helpers';
import type { AudienceFilterProps, AudienceOption } from './models';
import * as styles from './styles';

// Every value but נשים behaves like every other header control: it filters
// the home page in place, or launches a filtered home page from elsewhere
// (useAudienceFilter, useHeaderFilterParams). נשים is the one option that
// always navigates, to /women, carrying city and date across. `useMatch`,
// not a bare pathname comparison, so `/women/` (a trailing slash) still
// reads as the women's page.
export const AudienceFilter = styled(({ className, filter, onSelectFilter, onClearFilter }: AudienceFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cityRouteData = useRouteLoaderData(CITY_DETAIL_ROUTE_ID) as CityDetailResponse | undefined;
  // Also matches /women/rabbaniyot: the header shows נשים selected there
  // too, the same as on /women itself.
  const isWomenPage = isWomenPagePath(location.pathname);

  const close = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  const selectOption = (option: AudienceOption): void => {
    setIsOpen(false);
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
    <div className={classNames(className, { open: isOpen })} onBlur={close}>
      <button
        type="button"
        className={classNames('pill', { selected: Boolean(filter) || isWomenPage })}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
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

      {isOpen && (
        <div className="popover">
          <div className="popoverHeader">
            <span className="popoverTitle">{consts.POPOVER_TITLE}</span>
            <button type="button" className="closeButton" aria-label={consts.CLOSE_LABEL} onClick={() => setIsOpen(false)}>
              <svg className="closeIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <ul className="options" role="listbox">
            {consts.AUDIENCE_OPTIONS.map((option) => (
              <li key={option} className="option" role="presentation">
                <button type="button" role="option" aria-selected={isOptionSelected(option, filter, isWomenPage)} onClick={() => selectOption(option)}>
                  <span className="label">{consts.OPTION_LABELS[option]}</span>
                  {option === 'women' && <span className="subLabel">{consts.WOMEN_SUBLABEL}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
})`
  ${styles.AudienceFilter}
`;
