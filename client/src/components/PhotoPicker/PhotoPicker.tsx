import type { ChangeEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import type { PhotoPickerProps } from './models';
import * as styles from './styles';

// A file picker with a fixed preview frame that never disappears and never
// changes height (rabbi-panel-copy.md, section 6), plus the real upload
// states a caller can opt into via `uploadStatus`: uploading (the new
// file's preview, dimmed, with a progress bar) and failed (the previous
// photo back at full opacity, with retry and choose-other actions). No
// in-browser crop tool in this slice: the requirement copy below is shown
// as static help, not enforced pixel-for-pixel. `aspectRatio` ('3:4', every
// rabbi's portrait, the default; '16:9', a place's own photo) is the one
// thing that changes the frame's proportions, its width, and this help
// copy; see `styles.ts` and `consts.ts` for the single place each lives.
export const PhotoPicker = styled(
  ({ className, previewUrl, hasExistingPhoto, onSelectFile, errorMessage, uploadStatus, onRetryUpload, aspectRatio = '3:4' }: PhotoPickerProps) => {
    const hasPhoto = Boolean(previewUrl || hasExistingPhoto);
    const isUploading = uploadStatus === 'uploading';
    const hasFailed = uploadStatus === 'failed';

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) onSelectFile(file);
      event.target.value = '';
    };

    return (
      <div className={classNames(className, `ratio${aspectRatio.replace(':', 'x')}`, { invalid: Boolean(errorMessage), missing: !hasPhoto })}>
        <div className="frame">
          {previewUrl ? (
            <img className={classNames('preview', { dimmed: isUploading })} src={previewUrl} alt="" />
          ) : (
            <div className="preview placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="details">
          {isUploading && (
            <div className="progress">
              <div className="bar">
                <span />
              </div>
              <p className="status">{consts.PHOTO_UPLOADING_MESSAGE}</p>
            </div>
          )}

          {hasFailed && (
            <div className="failure">
              <button type="button" className="retry" onClick={onRetryUpload}>
                {consts.PHOTO_RETRY_LABEL}
              </button>
              <label className="chooseOther">
                <span>{consts.PHOTO_CHOOSE_OTHER}</span>
                <input type="file" accept="image/jpeg,image/png" onChange={handleChange} />
              </label>
              {/* Below the actions, matching where the rejected-file error
                  sits under .chooseFile (design gate nits: the two used to
                  disagree on which side the error sits). */}
              <p className="error">{consts.PHOTO_UPLOAD_FAILED}</p>
            </div>
          )}

          {!hasFailed && (
            <>
              {/* Stays on screen and disabled while uploading, rather than
                  vanishing and shifting the layout underneath it (design
                  gate, PhotoPicker nits). Choosing a different file while
                  one is already uploading still has no cancel affordance
                  of its own: a real "cancel this upload" needs an abort
                  wired through the mutation, in both this panel's and the
                  rabbi panel's own copy of usePhotoUpload, which is out of
                  this slice; flagged in the report. */}
              <label className={classNames('chooseFile', { primary: !hasPhoto, disabled: isUploading })}>
                <span>{hasPhoto ? consts.PHOTO_REPLACE_LABEL : consts.PHOTO_CHOOSE_LABEL}</span>
                <input type="file" accept="image/jpeg,image/png" onChange={handleChange} disabled={isUploading} />
              </label>

              {!isUploading && errorMessage && <p className="error">{errorMessage}</p>}
              {!isUploading && !hasPhoto && <p className="missingNote">{consts.PHOTO_MISSING_NOTE}</p>}

              {!isUploading && (
                <ul className="help">
                  <li className="helpItem">{consts.PHOTO_HELP_TYPE}</li>
                  <li className="helpItem">{consts.PHOTO_HELP_SIZE[aspectRatio]}</li>
                  {consts.PHOTO_HELP_CROP[aspectRatio] && <li className="helpItem">{consts.PHOTO_HELP_CROP[aspectRatio]}</li>}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
)`
  ${styles.PhotoPicker}
`;
