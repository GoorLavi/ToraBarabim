import styled from 'styled-components';

import * as consts from './consts';
import type { LogoMarkProps } from './models';
import * as styles from './styles';

// Abstract Beit HaMikdash mark: a beam, two columns, an arched entrance, a base
// step. Fully symmetrical around x=50, so it needs no mirroring for RTL.
// Geometry and rationale: decision 0014 and design-system.md, "The logo".
export const LogoMark = styled(({ className, size, variant = 'default' }: LogoMarkProps) => {
  const { structure, arch } = consts.COLORS[variant];

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <rect x={9} y={8} width={82} height={7} fill={structure} />
      <rect x={3} y={16} width={94} height={11} fill={structure} />
      <rect x={14} y={30} width={19} height={50} fill={structure} />
      <rect x={67} y={30} width={19} height={50} fill={structure} />
      <rect x={2} y={85} width={96} height={10} fill={structure} />
      <path d="M50,38 A10,10 0 0 1 60,48 L60,80 L40,80 L40,48 A10,10 0 0 1 50,38 Z" fill={arch} />
    </svg>
  );
})`
  ${styles.LogoMark}
`;
