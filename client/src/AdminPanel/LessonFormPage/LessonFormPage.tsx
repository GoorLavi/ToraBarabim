import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { CitySelect } from '~/AdminPanel/components/CitySelect/CitySelect';
import { AdminApiError } from '~/AdminPanel/api';
import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';

import { AudiencePicker } from './components/AudiencePicker/AudiencePicker';
import { LessonPreviewCard } from './components/LessonPreviewCard/LessonPreviewCard';
import { RabbiPicker } from './components/RabbiPicker/RabbiPicker';
import { RecurrenceFields } from './components/RecurrenceFields/RecurrenceFields';
import * as consts from './consts';
import { initialFormState, lessonToFormState, pageHeading, previewWeekdayLabel, validateLessonForm } from './helpers';
import type { LessonFormErrors, LessonFormPageProps, LessonFormState } from './models';
import * as styles from './styles';
import { useExistingLesson } from './useExistingLesson';
import { usePreselectedRabbi } from './usePreselectedRabbi';
import { useSaveLesson } from './useSaveLesson';

export const LessonFormPage = styled(({ className }: LessonFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const existing = useExistingLesson(id);
  const preselectedRabbi = usePreselectedRabbi(id ? null : searchParams.get('rabbiId'));
  const saveLesson = useSaveLesson();

  const [form, setForm] = useState<LessonFormState>(() => initialFormState(undefined));
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [hasAppliedPreselect, setHasAppliedPreselect] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LessonFormErrors>({});

  const rabbiSectionRef = useRef<HTMLElement>(null);
  const whenSectionRef = useRef<HTMLElement>(null);
  const whereSectionRef = useRef<HTMLElement>(null);
  const audienceSectionRef = useRef<HTMLElement>(null);
  const sectionRefsByHeading: Record<string, RefObject<HTMLElement | null>> = {
    [consts.RABBI_SECTION_HEADING]: rabbiSectionRef,
    [consts.WHEN_SECTION_HEADING]: whenSectionRef,
    [consts.WHERE_SECTION_HEADING]: whereSectionRef,
    [consts.AUDIENCE_SECTION_HEADING]: audienceSectionRef,
  };

  useEffect(() => {
    if (existing.status === 'success' && !isLoadedFromExisting) {
      setForm(lessonToFormState(existing.data.lesson, existing.data.rabbi, existing.data.place, existing.data.city));
      setIsLoadedFromExisting(true);
    }
  }, [existing, isLoadedFromExisting]);

  useEffect(() => {
    if (!id && preselectedRabbi && !hasAppliedPreselect) {
      setForm((prev) => ({ ...prev, rabbi: preselectedRabbi }));
      setHasAppliedPreselect(true);
    }
  }, [id, preselectedRabbi, hasAppliedPreselect]);

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
          <p className="message">{adminErrorMessage(existing.error)}</p>
          <button type="button" className="retry" onClick={existing.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const existingPlaceId = existing.status === 'success' ? existing.data.place?.id : undefined;
  const saveErrorCode = saveLesson.error instanceof AdminApiError ? saveLesson.error.code : undefined;
  const generalSaveError =
    saveLesson.isError && !['unknown_rabbi', 'unknown_place', 'unknown_city'].includes(saveErrorCode ?? '')
      ? adminErrorMessage(saveLesson.error)
      : undefined;

  const rabbiError = fieldErrors.rabbi ?? (saveErrorCode === 'unknown_rabbi' ? consts.UNKNOWN_RABBI_ERROR : undefined);
  const cityError = fieldErrors.city ?? (saveErrorCode === 'unknown_city' ? consts.UNKNOWN_CITY_ERROR : undefined);
  const placeNameError = fieldErrors.placeName ?? (saveErrorCode === 'unknown_place' ? consts.UNKNOWN_PLACE_ERROR : undefined);

  const failingSections = consts.SECTION_DEFS.filter((section) => section.fields.some((field) => fieldErrors[field]));

  const submit = (afterSave: 'list' | 'again'): void => {
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
      { form, existingLessonId: id, existingPlaceId },
      {
        onSuccess: () => {
          if (afterSave === 'list') {
            navigate(ADMIN_ROUTES.lessons);
          } else {
            setForm(initialFormState(undefined));
            setFieldErrors({});
          }
        },
      },
    );
  };

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.lessons}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="layout">
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            submit('list');
          }}
          noValidate
        >
          <h1 className="heading" dir="auto">
            {pageHeading(form)}
          </h1>
          <p className="subtext">{consts.REQUIRED_FIELDS_NOTE}</p>

          {generalSaveError && (
            <p className="generalError" role="alert">
              {generalSaveError}
            </p>
          )}

          <section className="section" ref={rabbiSectionRef}>
            <h2 className="sectionHeading">{consts.RABBI_SECTION_HEADING}</h2>
            <RabbiPicker rabbi={form.rabbi} onSelectRabbi={(rabbi) => setForm((prev) => ({ ...prev, rabbi }))} errorMessage={rabbiError} />
          </section>

          <section className="section">
            <h2 className="sectionHeading">{consts.DETAILS_SECTION_HEADING}</h2>
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
              <span className="label">{consts.PLACE_ADDRESS_LABEL}</span>
              <input
                type="text"
                dir="auto"
                value={form.placeAddress}
                onChange={(event) => setForm((prev) => ({ ...prev, placeAddress: event.target.value }))}
              />
              <span className="helper">{consts.PLACE_ADDRESS_HELPER}</span>
              {fieldErrors.placeAddress && <span className="error">{fieldErrors.placeAddress}</span>}
            </label>
          </section>

          <section className="section" ref={audienceSectionRef}>
            <h2 className="sectionHeading">{consts.AUDIENCE_SECTION_HEADING}</h2>
            <AudiencePicker
              audience={form.audience}
              onSelectAudience={(audience) => setForm((prev) => ({ ...prev, audience }))}
              errorMessage={fieldErrors.audience}
            />
            <p className="helper">{consts.AUDIENCE_HELPER}</p>
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

          <div className="footer">
            <Link className="cancel" to={ADMIN_ROUTES.lessons}>
              {consts.CANCEL_LABEL}
            </Link>
            <button type="button" className="saveAndAddAnother" disabled={saveLesson.isPending} onClick={() => submit('again')}>
              {consts.SAVE_AND_ADD_ANOTHER_LABEL}
            </button>
            <button type="submit" className="save" disabled={saveLesson.isPending}>
              {saveLesson.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
            </button>
          </div>
        </form>

        <aside className="preview">
          <LessonPreviewCard
            rabbi={form.rabbi}
            title={form.title}
            audience={form.audience}
            cityName={form.city?.name}
            weekdayLabel={previewWeekdayLabel(form)}
            startTime={form.startTime}
          />
        </aside>
      </div>
    </div>
  );
})`
  ${styles.LessonFormPage}
`;
