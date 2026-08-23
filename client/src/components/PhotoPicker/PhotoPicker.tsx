import type { ChangeEvent } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import type { PhotoPickerProps } from './models';
import * as styles from './styles';

// A file picker with a fixed 2:3 preview frame that never disappears and
// never changes height (rabbi-panel-copy.md, section 6), plus the real
// upload states a caller can opt into via `uploadStatus`: uploading (the
// new file's preview, dimmed, with a progress bar) and failed (the
// previous photo back at full opacity, with retry and choose-other
// actions). No in-browser crop tool in this slice: the requirement copy
// below is shown as static help, not enforced pixel-for-pixel.
export const PhotoPicker = styled(
  ({ className, previewUrl, hasExistingPhoto, onSelectFile, errorMessage, uploadStatus, onRetryUpload }: PhotoPickerProps) => {
    const hasPhoto = Boolean(previewUrl || hasExistingPhoto);
    const isUploading = uploadStatus === 'uploading';
    const hasFailed = uploadStatus === 'failed';

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) onSelectFile(file);
      event.target.value = '';
    };

    return (
      <div className={classNames(className, { invalid: Boolean(errorMessage), missing: !hasPhoto })}>
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
              <p className="error">{consts.PHOTO_UPLOAD_FAILED}</p>
              <button type="button" className="retry" onClick={onRetryUpload}>
                {consts.PHOTO_RETRY_LABEL}
              </button>
              <label className="chooseOther">
                <span>{consts.PHOTO_CHOOSE_OTHER}</span>
                <input type="file" accept="image/jpeg,image/png" onChange={handleChange} />
              </label>
            </div>
          )}

          {!isUploading && !hasFailed && (
            <>
              <label className={classNames('chooseFile', { primary: !hasPhoto })}>
                <span>{hasPhoto ? consts.PHOTO_REPLACE_LABEL : consts.PHOTO_CHOOSE_LABEL}</span>
                <input type="file" accept="image/jpeg,image/png" onChange={handleChange} />
              </label>

              {errorMessage && <p className="error">{errorMessage}</p>}
              {!hasPhoto && <p className="missingNote">{consts.PHOTO_MISSING_NOTE}</p>}

              <ul className="help">
                <li className="helpItem">{consts.PHOTO_HELP_TYPE}</li>
                <li className="helpItem">{consts.PHOTO_HELP_SIZE}</li>
                <li className="helpItem">{consts.PHOTO_HELP_CROP}</li>
              </ul>
            </>
          )}
        </div>
      </div>
    );
  },
)`
  ${styles.PhotoPicker}
`;
