import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import styled from 'styled-components';

import {
  ADMIN_ROUTES,
  DEDICATION_HONORIFIC_LABELS,
  DEDICATION_HONORIFIC_OPTIONS,
  DEDICATION_PARENT_NAME_LABELS,
  DEDICATION_TYPE_LABELS,
  DEDICATION_TYPE_OPTIONS,
  HONORED_GENDER_LABELS,
  HONORED_GENDER_OPTIONS,
  NO_HONORIFIC_LABEL,
} from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useExistingDedication } from '~/AdminPanel/useExistingDedication';
import { DedicationUnit } from '~/components/DedicationUnit/DedicationUnit';
import { directionForValue } from '~/helpers';

import * as consts from './consts';
import { dedicationFormErrorsFromDetails, dedicationFormFromExisting, emptyDedicationForm, pageHeading, validateDedicationForm } from './helpers';
import type { DedicationFormErrors, DedicationFormPageProps, DedicationFormState } from './models';
import * as styles from './styles';
import { useDedicationPreview } from './useDedicationPreview';
import { useSaveDedication } from './useSaveDedication';

export const DedicationFormPage = styled(({ className }: DedicationFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const existingDedication = useExistingDedication(id);
  const saveDedication = useSaveDedication();

  const [form, setForm] = useState<DedicationFormState>(emptyDedicationForm);
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<DedicationFormErrors>({});

  useEffect(() => {
    if (existingDedication.data && !isLoadedFromExisting) {
      setForm(dedicationFormFromExisting(existingDedication.data));
      setIsLoadedFromExisting(true);
    }
  }, [existingDedication.data, isLoadedFromExisting]);

  const preview = useDedicationPreview(form);

  if (id && existingDedication.isPending) {
    return (
      <div className={className}>
        <p className="state" aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      </div>
    );
  }

  if (id && existingDedication.isError) {
    return (
      <div className={className}>
        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(existingDedication.error)}</p>
          <button type="button" className="retry" onClick={() => existingDedication.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const serverFieldErrors = dedicationFormErrorsFromDetails(saveDedication.error?.details);
  const errorFor = (field: keyof DedicationFormErrors): string | undefined => fieldErrors[field] ?? serverFieldErrors[field];
  const cancelHref = id ? ADMIN_ROUTES.dedicationView(id) : ADMIN_ROUTES.dedications;

  const submit = async (): Promise<void> => {
    const errors = validateDedicationForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const dedication = await saveDedication.save(form, id);
    if (!dedication) return;

    navigate(ADMIN_ROUTES.dedicationView(dedication.id));
  };

  return (
    <div className={className}>
      <Link className="breadcrumb" to={cancelHref}>
        {id ? consts.BACK_TO_DEDICATION_LABEL : consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="layout">
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          noValidate
        >
          <h1 className="heading">{pageHeading(id)}</h1>
          <p className="subtext">{consts.REQUIRED_FIELDS_NOTE}</p>

          <div className="field">
            <span className="label">{consts.TYPE_LABEL}</span>
            <div className="pillPicker" role="radiogroup" aria-label={consts.TYPE_LABEL}>
              {DEDICATION_TYPE_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={classNames('pill', { selected: form.type === value })}
                  role="radio"
                  aria-checked={form.type === value}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      type: value,
                      closingLineEnabled: value === 'memorial' && prev.closingLineEnabled,
                      honorific: value === 'memorial' ? prev.honorific : undefined,
                    }))
                  }
                >
                  {DEDICATION_TYPE_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="label">{consts.NAME_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(form.honoredName)}
              value={form.honoredName}
              onChange={(event) => setForm((prev) => ({ ...prev, honoredName: event.target.value }))}
            />
            <span className="helper">{consts.NAME_HELPER}</span>
            {errorFor('honoredName') && <span className="error">{errorFor('honoredName')}</span>}
          </label>

          {form.type === 'memorial' && (
            <div className="field">
              <span className="label">{consts.HONORIFIC_LABEL}</span>
              <div className="pillPicker" role="radiogroup" aria-label={consts.HONORIFIC_LABEL}>
                <button
                  type="button"
                  className={classNames('pill', { selected: form.honorific === undefined })}
                  role="radio"
                  aria-checked={form.honorific === undefined}
                  onClick={() => setForm((prev) => ({ ...prev, honorific: undefined }))}
                >
                  {NO_HONORIFIC_LABEL}
                </button>
                {DEDICATION_HONORIFIC_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={classNames('pill', { selected: form.honorific === value })}
                    role="radio"
                    aria-checked={form.honorific === value}
                    onClick={() => setForm((prev) => ({ ...prev, honorific: value }))}
                  >
                    {DEDICATION_HONORIFIC_LABELS[value]}
                  </button>
                ))}
              </div>
              <span className="helper">{consts.HONORIFIC_HELPER}</span>
              {errorFor('honorific') && <span className="error">{errorFor('honorific')}</span>}
            </div>
          )}

          <label className="field">
            <span className="label">{DEDICATION_PARENT_NAME_LABELS[form.type]}</span>
            <input
              type="text"
              dir={directionForValue(form.parentName)}
              value={form.parentName}
              onChange={(event) => {
                const parentName = event.target.value;
                // The gender picker only ever shows once this field has
                // content (below), so a choice made for a parent name that
                // was since cleared must not linger unseen in the request:
                // the same rule `type` applies to `honorific` above.
                setForm((prev) => ({ ...prev, parentName, honoredGender: parentName.trim() ? prev.honoredGender : undefined }));
              }}
            />
            <span className="helper">{consts.PARENT_NAME_HELPER}</span>
            {form.type === 'success' && <span className="helper">{consts.PARENT_NAME_SUCCESS_HELPER}</span>}
            {errorFor('parentName') && <span className="error">{errorFor('parentName')}</span>}
          </label>

          {Boolean(form.parentName.trim()) && (
            <div className="field">
              <span className="label">{consts.GENDER_LABEL}</span>
              <div className="pillPicker" role="radiogroup" aria-label={consts.GENDER_LABEL}>
                {HONORED_GENDER_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={classNames('pill', { selected: form.honoredGender === value })}
                    role="radio"
                    aria-checked={form.honoredGender === value}
                    onClick={() => setForm((prev) => ({ ...prev, honoredGender: value }))}
                  >
                    {HONORED_GENDER_LABELS[value]}
                  </button>
                ))}
              </div>
              <span className="helper">{consts.GENDER_HELPER}</span>
              {errorFor('honoredGender') && <span className="error">{errorFor('honoredGender')}</span>}
            </div>
          )}

          <label className="field">
            <span className="label">{consts.DONOR_FAMILY_NAME_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(form.donorFamilyName)}
              value={form.donorFamilyName}
              onChange={(event) => setForm((prev) => ({ ...prev, donorFamilyName: event.target.value }))}
            />
            <span className="helper">{consts.DONOR_FAMILY_NAME_HELPER}</span>
            {errorFor('donorFamilyName') && <span className="error">{errorFor('donorFamilyName')}</span>}
          </label>

          {form.type === 'memorial' && (
            <>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form.closingLineEnabled}
                  onChange={(event) => setForm((prev) => ({ ...prev, closingLineEnabled: event.target.checked }))}
                />
                <span>{consts.CLOSING_LINE_LABEL}</span>
              </label>
              <p className="helper standalone">{consts.CLOSING_LINE_HELPER}</p>
            </>
          )}

          <div className="dateRow">
            <label className="field">
              <span className="label">{consts.STARTS_ON_LABEL}</span>
              <input type="date" value={form.startsOn} onChange={(event) => setForm((prev) => ({ ...prev, startsOn: event.target.value }))} />
              {errorFor('startsOn') && <span className="error">{errorFor('startsOn')}</span>}
            </label>

            <label className="field">
              <span className="label">{consts.ENDS_ON_LABEL}</span>
              <input type="date" value={form.endsOn} onChange={(event) => setForm((prev) => ({ ...prev, endsOn: event.target.value }))} />
              {errorFor('endsOn') && <span className="error">{errorFor('endsOn')}</span>}
            </label>
          </div>

          {saveDedication.error && !saveDedication.error.details && (
            <p className="formError" role="alert">
              {adminErrorMessage(saveDedication.error)}
            </p>
          )}

          <div className="footer">
            <Link className="cancel" to={cancelHref}>
              {consts.CANCEL_LABEL}
            </Link>
            <button type="submit" className="save" disabled={saveDedication.isSaving}>
              {saveDedication.isSaving ? consts.SAVING_LABEL : consts.SAVE_LABEL}
            </button>
          </div>
        </form>

        <aside className="preview">
          <p className="previewLabel">{consts.PREVIEW_LABEL}</p>
          <div className="previewField">
            {!preview.canPreview && <p className="previewNote">{consts.PREVIEW_BEFORE_READY_MESSAGE}</p>}
            {preview.canPreview && preview.isError && <p className="previewNote error">{consts.PREVIEW_ERROR_MESSAGE}</p>}
            {preview.canPreview && !preview.isError && !preview.text && <p className="previewNote">{consts.PREVIEW_LOADING_MESSAGE}</p>}
            {preview.canPreview && !preview.isError && preview.text && <DedicationUnit text={preview.text} variant="onPage" />}
          </div>
        </aside>
      </div>
    </div>
  );
})`
  ${styles.DedicationFormPage}
`;
