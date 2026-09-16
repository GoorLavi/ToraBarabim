import classNames from 'classnames';
import styled from 'styled-components';

import type { CandlesEmblemProps } from './models';
import * as styles from './styles';

// Two lit Shabbat candlesticks, decorative and hidden from screen readers:
// the tile and band it sits in already carry the same meaning in text.
// Geometry is the designer's own export from the Figma component
// (scratchpad/emblem-candles-onPlum.svg, -onSoft.svg), with the drawn
// colours replaced by `currentColor` (STRUCTURE) and the `.flame` class
// (FLAME), bound to tokens in styles.ts per variant.
export const CandlesEmblem = styled(({ className, variant, size }: CandlesEmblemProps) => (
  <svg
    className={classNames(className, variant)}
    width={size}
    height={size}
    viewBox="0 0 96 96"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M35 11C31 17 30.5 22.5 35 26C39.5 22.5 39 17 35 11Z" className="flame" />
    <path d="M61 11C57 17 56.5 22.5 61 26C65.5 22.5 65 17 61 11Z" className="flame" />
    <path d="M35 26V32M61 26V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="29.5" y="32" width="11" height="37" rx="2" stroke="currentColor" strokeWidth="2.5" />
    <rect x="55.5" y="32" width="11" height="37" rx="2" stroke="currentColor" strokeWidth="2.5" />
    <path d="M25 69H45M51 69H71M35 69V80M61 69V80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M27 85C30 81 40 81 43 85M53 85C56 81 66 81 69 85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
))`
  ${styles.CandlesEmblem}
`;
