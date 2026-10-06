import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Chevron } from '~/HomePage/components/Chevron/Chevron';

import type { TextLinkProps } from './models';
import * as styles from './styles';

export const TextLink = styled((props: TextLinkProps) => {
  const { className, children, icon, withChevron, onClick } = props;
  const content = (
    <>
      {withChevron && <Chevron />}
      {icon}
      <span className="label">{children}</span>
    </>
  );

  if (props.to === undefined) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link to={props.to} className={classNames(className, { withChevron })} onClick={onClick}>
      {content}
    </Link>
  );
})`
  ${styles.TextLink}
`;
