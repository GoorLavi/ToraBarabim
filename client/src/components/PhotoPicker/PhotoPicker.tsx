import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { PhotoCropStep } from './components/PhotoCropStep/PhotoCropStep';
import * as consts from './consts';
import * as helpers from './helpers';
import type { CropCandidate, PhotoPickerProps } from './models';
import * as styles from './styles';

// Reads a file's real pixel dimensions by decoding it into an `<img>`, the
// same technique `PlacePanel/ProfilePage/helpers.ts`'s own
// `readImageDimensions` uses for its own, separate check: no shared home for
// either copy (a page-level helper and this shared component do not import
// from each other), so this is a small, independent duplicate rather than a
// reach across that boundary.
const loadImageDimensions = (file: File): Promise<{ objectUrl: string; width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ objectUrl, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`failed to read image dimensions for ${file.name}`));
    };
    image.src = objectUrl;
  });

// A file picker with a fixed preview frame that never disappears and never
// changes height (rabbi-panel-copy.md, section 6), plus the real upload
// states a caller can opt into via `uploadStatus`: uploading (the new
// file's preview, dimmed, with a progress bar) and failed (the previous
// photo back at full opacity, with retry and choose-other actions).
// `aspectRatio` ('3:4', every rabbi's portrait, the default; '16:9', a
// place's own photo) is the one thing that changes the frame's proportions,
// its width, and the help copy below it; see `styles.ts` and `consts.ts` for
// the single place each lives. Only '16:9' gets an in-browser crop step
// (`components/PhotoCropStep`): a rabbi's portrait is still cropped on
// display with no tool of its own, exactly as before.
export const PhotoPicker = styled(
  ({ className, previewUrl, hasExistingPhoto, onSelectFile, errorMessage, uploadStatus, onRetryUpload, aspectRatio = '3:4' }: PhotoPickerProps) => {
    const hasPhoto = Boolean(previewUrl || hasExistingPhoto);
    const isUploading = uploadStatus === 'uploading';
    const hasFailed = uploadStatus === 'failed';

    const [cropCandidate, setCropCandidate] = useState<CropCandidate | undefined>(undefined);
    // Local to this component, distinct from the caller's own
    // `errorMessage`: a file that cannot yield a crop never reaches
    // `onSelectFile`, so no caller validation ever runs on it and no caller
    // state ever learns about it.
    const [cropUnavailableError, setCropUnavailableError] = useState<string | undefined>(undefined);

    useEffect(() => {
      if (!cropCandidate) return;
      return () => URL.revokeObjectURL(cropCandidate.objectUrl);
    }, [cropCandidate]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      if (aspectRatio !== '16:9') {
        onSelectFile(file);
        return;
      }

      setCropUnavailableError(undefined);
      void loadImageDimensions(file).then(
        ({ objectUrl, width, height }) => {
          if (!helpers.canCropToFloor({ width, height })) {
            URL.revokeObjectURL(objectUrl);
            setCropUnavailableError(consts.PHOTO_TOO_SMALL_TO_CROP_ERROR);
            return;
          }
          setCropCandidate({ file, objectUrl, dimensions: { width, height } });
        },
        () => {
          // Not a file the browser can decode as an image: hand it to the
          // caller as-is, so its own type validation catches it and shows
          // its own message, exactly as before this component cropped
          // anything.
          onSelectFile(file);
        },
      );
    };

    const displayedError = cropUnavailableError ?? errorMessage;

    return (
      <div className={classNames(className, `ratio${aspectRatio.replace(':', 'x')}`, { invalid: Boolean(displayedError), missing: !hasPhoto })}>
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

              {!isUploading && displayedError && <p className="error">{displayedError}</p>}
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

        {cropCandidate && (
          <PhotoCropStep
            key={cropCandidate.objectUrl}
            {...{
              file: cropCandidate.file,
              imageUrl: cropCandidate.objectUrl,
              sourceDimensions: cropCandidate.dimensions,
              onConfirm: (croppedFile: File): void => {
                setCropCandidate(undefined);
                onSelectFile(croppedFile);
              },
              onCancel: (): void => setCropCandidate(undefined),
            }}
          />
        )}
      </div>
    );
  },
)`
  ${styles.PhotoPicker}
`;
