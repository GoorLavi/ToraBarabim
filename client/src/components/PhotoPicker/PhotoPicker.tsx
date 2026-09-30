import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { PhotoCropStep } from './components/PhotoCropStep/PhotoCropStep';
import * as consts from './consts';
import * as helpers from './helpers';
import type { CropCandidate, PhotoPickerProps } from './models';
import * as styles from './styles';

// A file picker with a fixed preview frame that never disappears and never
// changes height (rabbi-panel-copy.md, section 6), plus the real upload
// states a caller can opt into via `uploadStatus`: uploading (the new
// file's preview, dimmed, with a progress bar) and failed (the previous
// photo back at full opacity, with retry and choose-other actions).
// `aspectRatio` ('3:4', every rabbi's portrait, the default; '16:9', a
// place's own photo) changes the frame's proportions (styles.ts) and its
// help copy (helpers.ts, `photoHelpSize`); `minWidth`/`minHeight` are a
// caller's own floor, never assumed here. Only '16:9' gets an in-browser
// crop step (`components/PhotoCropStep`): a rabbi's portrait is still
// cropped on display with no tool of its own, exactly as before.
export const PhotoPicker = styled(
  ({
    className,
    previewUrl,
    hasExistingPhoto,
    onSelectFile,
    errorMessage,
    uploadStatus,
    onRetryUpload,
    aspectRatio = '3:4',
    minWidth,
    minHeight,
    cropHelpOverride,
    sizeHelpOverride,
    missingPhotoNoteOverride,
    hasPreviousPhotoOnFailure,
    failureReasonOverride,
  }: PhotoPickerProps) => {
    const ratioValue = helpers.aspectRatioValue(aspectRatio);
    const hasPhoto = Boolean(previewUrl || hasExistingPhoto);
    const isUploading = uploadStatus === 'uploading';
    const hasFailed = uploadStatus === 'failed';

    const [cropCandidate, setCropCandidate] = useState<CropCandidate | undefined>(undefined);
    // Local to this component, distinct from the caller's own
    // `errorMessage`: a file that cannot yield a crop never reaches
    // `onSelectFile`, so no caller validation ever runs on it and no caller
    // state ever learns about it.
    const [cropUnavailableError, setCropUnavailableError] = useState<string | undefined>(undefined);
    // Counts each `handleChange` call: a second pick before the first one's
    // own decode or re-encode has resolved must win, never race it, so
    // every async branch below checks this against the pick it started
    // from before acting on its result.
    const pickIdRef = useRef(0);

    useEffect(() => {
      if (!cropCandidate) return;
      return () => URL.revokeObjectURL(cropCandidate.objectUrl);
    }, [cropCandidate]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      const pickId = ++pickIdRef.current;
      const isLatestPick = (): boolean => pickIdRef.current === pickId;

      if (aspectRatio !== '16:9') {
        // '3:4' has no crop step of its own (only '16:9' opens one), so an
        // oversized phone photo is capped here instead, the same shared
        // helper the gallery's own upload path runs every file through
        // (`GalleryField.tsx`), rather than left to fail on the server's
        // own 413.
        void helpers.capPhotoSize(file).then((cappedFile) => {
          if (isLatestPick()) onSelectFile(cappedFile);
        });
        return;
      }

      setCropUnavailableError(undefined);
      void helpers.decodeImageFile(file).then(
        ({ objectUrl, width, height }) => {
          if (!isLatestPick()) {
            URL.revokeObjectURL(objectUrl);
            return;
          }
          if (!helpers.canCropToFloor({ width, height }, ratioValue, minWidth, minHeight)) {
            URL.revokeObjectURL(objectUrl);
            setCropUnavailableError(helpers.photoTooSmallError(minWidth, minHeight));
            return;
          }
          setCropCandidate({ file, objectUrl, dimensions: { width, height } });
        },
        () => {
          // Not a file the browser can decode as an image: hand it to the
          // caller as-is, so its own type validation catches it and shows
          // its own message, exactly as before this component cropped
          // anything.
          if (isLatestPick()) onSelectFile(file);
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
              {/* A rejection named by `failureReasonOverride` (too small, an
                  unsupported type) would fail the same way again with the
                  same file: only "choose another file" can succeed then, so
                  retry is offered only for an unclassified (likely network)
                  failure. */}
              {!failureReasonOverride && (
                <button type="button" className="retry" onClick={onRetryUpload}>
                  {consts.PHOTO_RETRY_LABEL}
                </button>
              )}
              <label className="chooseOther">
                <span>{consts.PHOTO_CHOOSE_OTHER}</span>
                <input type="file" accept="image/jpeg,image/png" onChange={handleChange} />
              </label>
              {/* Below the actions, matching where the rejected-file error
                  sits under .chooseFile (design gate nits: the two used to
                  disagree on which side the error sits). */}
              <p className="error">
                {failureReasonOverride ?? (hasPreviousPhotoOnFailure === false ? consts.PHOTO_UPLOAD_FAILED : consts.PHOTO_UPLOAD_FAILED_PREVIOUS_KEPT)}
              </p>
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
              {!isUploading && !hasPhoto && <p className="missingNote">{missingPhotoNoteOverride ?? consts.PHOTO_MISSING_NOTE}</p>}

              {!isUploading && (
                <ul className="help">
                  <li className="helpItem">{consts.PHOTO_HELP_TYPE}</li>
                  <li className="helpItem">{sizeHelpOverride ?? helpers.photoHelpSize(aspectRatio, minWidth, minHeight)}</li>
                  {(cropHelpOverride ?? consts.PHOTO_HELP_CROP[aspectRatio]) && (
                    <li className="helpItem">{cropHelpOverride ?? consts.PHOTO_HELP_CROP[aspectRatio]}</li>
                  )}
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
              aspectRatio: ratioValue,
              minWidth,
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
