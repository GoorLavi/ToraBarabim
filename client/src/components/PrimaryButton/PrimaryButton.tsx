import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { PrimaryButtonProps } from './models';
import * as styles from './styles';

export const PrimaryButton = styled((props: PrimaryButtonProps) => {
  const { className, label } = props;

  return 'to' in props ? (
    <Link to={props.to} className={className}>
      {label}
    </Link>
  ) : (
    <button type="button" className={className} onClick={props.onClick}>
      {label}
    </button>
  );
})`
  ${styles.PrimaryButton}
`;
