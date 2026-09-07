import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { AudiencePicker } from '~/components/AudiencePicker/AudiencePicker';
import { CitySelect } from '~/components/CitySelect/CitySelect';
import { RecurrenceFields } from '~/components/RecurrenceFields/RecurrenceFields';
import { RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';
import { useRabbiProfile } from '~/RabbiPanel/useRabbiProfile';

import { DeleteLessonSheet } from './components/DeleteLessonSheet/DeleteLessonSheet';
import { LessonPreviewCard } from './components/LessonPreviewCard/LessonPreviewCard';
import * as consts from './consts';
import { initialFormState, lessonToFormState, pageHeading, previewWeekdayLabel, validateLessonForm } from './helpers';
import type { LessonFormErrors, LessonFormPageProps, LessonFormState } from './models';
import * as styles from './styles';
import { useExistingLesson } from './useExistingLesson';
import { useSaveLesson } from './useSaveLesson';

export const LessonFormPage = styled(({ className }: LessonFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profile = useRabbiProfile();
  const existing = useExistingLesson(id);
  const saveLesson = useSaveLesson();

  const [form, setForm] = useState<LessonFormState>(() => initialFormState());
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LessonFormErrors>({});
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);

  const whenSectionRef = useRef<HTMLElement>(null);
  const whereSectionRef = useRef<HTMLElement>(null);
  const audienceSectionRef = useRef<HTMLElement>(null);
  const sectionRefsByHeading: Record<string, RefObject<HTMLElement | null>> = {
    [consts.WHEN_SECTION_HEADING]: whenSectionRef,
    [consts.WHERE_SECTION_HEADING]: whereSectionRef,
    [consts.AUDIENCE_SECTION_HEADING]: audienceSectionRef,
  };

  useEffect(() => {
    if (existing.status === 'success' && !isLoadedFromExisting) {
      setForm(lessonToFormState(existing.lesson));
      setIsLoadedFromExisting(true);
    }
  }, [existing, isLoadedFromExisting]);

  if (id && existing.status === 'pending') {
    return (
      <div className={className}>
        <p className="state" aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      </div>
    );
  }

  if (id && existing.status === 'error') {
    return (
      <div className={className}>
        <div className="state error" role="alert">
          <p className="message">{rabbiErrorMessage(existing.error, { 404: consts.LOAD_ERROR_MESSAGE })}</p>
          <button type="button" className="retry" onClick={existing.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const saveErrorCode = saveLesson.error instanceof RabbiApiError ? saveLesson.error.code : undefined;
  const generalSaveError = saveLesson.isError && saveErrorCode !== 'unknown_city' ? rabbiErrorMessage(saveLesson.error) : undefined;
  const cityError = fieldErrors.city ?? (saveErrorCode === 'unknown_city' ? consts.UNKNOWN_CITY_ERROR : undefined);
  const placeNameError = fieldErrors.placeName;

  const failingSections = consts.SECTION_DEFS.filter((section) => section.fields.some((field) => fieldErrors[field]));

  const submit = (): void => {
    const errors = validateLessonForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstFailingSection = consts.SECTION_DEFS.find((section) => section.fields.some((field) => errors[field]));
      const sectionElement = firstFailingSection && sectionRefsByHeading[firstFailingSection.heading]?.current;
      sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sectionElement?.querySelector<HTMLElement>('input, button, [tabindex]')?.focus();
      return;
    }

    saveLesson.mutate(
      { form, existingLessonId: id },
      { onSuccess: () => navigate(RABBI_ROUTES.lessons) },
    );
  };

  const rabbiName = profile.data?.name;
  const lessonTitleForDelete = form.title || rabbiName || consts.NEW_HEADING;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={RABBI_ROUTES.lessons}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="layout">
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          noValidate
        >
          <h1 className="heading">{pageHeading(Boolean(id))}</h1>
          {rabbiName && <p className="subtext">{consts.ownershipNote(rabbiName)}</p>}

          {generalSaveError && (
            <p className="generalError" role="alert">
              {generalSaveError}
            </p>
          )}

          <section className="section">
            <label className="field">
              <span className="label">{consts.TITLE_LABEL}</span>
              <input type="text" dir="auto" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              <span className="helper">{consts.TITLE_HELPER}</span>
            </label>
          </section>

          <section className="section" ref={whenSectionRef}>
            <h2 className="sectionHeading">{consts.WHEN_SECTION_HEADING}</h2>
            <RecurrenceFields
              recurrenceKind={form.recurrenceKind}
              onSelectRecurrenceKind={(recurrenceKind) => setForm((prev) => ({ ...prev, recurrenceKind }))}
              weekdays={form.weekdays}
              onToggleWeekday={(weekday) =>
                setForm((prev) => ({
                  ...prev,
                  weekdays: prev.weekdays.includes(weekday) ? prev.weekdays.filter((item) => item !== weekday) : [...prev.weekdays, weekday],
                }))
              }
              date={form.date}
              onChangeDate={(date) => setForm((prev) => ({ ...prev, date }))}
              startTime={form.startTime}
              onChangeStartTime={(startTime) => setForm((prev) => ({ ...prev, startTime }))}
              durationMinutes={form.durationMinutes}
              onChangeDurationMinutes={(durationMinutes) => setForm((prev) => ({ ...prev, durationMinutes }))}
              recurrenceErrorMessage={fieldErrors.recurrence}
              startTimeErrorMessage={fieldErrors.startTime}
              durationErrorMessage={fieldErrors.durationMinutes}
            />
          </section>

          <section className="section" ref={whereSectionRef}>
            <h2 className="sectionHeading">{consts.WHERE_SECTION_HEADING}</h2>
            <div className="field">
              <span className="label">{consts.CITY_LABEL}</span>
              <CitySelect
                city={form.city}
                onSelectCity={(city) => setForm((prev) => ({ ...prev, city }))}
                placeholderLabel={consts.CITY_PLACEHOLDER}
                fullWidth
              />
              <span className="helper">{consts.CITY_HELPER}</span>
              {cityError && <span className="error">{cityError}</span>}
            </div>

            <label className="field">
              <span className="label">{consts.PLACE_NAME_LABEL}</span>
              <input
                type="text"
                dir="auto"
                value={form.placeName}
                onChange={(event) => setForm((prev) => ({ ...prev, placeName: event.target.value }))}
              />
              {placeNameError && <span className="error">{placeNameError}</span>}
            </label>

            <label className="field">
              <span className="label">{consts.STREET_LABEL}</span>
              <input
                type="text"
                dir="auto"
                value={form.street}
                onChange={(event) => setForm((prev) => ({ ...prev, street: event.target.value }))}
              />
              <span className="helper">{consts.STREET_HELPER}</span>
              {fieldErrors.street && <span className="error">{fieldErrors.street}</span>}
            </label>

            <label className="field">
              <span className="label">{consts.FLOOR_LABEL}</span>
              <input type="text" dir="auto" value={form.floor} onChange={(event) => setForm((prev) => ({ ...prev, floor: event.target.value }))} />
            </label>
          </section>

          <section className="section" ref={audienceSectionRef}>
            <h2 className="sectionHeading">{consts.AUDIENCE_SECTION_HEADING}</h2>
            <AudiencePicker
              audience={form.audience}
              onSelectAudience={(audience) => setForm((prev) => ({ ...prev, audience }))}
              errorMessage={fieldErrors.audience}
            />
          </section>

          {failingSections.length > 0 && (
            <div className="errorSummary" role="alert">
              <p className="heading">{consts.ERROR_SUMMARY_HEADING}</p>
              <ul className="list">
                {failingSections.map((section) => (
                  <li key={section.heading}>{section.heading}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="liveNote">{consts.LIVE_NOTE}</p>

          <div className="footer">
            <button type="submit" className="save" disabled={saveLesson.isPending}>
              {saveLesson.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
            </button>
            <Link className="cancel" to={RABBI_ROUTES.lessons}>
              {consts.CANCEL_LABEL}
            </Link>
          </div>

          {id && (
            <div className="dangerZone">
              <button type="button" className="delete" onClick={() => setIsDeleteSheetOpen(true)}>
                {consts.DELETE_LABEL}
              </button>
            </div>
          )}
        </form>

        <aside className="preview">
          <LessonPreviewCard
            rabbiName={rabbiName}
            rabbiPhotoUrl={profile.data?.photoUrl}
            title={form.title}
            audience={form.audience}
            cityName={form.city?.name}
            weekdayLabel={previewWeekdayLabel(form)}
            startTime={form.startTime}
          />
        </aside>
      </div>

      {id && isDeleteSheetOpen && (
        <DeleteLessonSheet
          lessonId={id}
          lessonTitle={lessonTitleForDelete}
          onDismiss={() => setIsDeleteSheetOpen(false)}
          onDeleted={() => navigate(RABBI_ROUTES.lessons)}
        />
      )}
    </div>
  );
})`
  ${styles.LessonFormPage}
`;
