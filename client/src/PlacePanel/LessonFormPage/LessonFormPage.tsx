import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import type { LessonTopic } from '@torabarabim/common';

import { AudiencePicker } from '~/components/AudiencePicker/AudiencePicker';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { RecurrenceFields } from '~/components/RecurrenceFields/RecurrenceFields';
import { AUDIENCE_LABELS } from '~/consts';
import { directionForValue } from '~/helpers';
import { PLACE_ROUTES } from '~/PlacePanel/consts';
import { placeErrorMessage } from '~/PlacePanel/helpers';
import { usePlaceProfile } from '~/PlacePanel/usePlaceProfile';

import { RabbiSelect } from './components/RabbiSelect/RabbiSelect';
import * as consts from './consts';
import { initialFormState, lessonToFormState, pageHeading, validateLessonForm } from './helpers';
import type { LessonFormErrors, LessonFormPageProps, LessonFormState } from './models';
import * as styles from './styles';
import { useExistingLesson } from './useExistingLesson';
import { useSaveLesson } from './useSaveLesson';

// No venue section at all (build brief): a lesson created here is at this
// place by definition, and the server supplies the venue from the session
// and refuses a payload that carries one. No live preview card and no
// delete affordance either: neither is in this slice (see the build
// report and, for delete, the build brief directly: create and edit only).
export const LessonFormPage = styled(({ className }: LessonFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profile = usePlaceProfile();
  const existing = useExistingLesson(id);
  const saveLesson = useSaveLesson();

  const [form, setForm] = useState<LessonFormState>(() => initialFormState());
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LessonFormErrors>({});

  const rabbiSectionRef = useRef<HTMLElement>(null);
  const whenSectionRef = useRef<HTMLElement>(null);
  const audienceSectionRef = useRef<HTMLElement>(null);
  const sectionRefsByHeading: Record<string, RefObject<HTMLElement | null>> = {
    [consts.WHO_SECTION_HEADING]: rabbiSectionRef,
    [consts.WHEN_SECTION_HEADING]: whenSectionRef,
    [consts.AUDIENCE_SECTION_HEADING]: audienceSectionRef,
  };

  useEffect(() => {
    if (existing.status === 'success' && !isLoadedFromExisting) {
      setForm((prev) => ({ ...prev, ...lessonToFormState(existing.lesson), rabbi: existing.rabbi ?? prev.rabbi }));
      setIsLoadedFromExisting(true);
    }
  }, [existing, isLoadedFromExisting]);

  // Keeps a freshly-resolved existing rabbi in the form once it lands,
  // even though the effect above already ran once with it still undefined
  // (`useExistingLesson`'s rabbi query resolves slightly after the lesson
  // itself).
  useEffect(() => {
    if (existing.status === 'success' && existing.rabbi && !form.rabbi) {
      setForm((prev) => ({ ...prev, rabbi: existing.rabbi }));
    }
  }, [existing, form.rabbi]);

  const isRabbaniteSelected = form.rabbi?.honorific === 'rabbanit';
  // A rabbanit may only teach women-only lessons: derived here rather than
  // synced into `form.audience` via an effect, which would render a frame
  // with the wrong value. Mirrors `RabbiPanel/LessonFormPage/LessonFormPage.tsx`'s
  // own `effectiveForm`.
  const effectiveForm: LessonFormState = isRabbaniteSelected ? { ...form, audience: 'women' } : form;

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
          <p className="message">{placeErrorMessage(existing.error, { 404: consts.LOAD_ERROR_MESSAGE })}</p>
          <button type="button" className="retry" onClick={existing.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const generalSaveError = saveLesson.isError ? placeErrorMessage(saveLesson.error) : undefined;
  const rabbiError = fieldErrors.rabbi;

  const failingSections = consts.SECTION_DEFS.filter((section) => section.fields.some((field) => fieldErrors[field]));

  const submit = (): void => {
    const errors = validateLessonForm(effectiveForm);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstFailingSection = consts.SECTION_DEFS.find((section) => section.fields.some((field) => errors[field]));
      const sectionElement = firstFailingSection && sectionRefsByHeading[firstFailingSection.heading]?.current;
      sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sectionElement?.querySelector<HTMLElement>('input, button, [tabindex]')?.focus();
      return;
    }

    saveLesson.mutate({ form: effectiveForm, existingLessonId: id }, { onSuccess: () => navigate(PLACE_ROUTES.lessons) });
  };

  const placeName = profile.data?.name;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={PLACE_ROUTES.lessons}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        noValidate
      >
        <h1 className="heading">{pageHeading(Boolean(id))}</h1>
        {placeName && <p className="subtext" dir="auto">{consts.ownershipNote(placeName)}</p>}

        {generalSaveError && (
          <p className="generalError" role="alert">
            {generalSaveError}
          </p>
        )}

        <section className="section" ref={rabbiSectionRef}>
          <h2 className="sectionHeading">{consts.WHO_SECTION_HEADING}</h2>
          <RabbiSelect rabbi={form.rabbi} onSelectRabbi={(rabbi) => setForm((prev) => ({ ...prev, rabbi }))} errorMessage={rabbiError} />
        </section>

        <section className="section">
          <label className="field">
            <span className="label">{consts.TITLE_LABEL}</span>
            <input
              type="text"
              dir={directionForValue(form.title)}
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
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

        <section className="section" ref={audienceSectionRef}>
          <h2 className="sectionHeading">{consts.AUDIENCE_SECTION_HEADING}</h2>
          {isRabbaniteSelected ? (
            <ReadOnlyField value={AUDIENCE_LABELS.women} />
          ) : (
            <AudiencePicker
              audience={form.audience}
              onSelectAudience={(audience) => setForm((prev) => ({ ...prev, audience }))}
              errorMessage={fieldErrors.audience}
            />
          )}
        </section>

        <section className="section">
          <label className="field">
            <span className="label">{consts.TOPIC_SECTION_HEADING}</span>
            <select
              value={form.topic}
              onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value as LessonTopic | '' }))}
            >
              <option value="">{consts.TOPIC_UNSET_OPTION_LABEL}</option>
              {consts.TOPIC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="section">
          <label className="field">
            <span className="label">{consts.NOTES_SECTION_HEADING}</span>
            <textarea
              dir={directionForValue(form.notes)}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
            <span className="helper">{consts.NOTES_HELPER}</span>
          </label>
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
          <Link className="cancel" to={PLACE_ROUTES.lessons}>
            {consts.CANCEL_LABEL}
          </Link>
        </div>
      </form>
    </div>
  );
})`
  ${styles.LessonFormPage}
`;
