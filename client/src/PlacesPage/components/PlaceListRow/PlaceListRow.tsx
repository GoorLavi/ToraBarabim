import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { placePath } from '~/helpers';

import { placeRowMetaLine } from '../../helpers';
import type { PlaceListRowProps } from './models';
import * as styles from './styles';

// No click tracking: there is no place-click analytics event defined yet
// (analytics/consts.ts, analytics/models.ts, both outside this builder's
// prefixes), unlike RabbiListRow's `rabbiClick`. Flagged in the build
// report.
export const PlaceListRow = styled(({ className, place }: PlaceListRowProps) => (
  <Link to={placePath(place)} className={className}>
    <div className={classNames('thumbnail', { placeholder: !place.photoUrl })}>{place.photoUrl && <img className="photo" src={place.photoUrl} alt="" />}</div>

    <div className="text">
      <span className="name" dir="auto">
        {place.name}
      </span>
      <span className="meta" dir="auto">
        {placeRowMetaLine(place)}
      </span>
    </div>

    <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
))`
  ${styles.PlaceListRow}
`;
