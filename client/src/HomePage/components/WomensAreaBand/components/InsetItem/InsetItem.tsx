import type { ReactElement } from 'react';
import styled from 'styled-components';

import type { InsetItemProps } from './models';
import * as styles from './styles';

const ICON_PATHS: Record<InsetItemProps['icon'], ReactElement> = {
  day: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  city: (
    <>
      <path
        d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  rabbi: (
    <>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 21c0-4 3.5-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};

// Decorative: the label beside each icon already carries the meaning
// (design-system.md, "Iconography" is open sitewide, but these three are
// scoped to this one band and never reused elsewhere).
export const InsetItem = styled(({ className, icon, label }: InsetItemProps) => (
  <div className={className}>
    <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {ICON_PATHS[icon]}
    </svg>
    <span className="label">{label}</span>
  </div>
))`
  ${styles.InsetItem}
`;
