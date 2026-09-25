import type { ChangeEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { COURSE_PHOTO_SMALL_WARNING } from '~/consts';

import * as consts from './consts';
import type { GalleryFieldProps } from './models';
import * as styles from './styles';

// The course record's optional gallery, beyond its required cover photo: a
// wrapping tile grid rather than `PhotoPicker`'s single fixed frame, since a
// gallery has no crop step and no one photo to keep centered (design brief
// B, item 6).
export const GalleryField = styled(({ className, photos, onAddFiles, onRemove, onRetry }: GalleryFieldProps) => {
  const canAddMore = photos.length < consts.COURSE_GALLERY_MAX_PHOTOS;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []).slice(0, consts.COURSE_GALLERY_MAX_PHOTOS - photos.length);
    event.target.value = '';
    if (files.length === 0) return;
    onAddFiles(files);
  };

  return (
    <div className={className}>
      <div className="header">
        <span className="count">{consts.galleryCountLabel(photos.length)}</span>
      </div>

      <div className="grid">
        {photos.map((photo, index) => (
          <div key={photo.id} className="tile">
            <div className={classNames('photoBox', { failed: photo.status === 'failed' })}>
              <img className={classNames('photo', { dimmed: photo.status !== 'uploaded' })} src={photo.url} alt="" />

              {photo.status === 'uploading' && (
                <div className="status uploading">
                  <span className="label">{consts.GALLERY_UPLOADING_LABEL}</span>
                </div>
              )}

              {photo.status === 'failed' && photo.canRetry !== false && (
                <button type="button" className="retryArea" onClick={() => onRetry(photo.id)}>
                  <span className="retryPill">{consts.GALLERY_RETRY_LABEL}</span>
                </button>
              )}

              {(photo.status === 'uploaded' || photo.status === 'failed') && (
                <button type="button" className="remove" aria-label={consts.galleryRemoveLabel(index + 1)} onClick={() => onRemove(photo.id)}>
                  <span className="removeIcon" aria-hidden="true">
                    {'×'}
                  </span>
                </button>
              )}
            </div>

            {/* Beside the photo it concerns, not a rejection: shown once the
                photo has uploaded, never while it is still uploading or
                showing a failure reason of its own. */}
            {photo.status === 'uploaded' && photo.isSmall && <p className="warning">{COURSE_PHOTO_SMALL_WARNING}</p>}
          </div>
        ))}

        {canAddMore && (
          <label className="addTile">
            <span className="plus" aria-hidden="true">
              {'+'}
            </span>
            <span className="label">{consts.GALLERY_ADD_LABEL}</span>
            <input className="fileInput" type="file" accept="image/jpeg,image/png" multiple onChange={handleChange} />
          </label>
        )}
      </div>

      {/* Below the whole grid, not inside a 94px tile (design gate round 2
          finding): a failed tile's own reason, one line per tile still
          failed. */}
      {photos
        .filter((photo): photo is typeof photo & { failureReason: string } => photo.status === 'failed' && photo.failureReason !== undefined)
        .map((photo) => (
          <p key={photo.id} className="error" role="alert">
            {photo.failureReason}
          </p>
        ))}
      {!canAddMore && <p className="maxReachedNote">{consts.GALLERY_MAX_REACHED_NOTE}</p>}
    </div>
  );
})`
  ${styles.GalleryField}
`;
