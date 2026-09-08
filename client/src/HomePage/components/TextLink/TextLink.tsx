import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { TextLinkProps } from './models';
import * as styles from './styles';

export const TextLink = styled(({ className, to, children, withChevron }: TextLinkProps) => (
  <Link to={to} className={classNames(className, { withChevron })}>
    {withChevron && (
      <svg className="chevron" viewBox="0 0 7 12" fill="none" aria-hidden="true">
        <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
    <span className="label">{children}</span>
  </Link>
))`
  ${styles.TextLink}
`;
