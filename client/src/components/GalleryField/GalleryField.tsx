import type { ChangeEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

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
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    onAddFiles(files);
  };

  return (
    <div className={className}>
      <div className="header">
        <span className="heading">{consts.GALLERY_HEADING}</span>
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
                <span className="label">{consts.GALLERY_FAILED_LABEL}</span>
                <button type="button" className="retry" onClick={() => onRetry(photo.id)}>
                  {consts.GALLERY_RETRY_LABEL}
                </button>
              </div>
            )}

            {photo.status === 'uploaded' && (
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
            <input className="fileInput" type="file" accept="image/jpeg,image/png" multiple onChange={handleChange} />
          </label>
        )}
      </div>

      {!canAddMore && <p className="maxReachedNote">{consts.GALLERY_MAX_REACHED_NOTE}</p>}
      <p className="help">{consts.GALLERY_HELP_LINE}</p>
    </div>
  );
})`
  ${styles.GalleryField}
`;
