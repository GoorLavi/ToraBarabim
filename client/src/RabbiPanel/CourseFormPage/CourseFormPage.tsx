import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { AudiencePicker } from '~/components/AudiencePicker/AudiencePicker';
import { GalleryField } from '~/components/GalleryField/GalleryField';
import { PhotoPicker } from '~/components/PhotoPicker/PhotoPicker';
import * as placePickerConsts from '~/components/PlacePicker/consts';
import { PlacePicker } from '~/components/PlacePicker/PlacePicker';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { AUDIENCE_LABELS, LESSON_TOPIC_LABELS } from '~/consts';
import { directionForValue, rabbiDisplayName } from '~/helpers';
import { usePhotoPreviewUrl } from '~/hooks/usePhotoPreviewUrl';
import { RabbiApiError } from '~/RabbiPanel/api';
import { RABBI_ROUTES } from '~/RabbiPanel/consts';
import { rabbiErrorMessage } from '~/RabbiPanel/helpers';
import { useRabbiProfile } from '~/RabbiPanel/useRabbiProfile';

import { CloseCourseSheet } from './components/CloseCourseSheet/CloseCourseSheet';
import { DeleteCourseSheet } from './components/DeleteCourseSheet/DeleteCourseSheet';
import { DuplicateCourseSheet } from './components/DuplicateCourseSheet/DuplicateCourseSheet';
import { MarkCourseFullSheet } from './components/MarkCourseFullSheet/MarkCourseFullSheet';
import { ReadOnlyCourseRecord } from './components/ReadOnlyCourseRecord/ReadOnlyCourseRecord';
import * as consts from './consts';
import { courseToFormState, initialFormState, pageHeading, validateCourseForm } from './helpers';
import type { CourseFormErrors, CourseFormPageProps, CourseFormState } from './models';
import * as styles from './styles';
import { useCourseCoverUpload } from './useCourseCoverUpload';
import { useCourseGalleryPhotos } from './useCourseGalleryPhotos';
import { useExistingCourse } from './useExistingCourse';
import { useSaveCourse } from './useSaveCourse';

type OpenSheet = 'close' | 'full' | 'delete' | 'duplicate' | undefined;

export const CourseFormPage = styled(({ className }: CourseFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profile = useRabbiProfile();
  const existing = useExistingCourse(id);
  const saveCourse = useSaveCourse();
  const coverUpload = useCourseCoverUpload(id ?? '');
  const gallery = useCourseGalleryPhotos(id ?? '', existing.status === 'success' ? existing.course.photos : []);

  const [form, setForm] = useState<CourseFormState>(() => initialFormState());
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CourseFormErrors>({});
  const [openSheet, setOpenSheet] = useState<OpenSheet>(undefined);

  // Called unconditionally, ahead of every early return below (rules of
  // hooks): only its result is conditional, chosen against `coverUpload`'s
  // own preview further down, once `id` is known.
  const newCoverPreviewUrl = usePhotoPreviewUrl(form.cover);

  const aboutSectionRef = useRef<HTMLElement>(null);
  const scopeSectionRef = useRef<HTMLElement>(null);
  const whereSectionRef = useRef<HTMLElement>(null);
  const audienceSectionRef = useRef<HTMLElement>(null);
  const photosSectionRef = useRef<HTMLElement>(null);
  const registrationSectionRef = useRef<HTMLElement>(null);
  const sectionRefsByHeading: Record<string, RefObject<HTMLElement | null>> = {
    [consts.ABOUT_SECTION_HEADING]: aboutSectionRef,
    [consts.SCOPE_SECTION_HEADING]: scopeSectionRef,
    [consts.WHERE_SECTION_HEADING]: whereSectionRef,
    [consts.AUDIENCE_SECTION_HEADING]: audienceSectionRef,
    [consts.PHOTOS_SECTION_HEADING]: photosSectionRef,
    [consts.REGISTRATION_SECTION_HEADING]: registrationSectionRef,
  };

  useEffect(() => {
    if (existing.status === 'success' && !isLoadedFromExisting) {
      setForm(courseToFormState(existing.course));
      setIsLoadedFromExisting(true);
    }
  }, [existing, isLoadedFromExisting]);

  const isRabbaniteProfile = profile.data?.honorific === 'rabbanit';
  const effectiveForm: CourseFormState = isRabbaniteProfile ? { ...form, audience: 'women' } : form;

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

  const rabbiName = profile.data && rabbiDisplayName(profile.data);
  const courseNameForSheets = existing.status === 'success' ? existing.course.name : form.name || consts.NEW_HEADING;

  // The read-only record, once a course's registration is closed or it was
  // marked full: the same route both render (RabbiPanel.tsx), split here
  // rather than by a second component the router picks between, since both
  // need the same loaded course.
  if (existing.status === 'success' && existing.course.lifecycle.status === 'closed') {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={RABBI_ROUTES.courses}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>
        <ReadOnlyCourseRecord
          {...{
            course: existing.course,
            onOpenDuplicate: () => setOpenSheet('duplicate'),
            onOpenDelete: () => setOpenSheet('delete'),
          }}
        />
        {openSheet === 'duplicate' && (
          <DuplicateCourseSheet
            {...{
              courseId: existing.course.id,
              courseName: existing.course.name,
              onDismiss: () => setOpenSheet(undefined),
              onDuplicated: (course) => navigate(RABBI_ROUTES.courseEdit(course.id)),
            }}
          />
        )}
        {openSheet === 'delete' && (
          <DeleteCourseSheet
            {...{
              courseId: existing.course.id,
              courseName: existing.course.name,
              onDismiss: () => setOpenSheet(undefined),
              onDeleted: () => navigate(RABBI_ROUTES.courses),
            }}
          />
        )}
      </div>
    );
  }

  const saveErrorCode = saveCourse.error instanceof RabbiApiError ? saveCourse.error.code : undefined;
  const generalSaveError = saveCourse.isError && saveErrorCode !== 'unknown_city' ? rabbiErrorMessage(saveCourse.error) : undefined;
  const cityError = fieldErrors.city ?? (saveErrorCode === 'unknown_city' ? placePickerConsts.UNKNOWN_CITY_ERROR : undefined);

  const failingSections = consts.SECTION_DEFS.filter((section) => section.fields.some((field) => fieldErrors[field]));

  const submit = (): void => {
    const errors = validateCourseForm(effectiveForm, !id);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstFailingSection = consts.SECTION_DEFS.find((section) => section.fields.some((field) => errors[field]));
      const sectionElement = firstFailingSection && sectionRefsByHeading[firstFailingSection.heading]?.current;
      sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sectionElement?.querySelector<HTMLElement>('input, button, textarea, [tabindex]')?.focus();
      return;
    }

    saveCourse.mutate({ form: effectiveForm, existingCourseId: id }, { onSuccess: () => navigate(RABBI_ROUTES.courses) });
  };

  // After the early returns above, `id` set implies `existing.status ===
  // 'success'`: the pending and error states already returned, and the
  // closed-record branch already returned too.
  const existingCoverUrl = existing.status === 'success' ? existing.course.coverUrl : undefined;
  const coverPreviewUrl = id ? (coverUpload.previewUrl ?? existingCoverUrl) : newCoverPreviewUrl;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={RABBI_ROUTES.courses}>
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
        {rabbiName && <p className="subtext">{consts.ownershipNote(rabbiName)}</p>}

        {generalSaveError && (
          <p className="generalError" role="alert">
            {generalSaveError}
          </p>
        )}

        <section className="section" ref={aboutSectionRef}>
          <h2 className="sectionHeading">{consts.ABOUT_SECTION_HEADING}</h2>

          <label className="field">
            <span className="label">{consts.NAME_LABEL}</span>
            <input
              type="text"
              className="input"
              dir={directionForValue(form.name)}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
          </label>

          <label className="field">
            <span className="label">{consts.DESCRIPTION_LABEL}</span>
            <textarea
              className="input"
              dir={directionForValue(form.description)}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}
          </label>

          <div className="field">
            <span className="label">{consts.TOPIC_LABEL}</span>
            <div className="topicChips">
              {consts.TOPIC_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={form.topic.kind === 'set' && form.topic.value === value ? 'chip selected' : 'chip'}
                  onClick={() => setForm((prev) => ({ ...prev, topic: { kind: 'set', value } }))}
                >
                  {LESSON_TOPIC_LABELS[value]}
                </button>
              ))}
              <button
                type="button"
                className={form.topic.kind === 'other' ? 'chip selected' : 'chip'}
                onClick={() => setForm((prev) => ({ ...prev, topic: { kind: 'other', otherText: prev.topic.kind === 'other' ? prev.topic.otherText : '' } }))}
              >
                {consts.TOPIC_OTHER_OPTION_LABEL}
              </button>
            </div>
            {form.topic.kind === 'other' && (
              <label className="field">
                <span className="label">{consts.TOPIC_OTHER_LABEL}</span>
                <input
                  type="text"
                  className="input"
                  dir={directionForValue(form.topic.otherText)}
                  value={form.topic.otherText}
                  onChange={(event) => setForm((prev) => ({ ...prev, topic: { kind: 'other', otherText: event.target.value } }))}
                />
                {fieldErrors.topicOther && <span className="error">{fieldErrors.topicOther}</span>}
              </label>
            )}
          </div>

          <label className="field">
            <span className="label">{consts.CYCLE_LABEL}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              className="input"
              value={form.cycle}
              onChange={(event) => setForm((prev) => ({ ...prev, cycle: event.target.value }))}
            />
            {fieldErrors.cycle && <span className="error">{fieldErrors.cycle}</span>}
          </label>
        </section>

        <section className="section" ref={scopeSectionRef}>
          <h2 className="sectionHeading">{consts.SCOPE_SECTION_HEADING}</h2>

          <label className="field">
            <span className="label">{consts.OPENING_DATE_LABEL}</span>
            <input
              type="date"
              className="input"
              value={form.openingDate}
              onChange={(event) => setForm((prev) => ({ ...prev, openingDate: event.target.value }))}
            />
            {fieldErrors.openingDate && <span className="error">{fieldErrors.openingDate}</span>}
          </label>

          <div className="row">
            <label className="field">
              <span className="label">{consts.WEEKS_LABEL}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.weeks}
                onChange={(event) => setForm((prev) => ({ ...prev, weeks: event.target.value }))}
              />
              {fieldErrors.weeks && <span className="error">{fieldErrors.weeks}</span>}
            </label>

            <label className="field">
              <span className="label">{consts.SESSIONS_LABEL}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.sessions}
                onChange={(event) => setForm((prev) => ({ ...prev, sessions: event.target.value }))}
              />
              {fieldErrors.sessions && <span className="error">{fieldErrors.sessions}</span>}
            </label>

            <label className="field">
              <span className="label">{consts.HOURS_LABEL}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.hours}
                onChange={(event) => setForm((prev) => ({ ...prev, hours: event.target.value }))}
              />
              {fieldErrors.hours && <span className="error">{fieldErrors.hours}</span>}
            </label>
          </div>

          <label className="checkboxField">
            <input
              type="checkbox"
              className="checkbox"
              checked={form.joinableAfterOpening}
              onChange={(event) => setForm((prev) => ({ ...prev, joinableAfterOpening: event.target.checked }))}
            />
            <span className="label">{consts.JOINABLE_AFTER_OPENING_LABEL}</span>
          </label>
        </section>

        <section className="section" ref={whereSectionRef}>
          <h2 className="sectionHeading">{consts.WHERE_SECTION_HEADING}</h2>
          <PlacePicker
            venue={form.venue}
            onChangeVenue={(venue) => setForm((prev) => ({ ...prev, venue }))}
            city={form.city}
            onSelectCity={(city) => setForm((prev) => ({ ...prev, city }))}
            cityError={cityError}
            nameError={fieldErrors.addressName}
            streetError={fieldErrors.street}
          />
        </section>

        <section className="section" ref={audienceSectionRef}>
          <h2 className="sectionHeading">{consts.AUDIENCE_SECTION_HEADING}</h2>
          {isRabbaniteProfile ? (
            <ReadOnlyField value={AUDIENCE_LABELS.women} />
          ) : (
            <AudiencePicker
              audience={form.audience}
              onSelectAudience={(audience) => setForm((prev) => ({ ...prev, audience }))}
              errorMessage={fieldErrors.audience}
            />
          )}
        </section>

        <section className="section" ref={photosSectionRef}>
          <h2 className="sectionHeading">{consts.PHOTOS_SECTION_HEADING}</h2>

          <div className="field">
            <span className="label">{consts.COVER_LABEL}</span>
            <PhotoPicker
              aspectRatio="3:4"
              minWidth={consts.COVER_MIN_WIDTH}
              minHeight={consts.COVER_MIN_HEIGHT}
              previewUrl={coverPreviewUrl}
              hasExistingPhoto={Boolean(id)}
              errorMessage={fieldErrors.cover}
              uploadStatus={id ? coverUpload.status : undefined}
              onRetryUpload={coverUpload.retry}
              onSelectFile={(file) => (id ? coverUpload.upload(file) : setForm((prev) => ({ ...prev, cover: file })))}
            />
          </div>

          {id ? (
            <GalleryField {...{ photos: gallery.photos, onAddFiles: gallery.addFiles, onRetry: gallery.retry, onRemove: gallery.remove }} />
          ) : (
            <p className="helper">{consts.GALLERY_AFTER_FIRST_SAVE_NOTE}</p>
          )}
        </section>

        <section className="section" ref={registrationSectionRef}>
          <h2 className="sectionHeading">{consts.REGISTRATION_SECTION_HEADING}</h2>

          <label className="field">
            <span className="label">{consts.CONTACT_PHONE_LABEL}</span>
            <input
              type="tel"
              className="input"
              value={form.contactPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
            />
            {fieldErrors.contactPhone && <span className="error">{fieldErrors.contactPhone}</span>}
          </label>

          <label className="field">
            <span className="label">{consts.PRICE_LABEL}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              className="input"
              value={form.priceShekels}
              onChange={(event) => setForm((prev) => ({ ...prev, priceShekels: event.target.value }))}
            />
            {fieldErrors.priceShekels && <span className="error">{fieldErrors.priceShekels}</span>}
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
          <button type="submit" className="save" disabled={saveCourse.isPending}>
            {saveCourse.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
          </button>
          <Link className="cancel" to={RABBI_ROUTES.courses}>
            {consts.CANCEL_LABEL}
          </Link>
        </div>

        {id && (
          <div className="dangerZone">
            <span className="heading">{consts.DANGER_ZONE_HEADING}</span>
            <button type="button" className="action" onClick={() => setOpenSheet('full')}>
              {consts.MARK_FULL_LABEL}
            </button>
            <button type="button" className="action" onClick={() => setOpenSheet('close')}>
              {consts.CLOSE_REGISTRATION_LABEL}
            </button>
            <button type="button" className="action delete" onClick={() => setOpenSheet('delete')}>
              {consts.DELETE_LABEL}
            </button>
          </div>
        )}
      </form>

      {id && openSheet === 'close' && (
        <CloseCourseSheet
          {...{ courseId: id, courseName: courseNameForSheets, onDismiss: () => setOpenSheet(undefined), onClosed: () => setOpenSheet(undefined) }}
        />
      )}
      {id && openSheet === 'full' && (
        <MarkCourseFullSheet
          {...{ courseId: id, courseName: courseNameForSheets, onDismiss: () => setOpenSheet(undefined), onMarkedFull: () => setOpenSheet(undefined) }}
        />
      )}
      {id && openSheet === 'delete' && (
        <DeleteCourseSheet
          {...{ courseId: id, courseName: courseNameForSheets, onDismiss: () => setOpenSheet(undefined), onDeleted: () => navigate(RABBI_ROUTES.courses) }}
        />
      )}
    </div>
  );
})`
  ${styles.CourseFormPage}
`;
