import classNames from 'classnames';
import styled from 'styled-components';

import { compactDayLabel, dayLabel } from '~/HomePage/helpers';

import * as consts from './consts';
import type { DateFilterChipsProps } from './models';
import * as styles from './styles';

// The native date input sits transparent on top of the calendar icon,
// covering the same 48x48 target, so a tap opens the platform's own date
// picker without a bespoke popover (root CLAUDE.md, "prefer the plain
// platform"). Once a custom date is chosen, the same control becomes a
// selected chip like the other three: tapping it clears the filter rather
// than reopening the native picker.
export const DateFilterChips = styled(
  ({ className, option, customDate, onSelectOption, onSelectCustomDate, onClearDate }: DateFilterChipsProps) => (
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
            onClick={() => onSelectOption(item.value)}
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

      {option === 'custom' && customDate ? (
        <button
          type="button"
          className="calendar selected"
          aria-pressed={true}
          aria-label={consts.clearFilterLabel(dayLabel(customDate))}
          onClick={onClearDate}
        >
          <span className="customDateLabel" dir="auto">
            {compactDayLabel(customDate)}
          </span>
          <svg className="clearGlyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <span className="calendar">
          <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="date"
            className="dateInput"
            aria-label={consts.CUSTOM_DATE_LABEL}
            value=""
            onChange={(event) => {
              if (event.target.value) onSelectCustomDate(event.target.value);
            }}
          />
        </span>
      )}
    </div>
  ),
)`
  ${styles.DateFilterChips}
`;
