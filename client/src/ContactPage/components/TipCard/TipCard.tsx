import styled from 'styled-components';

import * as consts from './consts';
import type { TipCardProps } from './models';
import * as styles from './styles';

export const TipCard = styled(({ className }: TipCardProps) => (
  <div className={className}>
    <p className="heading">{consts.HEADING}</p>
    <p className="body">{consts.BODY}</p>
  </div>
))`
  ${styles.TipCard}
`;
