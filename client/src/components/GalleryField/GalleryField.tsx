import type { ChangeEvent } from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import { clearsGalleryFloor } from './helpers';
import type { GalleryFieldProps } from './models';
import * as styles from './styles';

// The course record's optional gallery, beyond its required cover photo: a
// wrapping tile grid rather than `PhotoPicker`'s single fixed frame, since a
// gallery has no crop step and no one photo to keep centered (design brief
// B, item 6).
export const GalleryField = styled(({ className, photos, onAddFiles, onRemove, onRetry }: GalleryFieldProps) => {
  const canAddMore = photos.length < consts.COURSE_GALLERY_MAX_PHOTOS;
  const [tooSmallError, setTooSmallError] = useState<string | undefined>(undefined);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files ?? []).slice(0, consts.COURSE_GALLERY_MAX_PHOTOS - photos.length);
    event.target.value = '';
    if (files.length === 0) return;

    const checks = await Promise.all(files.map(async (file) => ({ file, clearsFloor: await clearsGalleryFloor(file) })));
    const accepted = checks.filter((check) => check.clearsFloor).map((check) => check.file);
    const rejectedCount = checks.length - accepted.length;
    setTooSmallError(rejectedCount > 0 ? consts.galleryTooSmallError(rejectedCount, accepted.length) : undefined);
    if (accepted.length > 0) onAddFiles(accepted);
  };

  return (
    <div className={className}>
      <div className="header">
        <span className="count">{consts.galleryCountLabel(photos.length)}</span>
      </div>

      <div className="grid">
        {photos.map((photo, index) => (
          <div key={photo.id} className="tile">
            <img className={classNames('photo', { dimmed: photo.status !== 'uploaded' })} src={photo.url} alt="" />

            {photo.status === 'uploading' && (
              <div className="status uploading">
                <span className="label">{consts.GALLERY_UPLOADING_LABEL}</span>
              </div>
            )}

            {photo.status === 'failed' && (
              <div className="status failed">
                <span className="label">{photo.failureReason}</span>
                {photo.canRetry !== false && (
                  <button type="button" className="retry" onClick={() => onRetry(photo.id)}>
                    {consts.GALLERY_RETRY_LABEL}
                  </button>
                )}
              </div>
            )}

            {(photo.status === 'uploaded' || photo.status === 'failed') && (
              <button type="button" className="remove" aria-label={consts.galleryRemoveLabel(index + 1)} onClick={() => onRemove(photo.id)}>
                {'×'}
              </button>
            )}
          </div>
        ))}

        {canAddMore && (
          <label className="addTile">
            <span className="plus" aria-hidden="true">
              {'+'}
            </span>
            <span className="label">{consts.GALLERY_ADD_LABEL}</span>
            <input className="fileInput" type="file" accept="image/jpeg,image/png" multiple onChange={(event) => void handleChange(event)} />
          </label>
        )}
      </div>

      {tooSmallError && (
        <p className="error" role="alert">
          {tooSmallError}
        </p>
      )}
      {!canAddMore && <p className="maxReachedNote">{consts.GALLERY_MAX_REACHED_NOTE}</p>}
    </div>
  );
})`
  ${styles.GalleryField}
`;
