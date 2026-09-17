import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { LessonPreviewCard } from '~/AdminPanel/components/LessonPreviewCard/LessonPreviewCard';
import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage, lessonPrimaryLabel, recurrenceWhenLabel } from '~/AdminPanel/helpers';
import { useExistingLesson } from '~/AdminPanel/useExistingLesson';
import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import { AUDIENCE_LABELS } from '~/consts';
import { rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import { weekdayLabelForPreview } from './helpers';
import type { LessonViewPageProps } from './models';
import * as styles from './styles';

const SKELETON_FIELD_COUNT = 8;

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
        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonHeader">
            <div className="skeletonPoster" />
            <div className="skeletonLines">
              <div className="skeletonLine wide" />
              <div className="skeletonLine short" />
            </div>
          </div>
          <div className="skeletonFieldsGrid">
            {consts.skeletonFieldKeys(SKELETON_FIELD_COUNT).map((key) => (
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
            {rabbi?.photoUrl && !hasPhotoLoadFailed ? (
              <img className="poster" src={rabbi.photoUrl} alt="" onError={() => setHasPhotoLoadFailed(true)} />
            ) : (
              <div className="poster placeholder" aria-hidden="true" />
            )}

            <div className="identity">
              <div className="titleRow">
                <h1 className="heading" dir="auto">
                  {lessonPrimaryLabel(lesson, rabbi)}
                </h1>
                <Link className="editButton" to={ADMIN_ROUTES.lessonEdit(lesson.id)}>
                  {consts.EDIT_LABEL}
                </Link>
              </div>

              {rabbi ? (
                <Link className="rabbiLink" to={ADMIN_ROUTES.rabbiView(rabbi.id)} dir="auto">
                  {rabbiDisplayName(rabbi)}
                </Link>
              ) : (
                <span className="rabbiUnknown">{consts.RABBI_UNKNOWN_LABEL}</span>
              )}
            </div>
          </header>

          <div className="fieldsGrid">
            <ReadOnlyField className="wide" label={consts.TITLE_LABEL} value={lesson.title ?? consts.TITLE_EMPTY_VALUE} />

            <ReadOnlyField
              label={consts.RECURRENCE_KIND_LABEL}
              value={lesson.recurrence.kind === 'weekly' ? consts.RECURRING_VALUE : consts.ONE_TIME_VALUE}
            />
            <ReadOnlyField label={consts.WHEN_LABEL} value={recurrenceWhenLabel(lesson)} />

            <ReadOnlyField label={consts.START_TIME_LABEL} value={lesson.startTime} valueDir="ltr" />
            <ReadOnlyField label={consts.DURATION_LABEL} value={consts.durationValue(lesson.durationMinutes)} />

            <ReadOnlyField label={consts.CITY_LABEL} value={lesson.place.cityName} />
            <ReadOnlyField label={consts.PLACE_NAME_LABEL} value={lesson.place.name} />
            <ReadOnlyField className="wide" label={consts.STREET_LABEL} value={lesson.place.street} />
            {lesson.place.floor && <ReadOnlyField label={consts.FLOOR_LABEL} value={lesson.place.floor} />}

            <ReadOnlyField label={consts.AUDIENCE_LABEL} value={AUDIENCE_LABELS[lesson.audience]} />
          </div>
        </div>

        <aside className="preview">
          <LessonPreviewCard
            rabbi={rabbi}
            title={lesson.title ?? ''}
            audience={lesson.audience}
            cityName={lesson.place.cityName}
            weekdayLabel={weekdayLabelForPreview(lesson)}
            startTime={lesson.startTime}
          />
        </aside>
      </div>
    </div>
  );
})`
  ${styles.LessonViewPage}
`;
