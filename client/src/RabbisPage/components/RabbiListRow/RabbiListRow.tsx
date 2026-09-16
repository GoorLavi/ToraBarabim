import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { rabbiDisplayName, rabbiPath } from '~/helpers';

import { rabbiMetaLine } from './helpers';
import type { RabbiListRowProps } from './models';
import * as styles from './styles';

export const RabbiListRow = styled(({ className, rabbi, position }: RabbiListRowProps) => (
  <Link
    to={rabbiPath(rabbi)}
    className={className}
    onClick={() =>
      trackEvent(MIXPANEL_EVENTS.rabbiClick, { rabbiId: rabbi.id, rabbiName: rabbiDisplayName(rabbi), surface: 'rabbisPage', position })
    }
  >
    <div className={classNames('avatar', { placeholder: !rabbi.photoUrl })}>
      {rabbi.photoUrl && <img className="photo" src={rabbi.photoUrl} alt="" />}
    </div>

    <div className="text">
      <span className="name" dir="auto">
        {rabbiDisplayName(rabbi)}
      </span>
      <span className="meta" dir="auto">
        {rabbiMetaLine(rabbi)}
      </span>
    </div>

    <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
))`
  ${styles.RabbiListRow}
`;
