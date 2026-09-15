import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import type { SelectedCity } from '~/hooks/models';

import { CityPickerDrawer } from './components/CityPickerDrawer/CityPickerDrawer';
import { CityPickerPanel } from './components/CityPickerPanel/CityPickerPanel';
import * as consts from './consts';
import type { CityPickerProps } from './models';
import * as styles from './styles';
import { useIsWideViewport } from './useIsWideViewport';
import { useRecentCities } from './useRecentCities';

// A city, once chosen, turns the pill into a toggle like the date chips:
// tapping it clears the selection and returns to "כל הארץ" rather than
// reopening the panel. So the panel only ever opens in the no-city-chosen
// state, and needs no selected styling of its own.
export const CityPicker = styled(({ className, city, onSelectCity, onClearCity }: CityPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isWide = useIsWideViewport();
  const pillRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { recentCities, addRecentCity } = useRecentCities();

  const close = (): void => {
    setIsOpen(false);
    pillRef.current?.focus();
  };

  // The desktop popover is never portalled (position: absolute needs only a
  // positioned ancestor, not the viewport, so it never hits the fixed-
  // position containing-block bug ResponsiveSheet works around), so a plain
  // outside-pointer listener on the real DOM tree is enough; it also avoids
  // a fixed, full-viewport catcher that would inherit that same bug were
  // this ever rendered inside the transformed pinned header bar.
  useEffect(() => {
    if (!isOpen || !isWide) return;

    const handlePointerDown = (event: PointerEvent): void => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, isWide]);

  const handleSelectCity = (selected: SelectedCity): void => {
    onSelectCity(selected);
    addRecentCity(selected);
    trackEvent(MIXPANEL_EVENTS.filterCity, { cityId: selected.id, cityName: selected.name });
    close();
  };

  return (
    <div className={classNames(className, { open: isOpen })} ref={rootRef}>
      <button
        type="button"
        ref={pillRef}
        className={classNames('pill', { selected: Boolean(city) })}
        aria-haspopup={city ? undefined : 'dialog'}
        aria-expanded={city ? undefined : isOpen}
        aria-pressed={city ? true : undefined}
        aria-label={city ? consts.clearCityLabel(city.name) : undefined}
        onClick={() => (city ? onClearCity() : setIsOpen(true))}
      >
        <svg className="pin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="label" dir="auto">
          {city?.name ?? consts.ALL_AREAS_LABEL}
        </span>
        {city ? (
          <svg className="clearGlyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {isOpen && !isWide && (
        <CityPickerDrawer {...{ ariaLabel: consts.PANEL_HEADING, onDismiss: close }}>
          <CityPickerPanel {...{ isDrawer: true, isWide, recentCities, onSelect: handleSelectCity, onClose: close }} />
        </CityPickerDrawer>
      )}

      {isOpen && isWide && (
        <div className="popover" role="dialog" aria-label={consts.PANEL_HEADING}>
          <CityPickerPanel {...{ isDrawer: false, isWide, recentCities, onSelect: handleSelectCity, onClose: close }} />
        </div>
      )}
    </div>
  );
})`
  ${styles.CityPicker}
`;
