import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import { DeleteRabbiButton } from './components/DeleteRabbiButton/DeleteRabbiButton';
import { PhotoPicker } from './components/PhotoPicker/PhotoPicker';
import { RabbiPreviewCard } from './components/RabbiPreviewCard/RabbiPreviewCard';
import * as consts from './consts';
import { pageHeading, validatePhotoFile, validateRabbiForm } from './helpers';
import type { RabbiFormErrors, RabbiFormPageProps, RabbiFormState } from './models';
import * as styles from './styles';
import { useExistingRabbi } from './useExistingRabbi';
import { usePhotoPreviewUrl } from './usePhotoPreviewUrl';
import { useSaveRabbi } from './useSaveRabbi';

const emptyForm: RabbiFormState = { name: '', photoFile: undefined, existingPhotoUrl: undefined };

export const RabbiFormPage = styled(({ className }: RabbiFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const existingRabbi = useExistingRabbi(id);
  const saveRabbi = useSaveRabbi();

  const [form, setForm] = useState<RabbiFormState>(emptyForm);
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RabbiFormErrors>({});

  useEffect(() => {
    if (existingRabbi.data && !isLoadedFromExisting) {
      setForm({ name: existingRabbi.data.name, photoFile: undefined, existingPhotoUrl: existingRabbi.data.photoUrl });
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
    else navigate(ADMIN_ROUTES.rabbis);
  };

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.rabbis}>
        {consts.BACK_TO_LIST_LABEL}
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
          <p className="subtext">{consts.TWO_FIELDS_NOTE}</p>

          <label className="field">
            <span className="label">{consts.NAME_LABEL}</span>
            <input type="text" dir="auto" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            <span className="helper">{consts.NAME_HELPER}</span>
            {nameError && <span className="error">{nameError}</span>}
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
          <RabbiPreviewCard photoUrl={previewPhotoUrl} name={form.name} />
        </aside>
      </div>
    </div>
  );
})`
  ${styles.RabbiFormPage}
`;
