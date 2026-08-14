import styled from 'styled-components';

import * as consts from './consts';
import type { FooterProps } from './models';
import * as styles from './styles';

// "על האתר" and "יצירת קשר" have no page to link to yet in this slice, so
// both render as static labels rather than dead interactive links (see the
// client builder's report).
export const Footer = styled(({ className }: FooterProps) => (
  <footer className={className}>
    <span className="wordmark" dir="auto">
      {consts.WORDMARK}
    </span>
    <nav className="links">
      <span>{consts.ABOUT_LABEL}</span>
      <span>{consts.CONTACT_LABEL}</span>
    </nav>
  </footer>
))`
  ${styles.Footer}
`;
