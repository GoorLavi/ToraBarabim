import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RecordField } from '~/AdminPanel/components/RecordField/RecordField';
import { ADMIN_ROUTES, PROMINENCE_LABELS, skeletonFieldKeys } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useExistingRabbi } from '~/AdminPanel/RabbiFormPage/useExistingRabbi';
import { rabbiDisplayName } from '~/helpers';

import { RabbiLessonsSection } from './components/RabbiLessonsSection/RabbiLessonsSection';
import * as consts from './consts';
import type { RabbiViewPageProps } from './models';
import * as styles from './styles';

// The route-provided `id` is always present for this screen (AdminPanel.tsx
// mounts it only at `/admin/rabbis/:id`); the `| undefined` in the type is
// react-router's, not a real runtime case, and `useExistingRabbi` already
// degrades to its disabled/'pending' status if it were ever missing.
export const RabbiViewPage = styled(({ className }: RabbiViewPageProps) => {
  const { id } = useParams<{ id: string }>();
  const existingRabbi = useExistingRabbi(id);
  const [hasPhotoLoadFailed, setHasPhotoLoadFailed] = useState(false);

  if (existingRabbi.isError) {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.rabbis}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>

        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(existingRabbi.error)}</p>
          <button type="button" className="retry" onClick={() => existingRabbi.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  if (existingRabbi.isPending) {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.rabbis}>
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

  const rabbi = existingRabbi.data;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.rabbis}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="main">
        <header className="header">
          {rabbi.photoUrl && !hasPhotoLoadFailed ? (
            <img className="poster" src={rabbi.photoUrl} alt="" onError={() => setHasPhotoLoadFailed(true)} />
          ) : (
            <div className="poster placeholder" aria-hidden="true" />
          )}

          <div className="identity">
            <div className="head">
              <h1 className="heading" dir="auto">
                {rabbiDisplayName(rabbi)}
              </h1>
              <Link className="editButton" to={ADMIN_ROUTES.rabbiEdit(rabbi.id)}>
                {consts.EDIT_LABEL}
              </Link>
            </div>

            {rabbi.title && (
              <p className="title" dir="auto">
                {rabbi.title}
              </p>
            )}
          </div>
        </header>

        <div className="fieldsGrid">
          <RecordField label={consts.PROMINENCE_LABEL} value={PROMINENCE_LABELS[rabbi.prominence]} />
          <RecordField className="wide" label={consts.BIO_LABEL} isEmpty={!rabbi.bio} value={rabbi.bio ?? consts.BIO_EMPTY_VALUE} />
        </div>
      </div>

      <RabbiLessonsSection rabbiId={rabbi.id} rabbiName={rabbi.name} rabbiHonorific={rabbi.honorific} />
    </div>
  );
})`
  ${styles.RabbiViewPage}
`;
