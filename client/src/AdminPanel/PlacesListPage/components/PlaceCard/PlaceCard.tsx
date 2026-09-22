import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, DETAILS_LABEL } from '~/AdminPanel/consts';
import { placeAddressLine } from '~/components/PlacePicker/helpers';

import * as parentConsts from '../../consts';
import type { PlaceCardProps } from './models';
import * as styles from './styles';

export const PlaceCard = styled(({ className, place }: PlaceCardProps) => (
  <article className={classNames(className, { inactive: !place.isActive })}>
    <div className="body">
      <h3 className="name" dir="auto">
        {place.name}
        {!place.isActive && <span className="inactiveTag">{parentConsts.INACTIVE_TAG}</span>}
      </h3>
      <p className="address" dir="auto">
        {placeAddressLine(place.street, place.cityName)}
      </p>

      <div className="actions">
        <Link className="edit" to={ADMIN_ROUTES.placeView(place.id)}>
          {DETAILS_LABEL}
        </Link>
      </div>
    </div>
  </article>
))`
  ${styles.PlaceCard}
`;
