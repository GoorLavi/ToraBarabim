import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { LessonPreviewCard } from '~/AdminPanel/components/LessonPreviewCard/LessonPreviewCard';
import { RecordField } from '~/AdminPanel/components/RecordField/RecordField';
import { ADMIN_ROUTES, skeletonFieldKeys } from '~/AdminPanel/consts';
import { adminErrorMessage, lessonPrimaryLabel, recurrenceWhenLabel } from '~/AdminPanel/helpers';
import { useExistingLesson } from '~/AdminPanel/useExistingLesson';
import { AUDIENCE_LABELS, RABBI_HONORIFIC_LABELS } from '~/consts';
import { rabbiDisplayName } from '~/helpers';

import { OccurrencesSection } from './components/OccurrencesSection/OccurrencesSection';
import * as consts from './consts';
import { weekdayLabelForPreview } from './helpers';
import type { LessonViewPageProps } from './models';
import * as styles from './styles';

// The route-provided `id` is always present for this screen (AdminPanel.tsx
// mounts it only at `/admin/lessons/:id`); the `| undefined` in the type is
// react-router's, not a real runtime case, and `useExistingLesson` already
// degrades to its 'idle' status if it were ever missing.
export const LessonViewPage = styled(({ className }: LessonViewPageProps) => {
  const { id } = useParams<{ id: string }>();
  const existing = useExistingLesson(id);
  const [hasPhotoLoadFailed, setHasPhotoLoadFailed] = useState(false);

  if (existing.status === 'error') {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.lessons}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>

        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(existing.error)}</p>
          <button type="button" className="retry" onClick={existing.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  if (existing.status !== 'success') {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.lessons}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>

        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonHeader">
            <div className="skeletonPoster" />
            <div className="skeletonLines">
              <div className="skeletonLine wide" />
              <div className="skeletonLine short" />
            </div>
          </div>
          <div className="skeletonFieldsGrid">
            {skeletonFieldKeys(consts.SKELETON_FIELD_COUNT).map((key) => (
              <div key={key} className="skeletonField" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { lesson, rabbi } = existing.data;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.lessons}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="layout">
        <div className="main">
          <header className="header">
            <div className="titleRow">
              {rabbi?.photoUrl && !hasPhotoLoadFailed ? (
                <img className="poster" src={rabbi.photoUrl} alt="" onError={() => setHasPhotoLoadFailed(true)} />
              ) : (
                <div className="poster placeholder" aria-hidden="true" />
              )}

              <div className="identity">
                <h1 className="heading" dir="auto">
                  {lessonPrimaryLabel(lesson, rabbi)}
                </h1>

                {rabbi ? (
                  <Link className="rabbiLink" to={ADMIN_ROUTES.rabbiView(rabbi.id)} dir="auto">
                    {rabbiDisplayName(rabbi)}
                  </Link>
                ) : (
                  <span className="rabbiUnknown">{consts.RABBI_UNKNOWN_LABEL}</span>
                )}
              </div>
            </div>

            <Link className="editButton" to={ADMIN_ROUTES.lessonEdit(lesson.id)}>
              {consts.EDIT_LABEL}
            </Link>
          </header>

          <div className="fieldsGrid">
            <RecordField
              className="wide"
              label={consts.TITLE_LABEL}
              isEmpty={!lesson.title}
              value={
                lesson.title ??
                (rabbi ? consts.titleEmptyValue(RABBI_HONORIFIC_LABELS[rabbi.honorific]) : consts.TITLE_EMPTY_VALUE_UNKNOWN_RABBI)
              }
            />

            <RecordField
              label={consts.RECURRENCE_KIND_LABEL}
              value={lesson.recurrence.kind === 'weekly' ? consts.RECURRING_VALUE : consts.ONE_TIME_VALUE}
            />
            <RecordField label={consts.WHEN_LABEL} value={recurrenceWhenLabel(lesson)} />

            <RecordField label={consts.START_TIME_LABEL} value={lesson.startTime} />
            <RecordField label={consts.DURATION_LABEL} value={consts.durationValue(lesson.durationMinutes)} />

            <RecordField label={consts.CITY_LABEL} value={lesson.place.cityName} />
            <RecordField label={consts.PLACE_NAME_LABEL} value={lesson.place.name} />
            <RecordField className="wide" label={consts.STREET_LABEL} value={lesson.place.street} />
            {lesson.place.floor && <RecordField label={consts.FLOOR_LABEL} value={lesson.place.floor} />}

            <RecordField label={consts.AUDIENCE_LABEL} value={AUDIENCE_LABELS[lesson.audience]} />
          </div>

          <OccurrencesSection className="occurrences" lessonId={lesson.id} lesson={lesson} />
        </div>

        <aside className="preview">
          <LessonPreviewCard
            {...{
              rabbi,
              title: lesson.title ?? '',
              audience: lesson.audience,
              cityName: lesson.place.cityName,
              weekdayLabel: weekdayLabelForPreview(lesson),
              startTime: lesson.startTime,
            }}
          />
        </aside>
      </div>
    </div>
  );
})`
  ${styles.LessonViewPage}
`;
