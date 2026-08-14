import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import type { DateFilterChipsProps } from './models';
import * as styles from './styles';

// The native date input sits transparent on top of the calendar icon,
// covering the same 48x48 target, so a tap opens the platform's own date
// picker without a bespoke popover (root CLAUDE.md, "prefer the plain
// platform").
export const DateFilterChips = styled(({ className, option, customDate, onSelectOption, onSelectCustomDate }: DateFilterChipsProps) => (
  <div className={className} role="group" aria-label={consts.GROUP_LABEL}>
    {consts.DATE_FILTER_OPTIONS.map((item) => (
      <button
        key={item.value}
        type="button"
        className={classNames('chip', { selected: item.value === option })}
        aria-pressed={item.value === option}
        onClick={() => onSelectOption(item.value)}
      >
        {item.label}
      </button>
    ))}

    <span className={classNames('calendar', { selected: option === 'custom' })}>
      <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="date"
        className="dateInput"
        aria-label={consts.CUSTOM_DATE_LABEL}
        value={customDate ?? ''}
        onChange={(event) => {
          if (event.target.value) onSelectCustomDate(event.target.value);
        }}
      />
    </span>
  </div>
))`
  ${styles.DateFilterChips}
`;
