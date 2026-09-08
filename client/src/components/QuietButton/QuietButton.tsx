import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { QuietButtonProps } from './models';
import * as styles from './styles';

export const QuietButton = styled((props: QuietButtonProps) => {
  const { className, label } = props;

  return 'to' in props ? (
    <Link to={props.to} className={className}>
      {label}
    </Link>
  ) : (
    <button type="button" className={className} onClick={props.onClick} disabled={props.disabled}>
      {label}
    </button>
  );
})`
  ${styles.QuietButton}
`;
