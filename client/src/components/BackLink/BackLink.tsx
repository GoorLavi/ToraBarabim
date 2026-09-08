import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { BackLinkProps } from './models';
import * as styles from './styles';

// A right-pointing chevron: in RTL, "back" (towards where the reader came
// from) points towards the reading-start side, the right
// (00-shared-shell.md, "The back link"). `direction: rtl` mirrors the
// glyph; nothing here names a side.
export const BackLink = styled(({ className, to, label }: BackLinkProps) => (
  <div className={className}>
    <Link to={to} className="anchor">
      <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{label}</span>
    </Link>
  </div>
))`
  ${styles.BackLink}
`;
