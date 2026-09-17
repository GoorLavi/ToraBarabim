import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { RabbiProminence } from '@torabarabim/common';
import classNames from 'classnames';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { PhotoPicker } from '~/components/PhotoPicker/PhotoPicker';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { directionForValue, rabbiDisplayName } from '~/helpers';

import { DeleteRabbiButton } from './components/DeleteRabbiButton/DeleteRabbiButton';
import { DiscardChangesSheet } from './components/DiscardChangesSheet/DiscardChangesSheet';
import { RabbiAccountSection } from './components/RabbiAccountSection/RabbiAccountSection';
import { RabbiPreviewCard } from './components/RabbiPreviewCard/RabbiPreviewCard';
import * as consts from './consts';
import { isRabbiFormDirty, pageHeading, validatePhotoFile, validateRabbiForm } from './helpers';
import type { RabbiFormErrors, RabbiFormPageProps, RabbiFormState } from './models';
import * as styles from './styles';
import { useExistingRabbi } from './useExistingRabbi';
import { usePhotoPreviewUrl } from './usePhotoPreviewUrl';
import { useSaveRabbi } from './useSaveRabbi';

const emptyForm: RabbiFormState = {
  name: '',
  honorific: 'rav',
  title: '',
  bio: '',
  existingTitle: undefined,
  existingBio: undefined,
  photoFile: undefined,
  existingPhotoUrl: undefined,
  prominence: 'local',
};

export const RabbiFormPage = styled(({ className }: RabbiFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const existingRabbi = useExistingRabbi(id);
  const saveRabbi = useSaveRabbi();

  const [form, setForm] = useState<RabbiFormState>(emptyForm);
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RabbiFormErrors>({});
  const [isDiscardSheetOpen, setIsDiscardSheetOpen] = useState(false);

  useEffect(() => {
    if (existingRabbi.data && !isLoadedFromExisting) {
      setForm({
        name: existingRabbi.data.name,
        honorific: existingRabbi.data.honorific,
        title: existingRabbi.data.title ?? '',
        bio: existingRabbi.data.bio ?? '',
        existingTitle: existingRabbi.data.title,
        existingBio: existingRabbi.data.bio,
        photoFile: undefined,
        existingPhotoUrl: existingRabbi.data.photoUrl,
        prominence: existingRabbi.data.prominence,
      });
      setIsLoadedFromExisting(true);
    }
  }, [existingRabbi.data, isLoadedFromExisting]);

  const newPreviewUrl = usePhotoPreviewUrl(form.photoFile);

  if (id && existingRabbi.isPending) {
    return (
      <div className={className}>
        <p className="state" aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      </div>
    );
  }

  if (id && existingRabbi.isError) {
    return (
      <div className={className}>
        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(existingRabbi.error)}</p>
          <button type="button" className="retry" onClick={() => existingRabbi.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const previewPhotoUrl = newPreviewUrl ?? form.existingPhotoUrl;

  const nameError = fieldErrors.name ?? (saveRabbi.stepError?.step === 'name' ? adminErrorMessage(saveRabbi.stepError.error) : undefined);
  const photoError = fieldErrors.photo ?? (saveRabbi.stepError?.step === 'photo' ? adminErrorMessage(saveRabbi.stepError.error) : undefined);

  // Edit mode only: whether the draft has unsaved changes, so cancelling
  // with nothing to lose skips the discard confirm-sheet (this slice's
  // brief, "the same dirty-check confirm-sheet pattern").
  const isDirty = Boolean(id && existingRabbi.data && isRabbiFormDirty(form, existingRabbi.data));
  const cancelHref = id ? ADMIN_ROUTES.rabbiView(id) : ADMIN_ROUTES.rabbis;

  const handleSelectFile = (file: File): void => {
    const clientError = validatePhotoFile(file);
    setFieldErrors((prev) => ({ ...prev, photo: clientError }));
    if (clientError) return;
    setForm((prev) => ({ ...prev, photoFile: file }));
  };

  const submit = async (after: 'firstLesson' | 'list'): Promise<void> => {
    const errors = validateRabbiForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const rabbi = await saveRabbi.save(form, id);
    if (!rabbi) return;

    if (after === 'firstLesson') navigate(`${ADMIN_ROUTES.lessonNew}?rabbiId=${rabbi.id}`);
    else navigate(id ? ADMIN_ROUTES.rabbiView(rabbi.id) : ADMIN_ROUTES.rabbis);
  };

  return (
    <div className={className}>
      <Link className="breadcrumb" to={cancelHref}>
        {id ? consts.BACK_TO_RABBI_LABEL : consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="layout">
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit('list');
          }}
          noValidate
        >
          <h1 className="heading" dir="auto">
            {pageHeading(form)}
          </h1>
          <p className="subtext">{consts.REQUIRED_FIELDS_NOTE}</p>

          {id ? (
            <ReadOnlyField
              label={consts.HONORIFIC_LABEL}
              value={consts.HONORIFIC_LABELS[form.honorific]}
              helper={consts.HONORIFIC_READONLY_NOTE}
            />
          ) : (
            <div className="field">
              <span className="label">{consts.HONORIFIC_LABEL}</span>
              <div className="honorificPicker" role="radiogroup" aria-label={consts.HONORIFIC_LABEL}>
                {consts.HONORIFIC_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={classNames('pill', { selected: form.honorific === value })}
                    role="radio"
                    aria-checked={form.honorific === value}
                    onClick={() => setForm((prev) => ({ ...prev, honorific: value }))}
                  >
                    {consts.HONORIFIC_LABELS[value]}
                  </button>
                ))}
              </div>
              <span className="helper">{consts.HONORIFIC_HELPER}</span>
            </div>
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
            {nameError && <span className="error">{nameError}</span>}
          </label>

          <label className="field">
            <span className="label">{consts.TITLE_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(form.title)}
              placeholder={consts.TITLE_PLACEHOLDER}
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <span className="helper">{consts.TITLE_HELPER}</span>
          </label>

          <label className="field">
            <span className="label">{consts.BIO_LABEL}</span>
            <textarea
              dir={directionForValue(form.bio)}
              value={form.bio}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
            />
            <span className="helper">{consts.BIO_HELPER}</span>
          </label>

          <label className="field">
            <span className="label">{consts.PROMINENCE_LABEL}</span>
            <select
              dir="auto"
              value={form.prominence}
              onChange={(event) => setForm((prev) => ({ ...prev, prominence: event.target.value as RabbiProminence }))}
            >
              {consts.PROMINENCE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {consts.PROMINENCE_LABELS[value]}
                </option>
              ))}
            </select>
            <span className="helper">{consts.PROMINENCE_HELPER}</span>
          </label>

          <div className="field">
            <span className="label">{consts.PHOTO_LABEL}</span>
            <PhotoPicker
              previewUrl={previewPhotoUrl}
              hasExistingPhoto={Boolean(form.existingPhotoUrl)}
              onSelectFile={handleSelectFile}
              errorMessage={photoError}
            />
          </div>

          <RabbiAccountSection rabbiId={id} rabbiName={form.name} />

          <div className="footer">
            <Link className="cancel" to={ADMIN_ROUTES.rabbis}>
              {consts.CANCEL_LABEL}
            </Link>
            <button type="button" className="saveAndAddLesson" disabled={saveRabbi.isSaving} onClick={() => void submit('firstLesson')}>
              {consts.SAVE_AND_ADD_LESSON_LABEL}
            </button>
            <button type="submit" className="save" disabled={saveRabbi.isSaving}>
              {saveRabbi.isSaving ? consts.SAVING_LABEL : consts.SAVE_LABEL}
            </button>
          </div>

          {id && (
            <div className="dangerZone">
              <DeleteRabbiButton rabbiId={id} onDeleted={() => navigate(ADMIN_ROUTES.rabbis)} />
            </div>
          )}
        </form>

        <aside className="preview">
          <RabbiPreviewCard photoUrl={previewPhotoUrl} name={form.name.trim() ? rabbiDisplayName({ name: form.name, honorific: form.honorific }) : ''} />
        </aside>
      </div>
    </div>
  );
})`
  ${styles.RabbiFormPage}
`;
