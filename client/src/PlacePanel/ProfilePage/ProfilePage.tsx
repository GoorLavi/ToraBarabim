import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { CitySelect } from '~/components/CitySelect/CitySelect';
import { PhotoPicker } from '~/components/PhotoPicker/PhotoPicker';
import { directionForValue } from '~/helpers';
import { PLACE_ROUTES } from '~/PlacePanel/consts';
import { placeErrorMessage } from '~/PlacePanel/helpers';
import { usePlaceProfile } from '~/PlacePanel/usePlaceProfile';

import * as consts from './consts';
import { formStateFromProfile, validatePlacePhotoFile, validateProfileForm } from './helpers';
import type { ProfileFormErrors, ProfileFormState, ProfilePageProps } from './models';
import * as styles from './styles';
import { usePhotoUpload } from './usePhotoUpload';
import { useSaveProfile } from './useSaveProfile';

// A place edits its full profile here, name and city included: unlike a
// rabbi's own profile page, changing these changes what every lesson
// pointing at this place displays everywhere on the site, and that is the
// feature rather than a hazard (build brief).
export const ProfilePage = styled(({ className }: ProfilePageProps) => {
  const profile = usePlaceProfile();
  const saveProfile = useSaveProfile();
  const photoUpload = usePhotoUpload();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileFormState | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({});
  const [photoValidationError, setPhotoValidationError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (profile.data && !form) setForm(formStateFromProfile(profile.data));
  }, [profile.data, form]);

  if (profile.isPending) {
    return (
      <div className={className}>
        <h1 className="heading">{consts.HEADING}</h1>
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonFrame" />
          <div className="skeletonLines">
            <div className="skeletonLine short" />
            <div className="skeletonLine short" />
            <div className="skeletonLine" />
          </div>
        </div>
      </div>
    );
  }

  if (profile.isError || !form) {
    return (
      <div className={className}>
        <h1 className="heading">{consts.HEADING}</h1>
        <div className="state" role="alert">
          <p className="message">{consts.ERROR_MESSAGE}</p>
          <button type="button" className="retry" onClick={() => void profile.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const handleSelectFile = (file: File): void => {
    void validatePlacePhotoFile(file).then((clientError) => {
      setPhotoValidationError(clientError);
      if (clientError) return;
      photoUpload.upload(file);
    });
  };

  const handleSubmit = (): void => {
    const errors = validateProfileForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    saveProfile.mutate(form);
  };

  const saveErrorCode = saveProfile.error?.code;
  const generalSaveError = saveProfile.isError && saveErrorCode !== 'unknown_city' ? placeErrorMessage(saveProfile.error) : undefined;
  const cityError = fieldErrors.city ?? (saveErrorCode === 'unknown_city' ? consts.UNKNOWN_CITY_ERROR : undefined);

  return (
    <div className={className}>
      <h1 className="heading">{consts.HEADING}</h1>
      <p className="subtext">{consts.SUBTEXT}</p>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        <div className="field">
          <span className="label">{consts.PHOTO_LABEL}</span>
          <PhotoPicker
            className="photoPicker"
            previewUrl={photoUpload.previewUrl ?? profile.data.photoUrl}
            hasExistingPhoto={Boolean(profile.data.photoUrl)}
            onSelectFile={handleSelectFile}
            errorMessage={photoValidationError}
            aspectRatio="16:9"
            uploadStatus={photoUpload.status}
            onRetryUpload={photoUpload.retry}
          />
          {photoUpload.status === 'failed' && photoUpload.error && <p className="error">{placeErrorMessage(photoUpload.error)}</p>}
        </div>

        {generalSaveError && (
          <p className="generalError" role="alert">
            {generalSaveError}
          </p>
        )}

        <label className="field">
          <span className="label">{consts.NAME_LABEL}</span>
          <input
            type="text"
            dir={directionForValue(form.name)}
            value={form.name}
            onChange={(event) => setForm((prev) => prev && { ...prev, name: event.target.value })}
          />
          {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
        </label>

        <div className="field">
          <span className="label">{consts.CITY_LABEL}</span>
          <CitySelect city={form.city} onSelectCity={(city) => setForm((prev) => prev && { ...prev, city })} placeholderLabel={consts.CITY_PLACEHOLDER} fullWidth />
          <span className="helper">{consts.CITY_HELPER}</span>
          {cityError && <span className="error">{cityError}</span>}
        </div>

        <label className="field">
          <span className="label">{consts.STREET_LABEL}</span>
          <input
            type="text"
            dir={directionForValue(form.street)}
            value={form.street}
            onChange={(event) => setForm((prev) => prev && { ...prev, street: event.target.value })}
          />
          <span className="helper">{consts.STREET_HELPER}</span>
          {fieldErrors.street && <span className="error">{fieldErrors.street}</span>}
        </label>

        <label className="field">
          <span className="label">{consts.FLOOR_LABEL}</span>
          <input
            type="text"
            dir={directionForValue(form.floor)}
            value={form.floor}
            onChange={(event) => setForm((prev) => prev && { ...prev, floor: event.target.value })}
          />
        </label>

        <p className="liveNote">{consts.LIVE_NOTE}</p>

        <div className="footer">
          <button type="submit" className="save" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
          </button>
          <button type="button" className="cancel" onClick={() => navigate(PLACE_ROUTES.lessons)}>
            {consts.CANCEL_LABEL}
          </button>
        </div>
      </form>
    </div>
  );
})`
  ${styles.ProfilePage}
`;
