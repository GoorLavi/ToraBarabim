import { useEffect, useId, useRef } from 'react';
import type { RefObject } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

import { AudiencePicker } from '~/components/AudiencePicker/AudiencePicker';
import { GalleryField } from '~/components/GalleryField/GalleryField';
import { PhotoPicker } from '~/components/PhotoPicker/PhotoPicker';
import { PlacePicker } from '~/components/PlacePicker/PlacePicker';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { AUDIENCE_LABELS, COURSE_COVER_MIN_HEIGHT, COURSE_COVER_MIN_WIDTH, LESSON_TOPIC_LABELS } from '~/consts';
import { directionForValue } from '~/helpers';

import * as consts from './consts';
import type { CourseFormFieldsProps, CourseTopicFormValue } from './models';
import * as styles from './styles';

type TopicSelectValue = CourseTopicFormValue['kind'] | (typeof consts.TOPIC_OPTIONS)[number];

const topicSelectValue = (topic: CourseTopicFormValue): TopicSelectValue => (topic.kind === 'set' ? topic.value : topic.kind);

// The body both course forms share (design brief round 3, item 3: "one
// CourseFormFields, never a copy"): every field except the teacher, which
// only the admin form has, and the page chrome around it (heading,
// ownership note, footer, danger zone), which the two forms say
// differently. Owns its own "scroll to and focus the first failing
// section" behaviour, triggered by `fieldErrors` changing, so neither
// caller has to hold a section ref of its own.
export const CourseFormFields = styled(
  ({ className, form, onChangeForm, fieldErrors, isAudienceLocked, cityError, cover, gallery }: CourseFormFieldsProps) => {
    // One real id per field, unique even if this form ever rendered twice
    // on the same page, rather than the fixed strings a second instance
    // would collide on.
    const idPrefix = useId();
    const fieldId = (name: string): string => `${idPrefix}-${name}`;
    // `aria-describedby` reads every id a field has, its permanent helper
    // and, once one shows, its error too, rather than replacing the one
    // with the other: the helper stays useful context even while the
    // error is what a screen reader announces first.
    const describedBy = (...ids: (string | undefined)[]): string => ids.filter((id): id is string => id !== undefined).join(' ');

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

          <div className="row nameRow">
            <div className="field name">
              <label className="label" htmlFor={fieldId('name')}>
                {consts.NAME_LABEL}
              </label>
              <input
                id={fieldId('name')}
                type="text"
                className="input"
                dir={directionForValue(form.name)}
                value={form.name}
                onChange={(event) => onChangeForm((prev) => ({ ...prev, name: event.target.value }))}
                aria-describedby={fieldErrors.name ? fieldId('name-error') : undefined}
              />
              {fieldErrors.name && (
                <span className="error" id={fieldId('name-error')}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="field cycle">
              <label className="label" htmlFor={fieldId('cycle')}>
                {consts.CYCLE_LABEL}
              </label>
              <input
                id={fieldId('cycle')}
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.cycle}
                onChange={(event) => onChangeForm((prev) => ({ ...prev, cycle: event.target.value }))}
                aria-describedby={fieldId('cycle-hint')}
              />
              {fieldErrors.cycle ? (
                <span className="error" id={fieldId('cycle-hint')}>
                  {fieldErrors.cycle}
                </span>
              ) : (
                <span className="helper" id={fieldId('cycle-hint')}>
                  {consts.CYCLE_HELP}
                </span>
              )}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor={fieldId('description')}>
              {consts.DESCRIPTION_LABEL}
            </label>
            <textarea
              id={fieldId('description')}
              className="input description"
              dir={directionForValue(form.description)}
              value={form.description}
              onChange={(event) => onChangeForm((prev) => ({ ...prev, description: event.target.value }))}
              aria-describedby={describedBy(fieldId('description-help'), fieldErrors.description ? fieldId('description-error') : undefined)}
            />
            <span className="helper" id={fieldId('description-help')}>
              {consts.DESCRIPTION_HELP}
            </span>
            {fieldErrors.description && (
              <span className="error" id={fieldId('description-error')}>
                {fieldErrors.description}
              </span>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor={fieldId('topic')}>
              {consts.TOPIC_LABEL}
            </label>
            <select
              id={fieldId('topic')}
              className="input select"
              value={topicSelectValue(form.topic)}
              onChange={(event) => {
                const { value } = event.target;
                if (value === 'none') onChangeForm((prev) => ({ ...prev, topic: { kind: 'none' } }));
                else if (value === 'other') {
                  onChangeForm((prev) => ({ ...prev, topic: { kind: 'other', otherText: prev.topic.kind === 'other' ? prev.topic.otherText : '' } }));
                } else {
                  onChangeForm((prev) => ({ ...prev, topic: { kind: 'set', value: value as (typeof consts.TOPIC_OPTIONS)[number] } }));
                }
              }}
              aria-describedby={fieldId('topic-help')}
            >
              <option value="none">{consts.TOPIC_NONE_OPTION_LABEL}</option>
              {consts.TOPIC_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {LESSON_TOPIC_LABELS[value]}
                </option>
              ))}
              <option value="other">{consts.TOPIC_OTHER_OPTION_LABEL}</option>
            </select>
            <span className="helper" id={fieldId('topic-help')}>
              {consts.TOPIC_HELP}
            </span>
            {form.topic.kind === 'other' && (
              <div className="field">
                <label className="label" htmlFor={fieldId('topic-other')}>
                  {consts.TOPIC_OTHER_LABEL}
                </label>
                <input
                  id={fieldId('topic-other')}
                  type="text"
                  className="input"
                  dir={directionForValue(form.topic.otherText)}
                  value={form.topic.otherText}
                  onChange={(event) => onChangeForm((prev) => ({ ...prev, topic: { kind: 'other', otherText: event.target.value } }))}
                  aria-describedby={fieldErrors.topicOther ? fieldId('topic-other-error') : undefined}
                />
                {fieldErrors.topicOther && (
                  <span className="error" id={fieldId('topic-other-error')}>
                    {fieldErrors.topicOther}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="section" ref={scopeSectionRef}>
          <h2 className="sectionHeading">{consts.SCOPE_SECTION_HEADING}</h2>

          <div className="field">
            <label className="label" htmlFor={fieldId('opening-date')}>
              {consts.OPENING_DATE_LABEL}
            </label>
            <input
              id={fieldId('opening-date')}
              type="date"
              className="input"
              value={form.openingDate}
              onChange={(event) => onChangeForm((prev) => ({ ...prev, openingDate: event.target.value }))}
              aria-describedby={fieldErrors.openingDate ? fieldId('opening-date-error') : undefined}
            />
            {fieldErrors.openingDate && (
              <span className="error" id={fieldId('opening-date-error')}>
                {fieldErrors.openingDate}
              </span>
            )}
          </div>

          <div className="row scopeRow">
            <div className="field">
              <label className="label" htmlFor={fieldId('weeks')}>
                {consts.WEEKS_LABEL}
              </label>
              <input
                id={fieldId('weeks')}
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.weeks}
                onChange={(event) => onChangeForm((prev) => ({ ...prev, weeks: event.target.value }))}
                aria-describedby={fieldErrors.weeks ? fieldId('weeks-error') : undefined}
              />
              {fieldErrors.weeks && (
                <span className="error" id={fieldId('weeks-error')}>
                  {fieldErrors.weeks}
                </span>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor={fieldId('sessions')}>
                {consts.SESSIONS_LABEL}
              </label>
              <input
                id={fieldId('sessions')}
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.sessions}
                onChange={(event) => onChangeForm((prev) => ({ ...prev, sessions: event.target.value }))}
                aria-describedby={fieldErrors.sessions ? fieldId('sessions-error') : undefined}
              />
              {fieldErrors.sessions && (
                <span className="error" id={fieldId('sessions-error')}>
                  {fieldErrors.sessions}
                </span>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor={fieldId('hours')}>
                {consts.HOURS_LABEL}
              </label>
              <input
                id={fieldId('hours')}
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.hours}
                onChange={(event) => onChangeForm((prev) => ({ ...prev, hours: event.target.value }))}
                aria-describedby={fieldId('hours-hint')}
              />
              {fieldErrors.hours ? (
                <span className="error" id={fieldId('hours-hint')}>
                  {fieldErrors.hours}
                </span>
              ) : (
                <span className="helper" id={fieldId('hours-hint')}>
                  {consts.HOURS_HELP}
                </span>
              )}
            </div>
          </div>

          <div className="field">
            <span className="label">{consts.JOINABLE_AFTER_OPENING_LABEL}</span>
            <div className="pillToggle" role="radiogroup" aria-label={consts.JOINABLE_AFTER_OPENING_LABEL}>
              <button
                type="button"
                className={classNames('pill', { selected: !form.joinableAfterOpening })}
                role="radio"
                aria-checked={!form.joinableAfterOpening}
                onClick={() => onChangeForm((prev) => ({ ...prev, joinableAfterOpening: false }))}
              >
                {consts.JOINABLE_NO_LABEL}
              </button>
              <button
                type="button"
                className={classNames('pill', { selected: form.joinableAfterOpening })}
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
            {...{
              venue: form.venue,
              onChangeVenue: (venue) => onChangeForm((prev) => ({ ...prev, venue })),
              city: form.city,
              onSelectCity: (city) => onChangeForm((prev) => ({ ...prev, city })),
              cityError,
              nameError: fieldErrors.addressName,
              streetError: fieldErrors.street,
            }}
          />
        </section>

        <section className="section" ref={audienceSectionRef}>
          <h2 className="sectionHeading">{consts.AUDIENCE_SECTION_HEADING}</h2>
          {isAudienceLocked ? (
            <ReadOnlyField {...{ value: AUDIENCE_LABELS.women }} />
          ) : (
            <AudiencePicker
              {...{
                audience: form.audience,
                onSelectAudience: (audience) => onChangeForm((prev) => ({ ...prev, audience })),
                errorMessage: fieldErrors.audience,
              }}
            />
          )}
        </section>

        <section className="section" ref={photosSectionRef}>
          <h2 className="sectionHeading">{consts.PHOTOS_SECTION_HEADING}</h2>

          <div className="field">
            <span className="label">{consts.COVER_LABEL}</span>
            <PhotoPicker
              {...{
                aspectRatio: '3:4',
                minWidth: COURSE_COVER_MIN_WIDTH,
                minHeight: COURSE_COVER_MIN_HEIGHT,
                enforceFloor: true,
                cropHelpOverride: consts.COVER_CROP_HELP,
                missingPhotoNoteOverride: consts.COVER_MISSING_NOTE,
                hasPreviousPhotoOnFailure: cover.hasExistingPhoto,
                failureReasonOverride: cover.failureReason,
                previewUrl: cover.previewUrl,
                hasExistingPhoto: cover.hasExistingPhoto,
                errorMessage: fieldErrors.cover,
                uploadStatus: cover.uploadStatus,
                onRetryUpload: cover.onRetryUpload,
                onSelectFile: cover.onSelectFile,
              }}
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

          <div className="field">
            <label className="label" htmlFor={fieldId('contact-phone')}>
              {consts.CONTACT_PHONE_LABEL}
            </label>
            <input
              id={fieldId('contact-phone')}
              type="tel"
              className="input"
              dir="ltr"
              value={form.contactPhone}
              onChange={(event) => onChangeForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
              aria-describedby={describedBy(fieldId('contact-phone-help'), fieldErrors.contactPhone ? fieldId('contact-phone-error') : undefined)}
            />
            <span className="helper" id={fieldId('contact-phone-help')}>
              {consts.CONTACT_PHONE_HELP}
            </span>
            {fieldErrors.contactPhone && (
              <span className="error" id={fieldId('contact-phone-error')}>
                {fieldErrors.contactPhone}
              </span>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor={fieldId('price')}>
              {consts.PRICE_LABEL}
            </label>
            <div className="inputAffix">
              <input
                id={fieldId('price')}
                type="number"
                inputMode="numeric"
                min={1}
                className="input"
                value={form.priceShekels}
                onChange={(event) => onChangeForm((prev) => ({ ...prev, priceShekels: event.target.value }))}
                aria-describedby={describedBy(fieldId('price-help'), fieldErrors.priceShekels ? fieldId('price-error') : undefined)}
              />
              <span className="affix" aria-hidden="true">
                {consts.PRICE_CURRENCY_SYMBOL}
              </span>
            </div>
            <span className="helper" id={fieldId('price-help')}>
              {consts.PRICE_HELP}
            </span>
            {fieldErrors.priceShekels && (
              <span className="error" id={fieldId('price-error')}>
                {fieldErrors.priceShekels}
              </span>
            )}
          </div>
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
