import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { PhotoPicker } from '~/components/PhotoPicker/PhotoPicker';
import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';
import { useRabbiProfile } from '~/RabbiPanel/useRabbiProfile';

import * as consts from './consts';
import { formStateFromProfile, validatePhotoFile, validateProfileForm } from './helpers';
import type { ProfileFormErrors, ProfileFormState, ProfilePageProps } from './models';
import * as styles from './styles';
import { usePhotoUpload } from './usePhotoUpload';
import { useSaveProfile } from './useSaveProfile';

export const ProfilePage = styled(({ className }: ProfilePageProps) => {
  const profile = useRabbiProfile();
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
    const clientError = validatePhotoFile(file);
    setPhotoValidationError(clientError);
    if (clientError) return;
    photoUpload.upload(file);
  };

  const handleSubmit = (): void => {
    const errors = validateProfileForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    saveProfile.mutate(form);
  };

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
            uploadStatus={photoUpload.status}
            onRetryUpload={photoUpload.retry}
          />
        </div>

        {saveProfile.isError && (
          <p className="generalError" role="alert">
            {rabbiErrorMessage(saveProfile.error)}
          </p>
        )}

        <label className="field">
          <span className="label">{consts.NAME_LABEL}</span>
          <input type="text" dir="auto" value={form.name} onChange={(event) => setForm((prev) => prev && { ...prev, name: event.target.value })} />
          <span className="helper">{consts.NAME_HELPER}</span>
          {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
        </label>

        <label className="field">
          <span className="label">{consts.TITLE_LABEL}</span>
          <input
            type="text"
            dir="auto"
            placeholder={consts.TITLE_PLACEHOLDER}
            value={form.title}
            onChange={(event) => setForm((prev) => prev && { ...prev, title: event.target.value })}
          />
          <span className="helper">{consts.TITLE_HELPER}</span>
        </label>

        <label className="field">
          <span className="label">{consts.BIO_LABEL}</span>
          <textarea dir="auto" value={form.bio} onChange={(event) => setForm((prev) => prev && { ...prev, bio: event.target.value })} />
          <span className="helper">{consts.BIO_HELPER}</span>
        </label>

        <p className="liveNote">{consts.LIVE_NOTE}</p>

        <div className="footer">
          <button type="submit" className="save" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
          </button>
          <button type="button" className="cancel" onClick={() => navigate(RABBI_ROUTES.upcoming)}>
            {consts.CANCEL_LABEL}
          </button>
        </div>
      </form>
    </div>
  );
})`
  ${styles.ProfilePage}
`;
