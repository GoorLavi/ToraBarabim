import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { rabbiDisplayName, rabbiPath } from '~/helpers';

import type { RabbiCellProps } from './models';
import * as styles from './styles';

// The whole cell is one link, not the photograph alone (design spec, "the
// frame's own summary"). No ring around the photograph: plum on the
// photograph's own plum background is nearly invisible, so the focus ring
// sits on the cell as a whole instead.
export const RabbiCell = styled(({ className, rabbi, position }: RabbiCellProps) => (
  <Link
    to={rabbiPath(rabbi)}
    className={className}
    aria-label={rabbiDisplayName(rabbi)}
    onClick={() =>
      trackEvent(MIXPANEL_EVENTS.rabbiClick, { rabbiId: rabbi.id, rabbiName: rabbiDisplayName(rabbi), surface: 'cityPage', position })
    }
  >
    {rabbi.photoUrl ? (
      <img className="photo" src={rabbi.photoUrl} alt="" />
    ) : (
      <div className="photo placeholder" aria-hidden="true" />
    )}
    <span className="name" dir="auto">
      {rabbiDisplayName(rabbi)}
    </span>
  </Link>
))`
  ${styles.RabbiCell}
`;
