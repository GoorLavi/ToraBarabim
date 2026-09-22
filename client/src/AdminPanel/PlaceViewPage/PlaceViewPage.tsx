import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RecordField } from '~/AdminPanel/components/RecordField/RecordField';
import { ADMIN_ROUTES, skeletonFieldKeys } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useExistingPlace } from '~/AdminPanel/PlaceFormPage/useExistingPlace';

import * as consts from './consts';
import type { PlaceViewPageProps } from './models';
import * as styles from './styles';

// The route-provided `id` is always present for this screen (`AdminPanel.tsx`
// mounts it only at `/admin/places/:id`); the `| undefined` in the type is
// react-router's, not a real runtime case, and `useExistingPlace` already
// degrades to its disabled/'pending' status if it were ever missing.
export const PlaceViewPage = styled(({ className }: PlaceViewPageProps) => {
  const { id } = useParams<{ id: string }>();
  const existingPlace = useExistingPlace(id);
  const [hasPhotoLoadFailed, setHasPhotoLoadFailed] = useState(false);

  if (existingPlace.isError) {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.places}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>

        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(existingPlace.error)}</p>
          <button type="button" className="retry" onClick={() => existingPlace.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  if (existingPlace.isPending) {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.places}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>

        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonHeader">
            <div className="skeletonPoster" />
            <div className="skeletonLines">
              <div className="skeletonLine wide" />
              <div className="skeletonLine short" />
            </div>
          </div>
          <div className="skeletonFieldsGrid">
            {skeletonFieldKeys(consts.SKELETON_FIELD_COUNT).map((key) => (
              <div key={key} className="skeletonField" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const place = existingPlace.data;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.places}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="main">
        <header className="header">
          <div className="titleRow">
            {place.photoUrl && !hasPhotoLoadFailed ? (
              <img className="poster" src={place.photoUrl} alt="" onError={() => setHasPhotoLoadFailed(true)} />
            ) : (
              <div className="poster placeholder" aria-hidden="true" />
            )}

            <div className="identity">
              <h1 className="heading" dir="auto">
                {place.name}
              </h1>
              <p className="title" dir="auto">
                {place.isActive ? consts.STATUS_ACTIVE_VALUE : consts.STATUS_INACTIVE_VALUE}
              </p>
            </div>
          </div>

          <Link className="editButton" to={ADMIN_ROUTES.placeEdit(place.id)}>
            {consts.EDIT_LABEL}
          </Link>
        </header>

        <div className="fieldsGrid">
          <RecordField label={consts.CITY_LABEL} value={place.cityName} />
          <RecordField label={consts.STREET_LABEL} value={place.street} />
          <RecordField label={consts.FLOOR_LABEL} isEmpty={!place.floor} value={place.floor ?? consts.FLOOR_EMPTY_VALUE} />
          <RecordField label={consts.STATUS_LABEL} value={place.isActive ? consts.STATUS_ACTIVE_VALUE : consts.STATUS_INACTIVE_VALUE} />
        </div>
      </div>
    </div>
  );
})`
  ${styles.PlaceViewPage}
`;
