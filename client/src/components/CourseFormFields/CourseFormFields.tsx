import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import styled from 'styled-components';

import { AudiencePicker } from '~/components/AudiencePicker/AudiencePicker';
import { GalleryField } from '~/components/GalleryField/GalleryField';
import { PhotoPicker } from '~/components/PhotoPicker/PhotoPicker';
import { RABBI_PHOTO_MIN_HEIGHT, RABBI_PHOTO_MIN_WIDTH } from '~/components/PhotoPicker/consts';
import { PlacePicker } from '~/components/PlacePicker/PlacePicker';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { AUDIENCE_LABELS, LESSON_TOPIC_LABELS } from '~/consts';
import { directionForValue } from '~/helpers';

import * as consts from './consts';
import type { CourseFormFieldsProps } from './models';
import * as styles from './styles';

// The body both course forms share (design brief round 3, item 3: "one
// CourseFormFields, never a copy"): every field except the teacher, which
// only the admin form has, and the page chrome around it (heading,
// ownership note, footer, danger zone), which the two forms say
// differently. Owns its own "scroll to and focus the first failing
// section" behaviour, triggered by `fieldErrors` changing, so neither
// caller has to hold a section ref of its own.
export const CourseFormFields = styled(
  ({ className, form, onChangeForm, fieldErrors, isAudienceLocked, cityError, cover, gallery }: CourseFormFieldsProps) => {
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
      if (Object.keys(fieldErrors).length === 0) return;
      const firstFailingSection = consts.SECTION_DEFS.find((section) => section.fields.some((field) => fieldErrors[field]));
      const sectionElement = firstFailingSection && sectionRefsByHeading[firstFailingSection.heading]?.current;
      sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sectionElement?.querySelector<HTMLElement>('input, button, textarea, [tabindex]')?.focus();
      // Only when `fieldErrors` itself changes (a fresh submit attempt):
      // re-running this on every render would fight the very focus it just
      // set, and `sectionRefsByHeading` is rebuilt fresh each render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldErrors]);

    const failingSections = consts.SECTION_DEFS.filter((section) => section.fields.some((field) => fieldErrors[field]));

    return (
      <div className={className}>
        <section className="section" ref={aboutSectionRef}>
          <h2 className="sectionHeading">{consts.ABOUT_SECTION_HEADING}</h2>

          <label className="field">
            <span className="label">{consts.NAME_LABEL}</span>
            <input
              type="text"
              className="input"
              dir={directionForValue(form.name)}
              value={form.name}
              onChange={(event) => onChangeForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
          </label>

          <label className="field">
            <span className="label">{consts.DESCRIPTION_LABEL}</span>
            <textarea
              className="input"
              dir={directionForValue(form.description)}
              value={form.description}
              onChange={(event) => onChangeForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <span className="helper">{consts.DESCRIPTION_HELP}</span>
            {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}
          </label>

          <div className="field">
            <span className="label">{consts.TOPIC_LABEL}</span>
            <div className="topicChips">
              <button
                type="button"
                className={form.topic.kind === 'none' ? 'chip selected' : 'chip'}
                onClick={() => onChangeForm((prev) => ({ ...prev, topic: { kind: 'none' } }))}
              >
                {consts.TOPIC_NONE_OPTION_LABEL}
              </button>
              {consts.TOPIC_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={form.topic.kind === 'set' && form.topic.value === value ? 'chip selected' : 'chip'}
                  onClick={() => onChangeForm((prev) => ({ ...prev, topic: { kind: 'set', value } }))}
                >
                  {LESSON_TOPIC_LABELS[value]}
                </button>
              ))}
              <button
                type="button"
                className={form.topic.kind === 'other' ? 'chip selected' : 'chip'}
                onClick={() =>
                  onChangeForm((prev) => ({ ...prev, topic: { kind: 'other', otherText: prev.topic.kind === 'other' ? prev.topic.otherText : '' } }))
                }
              >
                {consts.TOPIC_OTHER_OPTION_LABEL}
              </button>
            </div>
            <span className="helper">{consts.TOPIC_HELP}</span>
            {form.topic.kind === 'other' && (
              <label className="field">
                <span className="label">{consts.TOPIC_OTHER_LABEL}</span>
                <input
                  type="text"
                  className="input"
                  dir={directionForValue(form.topic.otherText)}
                  value={form.topic.otherText}
                  onChange={(event) => onChangeForm((prev) => ({ ...prev, topic: { kind: 'other', otherText: event.target.value } }))}
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
              onChange={(event) => onChangeForm((prev) => ({ ...prev, cycle: event.target.value }))}
            />
            <span className="helper">{consts.CYCLE_HELP}</span>
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
              onChange={(event) => onChangeForm((prev) => ({ ...prev, openingDate: event.target.value }))}
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
                onChange={(event) => onChangeForm((prev) => ({ ...prev, weeks: event.target.value }))}
              />
              <span className="helper">{consts.WEEKS_HELP}</span>
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
                onChange={(event) => onChangeForm((prev) => ({ ...prev, sessions: event.target.value }))}
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
                onChange={(event) => onChangeForm((prev) => ({ ...prev, hours: event.target.value }))}
              />
              <span className="helper">{consts.HOURS_HELP}</span>
            </label>
          </div>

          <div className="field">
            <span className="label">{consts.JOINABLE_AFTER_OPENING_LABEL}</span>
            <div className="pillToggle" role="radiogroup" aria-label={consts.JOINABLE_AFTER_OPENING_LABEL}>
              <button
                type="button"
                className={!form.joinableAfterOpening ? 'pill selected' : 'pill'}
                role="radio"
                aria-checked={!form.joinableAfterOpening}
                onClick={() => onChangeForm((prev) => ({ ...prev, joinableAfterOpening: false }))}
              >
                {consts.JOINABLE_NO_LABEL}
              </button>
              <button
                type="button"
                className={form.joinableAfterOpening ? 'pill selected' : 'pill'}
                role="radio"
                aria-checked={form.joinableAfterOpening}
                onClick={() => onChangeForm((prev) => ({ ...prev, joinableAfterOpening: true }))}
              >
                {consts.JOINABLE_YES_LABEL}
              </button>
            </div>
            <span className="helper">{consts.JOINABLE_AFTER_OPENING_HELP}</span>
          </div>
        </section>

        <section className="section" ref={whereSectionRef}>
          <h2 className="sectionHeading">{consts.WHERE_SECTION_HEADING}</h2>
          <PlacePicker
            venue={form.venue}
            onChangeVenue={(venue) => onChangeForm((prev) => ({ ...prev, venue }))}
            city={form.city}
            onSelectCity={(city) => onChangeForm((prev) => ({ ...prev, city }))}
            cityError={cityError}
            nameError={fieldErrors.addressName}
            streetError={fieldErrors.street}
          />
        </section>

        <section className="section" ref={audienceSectionRef}>
          <h2 className="sectionHeading">{consts.AUDIENCE_SECTION_HEADING}</h2>
          {isAudienceLocked ? (
            <ReadOnlyField value={AUDIENCE_LABELS.women} />
          ) : (
            <AudiencePicker
              audience={form.audience}
              onSelectAudience={(audience) => onChangeForm((prev) => ({ ...prev, audience }))}
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
              minWidth={RABBI_PHOTO_MIN_WIDTH}
              minHeight={RABBI_PHOTO_MIN_HEIGHT}
              cropHelpOverride={consts.COVER_CROP_HELP}
              previewUrl={cover.previewUrl}
              hasExistingPhoto={cover.hasExistingPhoto}
              errorMessage={fieldErrors.cover}
              uploadStatus={cover.uploadStatus}
              onRetryUpload={cover.onRetryUpload}
              onSelectFile={cover.onSelectFile}
            />
          </div>

          <div className="field">
            <span className="label">{consts.GALLERY_FIELD_LABEL}</span>
            <GalleryField {...{ photos: gallery.photos, onAddFiles: gallery.onAddFiles, onRetry: gallery.onRetry, onRemove: gallery.onRemove }} />
            <span className="helper">{consts.GALLERY_FIELD_HELP}</span>
          </div>
        </section>

        <section className="section" ref={registrationSectionRef}>
          <h2 className="sectionHeading">{consts.REGISTRATION_SECTION_HEADING}</h2>

          <label className="field">
            <span className="label">{consts.CONTACT_PHONE_LABEL}</span>
            <input
              type="tel"
              className="input"
              value={form.contactPhone}
              onChange={(event) => onChangeForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
            />
            <span className="helper">{consts.CONTACT_PHONE_HELP}</span>
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
              onChange={(event) => onChangeForm((prev) => ({ ...prev, priceShekels: event.target.value }))}
            />
            <span className="helper">{consts.PRICE_HELP}</span>
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
      </div>
    );
  },
)`
  ${styles.CourseFormFields}
`;
