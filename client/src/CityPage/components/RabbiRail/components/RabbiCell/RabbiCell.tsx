import styled from 'styled-components';
import { Link } from 'react-router-dom';

import type { RabbiCellProps } from './models';
import * as styles from './styles';

// The whole cell is one link, not the photograph alone (design spec, "the
// frame's own summary"). No ring around the photograph: plum on the
// photograph's own plum background is nearly invisible, so the focus ring
// sits on the cell as a whole instead.
export const RabbiCell = styled(({ className, rabbi }: RabbiCellProps) => (
  <Link to={`/rabbis/${rabbi.id}`} className={className} aria-label={rabbi.name}>
    {rabbi.photoUrl ? (
      <img className="photo" src={rabbi.photoUrl} alt="" />
    ) : (
      <div className="photo placeholder" aria-hidden="true" />
    )}
    <span className="name" dir="auto">
      {rabbi.name}
    </span>
  </Link>
))`
  ${styles.RabbiCell}
`;
