import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage, validatePhotoFile } from '~/AdminPanel/helpers';
import { usePhotoPreviewUrl } from '~/AdminPanel/usePhotoPreviewUrl';
import { CitySelect } from '~/components/CitySelect/CitySelect';
import { PhotoPicker } from '~/components/PhotoPicker/PhotoPicker';
import { directionForValue } from '~/helpers';

import { PlaceAccountSection } from './components/PlaceAccountSection/PlaceAccountSection';
import * as consts from './consts';
import { pageHeading, placeToFormState, validatePlaceForm } from './helpers';
import type { PlaceFormErrors, PlaceFormPageProps, PlaceFormState } from './models';
import * as styles from './styles';
import { useExistingPlace } from './useExistingPlace';
import { useSavePlace } from './useSavePlace';

const emptyForm: PlaceFormState = {
  name: '',
  city: undefined,
  street: '',
  floor: '',
  existingFloor: undefined,
  photoFile: undefined,
  existingPhotoUrl: undefined,
  isActive: true,
};

export const PlaceFormPage = styled(({ className }: PlaceFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const existingPlace = useExistingPlace(id);
  const savePlace = useSavePlace();

  const [form, setForm] = useState<PlaceFormState>(emptyForm);
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PlaceFormErrors>({});

  useEffect(() => {
    if (existingPlace.data && !isLoadedFromExisting) {
      setForm(placeToFormState(existingPlace.data));
      setIsLoadedFromExisting(true);
    }
  }, [existingPlace.data, isLoadedFromExisting]);

  const newPreviewUrl = usePhotoPreviewUrl(form.photoFile);

  if (id && existingPlace.isPending) {
    return (
      <div className={className}>
        <div className="content">
          <Link className="breadcrumb" to={ADMIN_ROUTES.placeView(id)}>
            {consts.BACK_TO_PLACE_LABEL}
          </Link>

          <div className="form">
            <h1 className="heading">{consts.EDIT_PLACE_LOADING_HEADING}</h1>

            <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
              <div className="skeletonField">
                <div className="skeletonLine" />
                <div className="skeletonInput" />
              </div>
              <div className="skeletonField">
                <div className="skeletonLine" />
                <div className="skeletonInput" />
              </div>
              <div className="skeletonField">
                <div className="skeletonLine" />
                <div className="skeletonInput" />
              </div>
              <div className="skeletonField">
                <div className="skeletonLine" />
                <div className="skeletonInput" />
              </div>
              <div className="skeletonFrame" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id && existingPlace.isError) {
    return (
      <div className={className}>
        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(existingPlace.error)}</p>
          <button type="button" className="retry" onClick={() => existingPlace.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const previewPhotoUrl = newPreviewUrl ?? form.existingPhotoUrl;
  const cancelHref = id ? ADMIN_ROUTES.placeView(id) : ADMIN_ROUTES.places;

  const fieldsStepErrorCode = savePlace.stepError?.step === 'fields' ? savePlace.stepError.error.code : undefined;
  const cityError = fieldErrors.city ?? (fieldsStepErrorCode === 'unknown_city' ? consts.UNKNOWN_CITY_ERROR : undefined);
  // Shown only for a failure neither the city field nor the photo picker
  // already surfaces locally.
  const generalSaveError =
    savePlace.stepError?.step === 'fields' && fieldsStepErrorCode !== 'unknown_city' ? adminErrorMessage(savePlace.stepError.error) : undefined;

  const handleSelectFile = (file: File): void => {
    const clientError = validatePhotoFile(file);
    if (clientError) {
      setFieldErrors((prev) => ({ ...prev, photo: clientError }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, photo: undefined }));
    setForm((prev) => ({ ...prev, photoFile: file }));
  };

  const submit = async (): Promise<void> => {
    const errors = validatePlaceForm(form);
    // Replaces the name/city/street errors wholesale (so a field that just
    // became valid drops its stale error) while leaving `photo`, which
    // `handleSelectFile` owns on its own timeline, untouched.
    setFieldErrors((prev) => ({ photo: prev.photo, ...errors }));
    if (Object.keys(errors).length > 0) return;

    const place = await savePlace.save(form, id);
    if (!place) return;

    navigate(id ? ADMIN_ROUTES.placeView(place.id) : ADMIN_ROUTES.places);
  };

  return (
    <div className={className}>
      {/* Breadcrumb and form share one 640px column with one edge, rather
          than the breadcrumb sitting at the full page edge above a narrower,
          centred form (design gate finding F9). */}
      <div className="content">
        <Link className="breadcrumb" to={cancelHref}>
          {id ? consts.BACK_TO_PLACE_LABEL : consts.BACK_TO_LIST_LABEL}
        </Link>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          noValidate
        >
          <h1 className="heading" dir="auto">
            {pageHeading(form)}
          </h1>
          <p className="subtext">{consts.REQUIRED_FIELDS_NOTE}</p>

          {generalSaveError && (
            <p className="error" role="alert">
              {generalSaveError}
            </p>
          )}

          <label className="field">
            <span className="label">{consts.NAME_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(form.name)}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <span className="helper">{consts.NAME_HELPER}</span>
            {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
          </label>

          <div className="field">
            <span className="label">{consts.CITY_LABEL}</span>
            <CitySelect city={form.city} onSelectCity={(city) => setForm((prev) => ({ ...prev, city }))} placeholderLabel={consts.CITY_PLACEHOLDER} fullWidth />
            <span className="helper">{consts.CITY_HELPER}</span>
            {cityError && <span className="error">{cityError}</span>}
          </div>

          <label className="field">
            <span className="label">{consts.STREET_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(form.street)}
              value={form.street}
              onChange={(event) => setForm((prev) => ({ ...prev, street: event.target.value }))}
            />
            {fieldErrors.street && <span className="error">{fieldErrors.street}</span>}
          </label>

          <label className="field">
            <span className="label">{consts.FLOOR_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(form.floor)}
              value={form.floor}
              onChange={(event) => setForm((prev) => ({ ...prev, floor: event.target.value }))}
            />
          </label>

          <div className="field">
            <span className="label">{consts.PHOTO_LABEL}</span>
            <PhotoPicker
              aspectRatio="16:9"
              previewUrl={previewPhotoUrl}
              hasExistingPhoto={Boolean(form.existingPhotoUrl)}
              onSelectFile={handleSelectFile}
              errorMessage={fieldErrors.photo ?? (savePlace.stepError?.step === 'photo' ? adminErrorMessage(savePlace.stepError.error) : undefined)}
            />
          </div>

          {id && (
            <div className="field">
              <span className="label">{consts.STATUS_LABEL}</span>
              <div className="statusPicker" role="radiogroup" aria-label={consts.STATUS_LABEL}>
                <button
                  type="button"
                  className={classNames('pill', { selected: form.isActive })}
                  role="radio"
                  aria-checked={form.isActive}
                  onClick={() => setForm((prev) => ({ ...prev, isActive: true }))}
                >
                  {consts.STATUS_ACTIVE_LABEL}
                </button>
                <button
                  type="button"
                  className={classNames('pill', { selected: !form.isActive })}
                  role="radio"
                  aria-checked={!form.isActive}
                  onClick={() => setForm((prev) => ({ ...prev, isActive: false }))}
                >
                  {consts.STATUS_INACTIVE_LABEL}
                </button>
              </div>
              <span className="helper">{consts.STATUS_HELPER}</span>
            </div>
          )}

          <PlaceAccountSection placeId={id} placeName={form.name} />

          <div className="footer">
            <Link className="cancel" to={cancelHref}>
              {consts.CANCEL_LABEL}
            </Link>
            <button type="submit" className="save" disabled={savePlace.isSaving}>
              {savePlace.isSaving ? consts.SAVING_LABEL : consts.SAVE_LABEL}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
})`
  ${styles.PlaceFormPage}
`;
