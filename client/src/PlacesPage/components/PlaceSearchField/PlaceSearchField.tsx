import styled from 'styled-components';

import { directionForValue } from '~/helpers';

import * as consts from './consts';
import type { PlaceSearchFieldProps } from './models';
import * as styles from './styles';

// Purely local: the directory is already loaded in full, so every keystroke
// filters in memory with no debounce and no network call, the same search
// field `/rabbis` already has (RabbisPage/components/RabbiSearchField). A
// duplicate rather than a lift: the nearest folder both pages can see is
// `client/src/components/`, which is outside this builder's prefixes right
// now. Flagged in the build report as a follow-up lift.
export const PlaceSearchField = styled(({ className, id, value, onChange, ariaLabel }: PlaceSearchFieldProps) => (
  <form className={className} role="search" onSubmit={(event) => event.preventDefault()}>
    <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
    <input
      type="search"
      id={id}
      className="input"
      aria-label={ariaLabel}
      placeholder={consts.PLACEHOLDER}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      dir={directionForValue(value)}
    />
    {value.length > 0 && (
      <button type="button" className="clear" aria-label={consts.CLEAR_LABEL} onClick={() => onChange('')}>
        <span className="pill" aria-hidden="true">
          ✕
        </span>
      </button>
    )}
  </form>
))`
  ${styles.PlaceSearchField}
`;
