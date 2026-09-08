import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LogoMark } from './components/LogoMark/LogoMark';
import * as consts from './consts';
import type { SiteLogoLinkProps } from './models';
import * as styles from './styles';

// A modified click (Ctrl, Cmd, Shift, Alt, middle button) opens the link
// elsewhere and leaves this tab where it was, so scrolling it would move a
// page the person is still reading.
const scrollToTopOnPlainClick = (event: MouseEvent<HTMLAnchorElement>): void => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
};

export const SiteLogoLink = styled(({ className }: SiteLogoLinkProps) => (
  <Link
    to="/"
    className={className}
    aria-label={consts.HOME_LINK_LABEL}
    onClick={scrollToTopOnPlainClick}
  >
    <LogoMark className="mark" size={consts.LOGO_MARK_SIZE} variant="onDark" />
    <span className="wordmark" dir="auto">
      {consts.WORDMARK}
    </span>
  </Link>
))`
  ${styles.SiteLogoLink}
`;
