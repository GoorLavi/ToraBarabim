import styled from 'styled-components';

import { directionForValue } from '~/helpers';

import * as consts from './consts';
import type { RabbiSearchFieldProps } from './models';
import * as styles from './styles';

// Purely local: the list is already loaded in full, so every keystroke
// filters in memory with no debounce and no network call (design spec,
// "the search field is local").
export const RabbiSearchField = styled(({ className, id, value, onChange }: RabbiSearchFieldProps) => (
  <form className={className} role="search" onSubmit={(event) => event.preventDefault()}>
    <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
    <input
      type="search"
      id={id}
      className="input"
      aria-label={consts.LABEL}
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
  ${styles.RabbiSearchField}
`;
