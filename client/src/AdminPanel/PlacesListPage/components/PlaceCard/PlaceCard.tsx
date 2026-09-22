import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { InactiveTag } from '~/AdminPanel/components/InactiveTag/InactiveTag';
import { ADMIN_ROUTES, DETAILS_LABEL } from '~/AdminPanel/consts';
import { placeAddressLine } from '~/components/PlacePicker/helpers';

import type { PlaceCardProps } from './models';
import * as styles from './styles';

export const PlaceCard = styled(({ className, place }: PlaceCardProps) => (
  <article className={classNames(className, { inactive: !place.isActive })}>
    <div className="body">
      <h3 className="name" dir="auto">
        {place.name}
        {!place.isActive && <InactiveTag />}
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
