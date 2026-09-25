import type { ChangeEvent, SyntheticEvent } from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { capPhotoSize } from '~/components/PhotoPicker/helpers';
import { COURSE_GALLERY_SOFT_MIN_SIDE } from '~/consts';

import * as consts from './consts';
import type { GalleryFieldProps } from './models';
import * as styles from './styles';

// The course record's optional gallery, beyond its required cover photo: a
// wrapping tile grid rather than `PhotoPicker`'s single fixed frame, since a
// gallery has no crop step and no one photo to keep centered (design brief
// B, item 6).
export const GalleryField = styled(({ className, photos, onAddFiles, onRemove, onRetry }: GalleryFieldProps) => {
  const canAddMore = photos.length < consts.COURSE_GALLERY_MAX_PHOTOS;
  // Read from each tile's own rendered `<img>`, the one thing every photo
  // has regardless of where its URL came from (a freshly picked file's
  // object URL or an already saved photo's server URL): the one mechanism
  // that catches a small photo on both forms, in both create and edit, and
  // survives a reload, with no dimension request of its own (design gate
  // fix round, reviewer finding B2).
  const [smallPhotoIds, setSmallPhotoIds] = useState<Set<string>>(new Set());

  const handlePhotoLoad = (photoId: string, event: SyntheticEvent<HTMLImageElement>): void => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const isSmall = Math.min(naturalWidth, naturalHeight) < COURSE_GALLERY_SOFT_MIN_SIDE;
    setSmallPhotoIds((previous) => {
      if (previous.has(photoId) === isSmall) return previous;
      const next = new Set(previous);
      if (isSmall) next.add(photoId);
      else next.delete(photoId);
      return next;
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []).slice(0, consts.COURSE_GALLERY_MAX_PHOTOS - photos.length);
    event.target.value = '';
    if (files.length === 0) return;
    // No crop step of its own to have already brought an oversized phone
    // photo under the server's own upload limit (`PhotoPicker.tsx`'s own
    // non-crop '3:4' path is the other place this same gap existed), so
    // every picked file runs through the shared cap first.
    void Promise.all(files.map((file) => capPhotoSize(file))).then((cappedFiles) => onAddFiles(cappedFiles));
  };

  const smallUploadedCount = photos.filter((photo) => photo.status === 'uploaded' && smallPhotoIds.has(photo.id)).length;

  return (
    <div className={className}>
      <div className="header">
        <span className="count">{consts.galleryCountLabel(photos.length)}</span>
      </div>

      <div className="grid">
        {photos.map((photo, index) => (
          <div key={photo.id} className={classNames('tile', { failed: photo.status === 'failed' })}>
            <img
              className={classNames('photo', { dimmed: photo.status !== 'uploaded' })}
              src={photo.url}
              alt=""
              onLoad={(event) => handlePhotoLoad(photo.id, event)}
            />

            {/* Above the photo, never under it (a border on the tile itself
                paints under the `<img>` and would not show): marks which
                tile the one warning below the grid is about (design gate
                fix round, designer). */}
            {photo.status === 'uploaded' && smallPhotoIds.has(photo.id) && <span className="smallRing" aria-hidden="true" />}

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

      {/* One line for every marked tile, not a rejection (design gate fix
          round, designer): after the failure reasons above, before the
          field's own help line (CourseFormFields.tsx renders that next). */}
      {smallUploadedCount > 0 && <p className="warning">{consts.gallerySmallPhotoWarning(smallUploadedCount)}</p>}

      {!canAddMore && <p className="maxReachedNote">{consts.GALLERY_MAX_REACHED_NOTE}</p>}
    </div>
  );
})`
  ${styles.GalleryField}
`;
