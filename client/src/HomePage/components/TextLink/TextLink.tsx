import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Chevron } from '~/HomePage/components/Chevron/Chevron';

import type { TextLinkProps } from './models';
import * as styles from './styles';

export const TextLink = styled(({ className, to, children, withChevron, onClick }: TextLinkProps) => (
  <Link to={to} className={classNames(className, { withChevron })} onClick={onClick}>
    {withChevron && <Chevron />}
    <span className="label">{children}</span>
  </Link>
))`
  ${styles.TextLink}
`;
