import classNames from 'classnames';
import { useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { focusableElementsIn } from '~/components/helpers';
import { dayLabel, numericDayLabel, todayInIsrael } from '~/HomePage/helpers';

import { DateFilterSheet } from './components/DateFilterSheet/DateFilterSheet';
import { HebrewDatePicker } from './components/HebrewDatePicker/HebrewDatePicker';
import * as consts from './consts';
import type { DateFilterChipsProps } from './models';
import * as styles from './styles';
import { useIsDesktopViewport } from './useIsDesktopViewport';

export const DateFilterChips = styled(
  ({ className, option, customDate, onSelectOption, onSelectCustomDate, onClearDate }: DateFilterChipsProps) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const isDesktop = useIsDesktopViewport();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const chosenDate = option === 'custom' ? customDate : undefined;
    const todayIso = todayInIsrael();

    // Keyboard dismissal, the close button, picking a day, and clearing all
    // leave the user on this control, so focus returns to the trigger.
    const closePicker = (): void => {
      setIsPickerOpen(false);
      triggerRef.current?.focus();
    };

    // Outside click and scrim tap already tell us where the user is going
    // next; pulling focus back to the trigger here would fight the click
    // that dismissed the panel (build spec's "returns to the trigger on
    // every close path" was written for keyboard dismissal, not this).
    const dismissPicker = (): void => {
      setIsPickerOpen(false);
    };

    const handleSelectDate = (isoDate: string): void => {
      onSelectCustomDate(isoDate);
      trackEvent(MIXPANEL_EVENTS.filterDate, { option: 'custom', date: isoDate, source: 'calendar' });
      closePicker();
    };

    const handleClearDate = (): void => {
      onClearDate();
      closePicker();
    };

    // Checked against the trigger and the panel directly, never against the
    // wrapper: `ResponsiveSheet` portals the mobile panel into
    // `document.body`, so the wrapper's own `contains()` no longer reflects
    // where the panel actually lives in the DOM, even though React still
    // delivers the blur event here (portals keep the React tree, only the
    // DOM node moves).
    const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
      const nextFocusTarget = event.relatedTarget;
      const staysInsideWidget =
        Boolean(nextFocusTarget) &&
        (triggerRef.current?.contains(nextFocusTarget) || panelRef.current?.contains(nextFocusTarget));
      if (!staysInsideWidget) dismissPicker();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Escape') {
        // Deliberately not skipped when `defaultPrevented`: below `md` the
        // sheet closes first, without returning focus, and only this handler
        // puts focus back on the trigger.
        event.preventDefault();
        closePicker();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = focusableElementsIn(panelRef.current);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    return (
      <div className={className} role="group" aria-label={consts.GROUP_LABEL}>
        {consts.DATE_FILTER_OPTIONS.map((item) => {
          const isSelected = item.value === option;
          return (
            <button
              key={item.value}
              type="button"
              className={classNames('chip', { selected: isSelected })}
              aria-pressed={isSelected}
              aria-label={isSelected ? consts.clearFilterLabel(item.label) : item.label}
              onClick={() => {
                onSelectOption(item.value);
                if (!isSelected) trackEvent(MIXPANEL_EVENTS.filterDate, { option: item.value, source: 'chip' });
              }}
            >
              <span>{item.label}</span>
              {isSelected && (
                <svg className="clearGlyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          );
        })}

        <div className="calendarWrapper" onBlur={handleBlur} onKeyDown={handleKeyDown}>
          <button
            type="button"
            ref={triggerRef}
            className={classNames('calendar', { open: isPickerOpen && !chosenDate, selected: Boolean(chosenDate) })}
            aria-haspopup="dialog"
            aria-expanded={isPickerOpen}
            aria-label={chosenDate ? consts.changeDateLabel(dayLabel(chosenDate)) : consts.CUSTOM_DATE_LABEL}
            onClick={() => setIsPickerOpen(true)}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {chosenDate && (
              <span className="customDateLabel" dir="auto">
                {numericDayLabel(chosenDate)}
              </span>
            )}
          </button>

          {isPickerOpen && !isDesktop && (
            <DateFilterSheet
              {...{ heading: consts.DIALOG_LABEL, closeLabel: consts.CLOSE_SHEET_LABEL, onClose: closePicker, onDismiss: dismissPicker, contentRef: panelRef }}
            >
              <HebrewDatePicker
                {...{
                  surface: 'sheet',
                  selectedDate: chosenDate,
                  initialMonth: chosenDate ?? todayIso,
                  todayIso,
                  onSelectDate: handleSelectDate,
                  onClear: handleClearDate,
                }}
              />
            </DateFilterSheet>
          )}

          {isPickerOpen && isDesktop && (
            <div className="popoverPanel" role="dialog" aria-label={consts.DIALOG_LABEL} ref={panelRef}>
              <HebrewDatePicker
                {...{
                  surface: 'popover',
                  selectedDate: chosenDate,
                  initialMonth: chosenDate ?? todayIso,
                  todayIso,
                  onSelectDate: handleSelectDate,
                  onClear: handleClearDate,
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
)`
  ${styles.DateFilterChips}
`;
