import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { QuietButtonProps } from './models';
import * as styles from './styles';

export const QuietButton = styled((props: QuietButtonProps) => {
  const { className, label } = props;

  if ('to' in props) {
    return (
      <Link to={props.to} className={className}>
        {label}
      </Link>
    );
  }

  if ('href' in props) {
    return (
      <a href={props.href} className={className} aria-label={props.ariaLabel} target={props.target} rel={props.rel} onClick={props.onClick}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={props.onClick} disabled={props.disabled}>
      {label}
    </button>
  );
})`
  ${styles.QuietButton}
`;
