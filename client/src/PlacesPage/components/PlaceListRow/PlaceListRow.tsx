import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { addressLine, placePath } from '~/helpers';

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
      {/* The street clamps to one line and can lose the far end of a long
          address; the city never clamps and never wraps into the street's
          line, because the city is the unit a place is expressed in with no
          distance to lean on (design-system.md, "Place: the city is the
          unit"). Each line carries its own `dir='auto'`, mirroring
          PlaceHero's own address block, not one `dir` for the combined text.
          No "· N שיעורים" here (the build brief's own template line): the
          lesson count does not exist on `Place` yet (design gate finding
          F6). */}
      <span className="meta">
        <span className="street" dir="auto">
          {addressLine(place.street, place.floor)}
        </span>
        <span className="city" dir="auto">
          {place.city}
        </span>
      </span>
    </div>

    <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
))`
  ${styles.PlaceListRow}
`;
