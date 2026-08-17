import classNames from 'classnames';
import styled from 'styled-components';

import * as parentConsts from '~/AdminPanel/RabbiFormPage/consts';

import type { PhotoPickerProps } from './models';
import * as styles from './styles';

// A file picker plus a plain preview of the selected image: no in-browser
// crop tool in this slice (a real drag-to-zoom, fixed 2:3 frame is its own
// sub-feature, see the report for this slice). The requirement copy below
// is shown as static help, not enforced pixel-for-pixel.
export const PhotoPicker = styled(({ className, previewUrl, hasExistingPhoto, onSelectFile, errorMessage }: PhotoPickerProps) => (
  <div className={classNames(className, { invalid: Boolean(errorMessage) })}>
    {previewUrl ? (
      <img className="preview" src={previewUrl} alt="" />
    ) : (
      <div className="preview placeholder" aria-hidden="true" />
    )}

    <label className="chooseFile">
      <span>{hasExistingPhoto || previewUrl ? parentConsts.PHOTO_REPLACE_LABEL : parentConsts.PHOTO_CHOOSE_LABEL}</span>
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelectFile(file);
        }}
      />
    </label>

    {errorMessage && <p className="error">{errorMessage}</p>}

    <ul className="help">
      <li className="helpItem">{parentConsts.PHOTO_HELP_TYPE}</li>
      <li className="helpItem">{parentConsts.PHOTO_HELP_SIZE}</li>
      <li className="helpItem">{parentConsts.PHOTO_HELP_CROP}</li>
    </ul>
  </div>
))`
  ${styles.PhotoPicker}
`;
