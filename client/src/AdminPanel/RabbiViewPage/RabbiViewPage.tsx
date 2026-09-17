import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, PROMINENCE_LABELS, skeletonFieldKeys } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useExistingRabbi } from '~/AdminPanel/RabbiFormPage/useExistingRabbi';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { RABBI_HONORIFIC_LABELS } from '~/consts';
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
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonPoster" />
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

      <div className="layout">
        <div className="main">
          <div className="head">
            <h1 className="heading" dir="auto">
              {rabbiDisplayName(rabbi)}
            </h1>
            <Link className="editButton" to={ADMIN_ROUTES.rabbiEdit(rabbi.id)}>
              {consts.EDIT_LABEL}
            </Link>
          </div>

          <div className="fieldsGrid">
            <ReadOnlyField label={consts.HONORIFIC_LABEL} value={RABBI_HONORIFIC_LABELS[rabbi.honorific]} />
            <ReadOnlyField label={consts.NAME_LABEL} value={rabbi.name} />
            <ReadOnlyField label={consts.TITLE_LABEL} value={rabbi.title ?? consts.TITLE_EMPTY_VALUE} />
            <ReadOnlyField label={consts.PROMINENCE_LABEL} value={PROMINENCE_LABELS[rabbi.prominence]} />
            <ReadOnlyField className="wide" label={consts.BIO_LABEL} value={rabbi.bio ?? consts.BIO_EMPTY_VALUE} />
          </div>
        </div>

        <aside className="poster">
          {rabbi.photoUrl && !hasPhotoLoadFailed ? (
            <img className="photo" src={rabbi.photoUrl} alt="" onError={() => setHasPhotoLoadFailed(true)} />
          ) : (
            <div className="photo placeholder" aria-hidden="true" />
          )}
        </aside>
      </div>

      <RabbiLessonsSection rabbiId={rabbi.id} rabbiName={rabbi.name} rabbiHonorific={rabbi.honorific} />
    </div>
  );
})`
  ${styles.RabbiViewPage}
`;
