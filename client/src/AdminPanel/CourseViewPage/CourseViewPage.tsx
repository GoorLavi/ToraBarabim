import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, skeletonFieldKeys } from '~/AdminPanel/consts';
import { RecordField } from '~/AdminPanel/components/RecordField/RecordField';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useExistingCourse } from '~/AdminPanel/useExistingCourse';
import { cycleLabel } from '~/CoursePage/consts';
import { PhotoViewer } from '~/components/PhotoViewer/PhotoViewer';
import { AUDIENCE_LABELS } from '~/consts';
import { addressLine, coursePath, courseStillListed, courseTopicLabel, rabbiDisplayName, venuePanelCityName } from '~/helpers';

import { CloseCourseSheet } from './components/CloseCourseSheet/CloseCourseSheet';
import { CoursePreviewCard } from './components/CoursePreviewCard/CoursePreviewCard';
import { DeleteCourseSheet } from './components/DeleteCourseSheet/DeleteCourseSheet';
import { DuplicateCourseSheet } from './components/DuplicateCourseSheet/DuplicateCourseSheet';
import { MarkCourseFullSheet } from './components/MarkCourseFullSheet/MarkCourseFullSheet';
import * as consts from './consts';
import type { CourseViewPageProps } from './models';
import * as styles from './styles';

type OpenSheet = 'close' | 'full' | 'delete' | 'duplicate' | undefined;

export const CourseViewPage = styled(({ className }: CourseViewPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const existing = useExistingCourse(id);
  const [openSheet, setOpenSheet] = useState<OpenSheet>(undefined);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | undefined>(undefined);

  if (existing.status === 'error') {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.courses}>
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
        <Link className="breadcrumb" to={ADMIN_ROUTES.courses}>
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

  const { course } = existing;
  const isClosed = course.lifecycle.status === 'closed';
  const stillListed = course.lifecycle.status === 'closed' && courseStillListed(course.lifecycle.leavesListsOn);
  const photos = [{ id: 'cover', url: course.coverUrl }, ...course.photos];
  const courseNameForSheets = course.name;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.courses}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="layout">
        <div className="main">
          <header className="header">
            <div className="titleRow">
              <img className="poster" src={course.coverUrl} alt="" />
              <div className="identity">
                <h1 className="heading" dir="auto">
                  {course.name}
                  {course.cycle !== undefined && (
                    <span className="cycle">
                      {consts.CYCLE_SEPARATOR}
                      {cycleLabel(course.cycle)}
                    </span>
                  )}
                </h1>
                {course.teacher.kind === 'rabbi' ? (
                  <Link className="teacherLink" to={ADMIN_ROUTES.rabbiView(course.teacher.rabbi.id)} dir="auto">
                    {rabbiDisplayName(course.teacher.rabbi)}
                  </Link>
                ) : (
                  <span className="teacherUnlinked" dir="auto">
                    {course.teacher.name}
                  </span>
                )}
              </div>
            </div>

            <div className="actions">
              {isClosed ? (
                <button type="button" className="action primary" onClick={() => setOpenSheet('duplicate')}>
                  {consts.DUPLICATE_LABEL}
                </button>
              ) : (
                <Link className="action primary" to={ADMIN_ROUTES.courseEdit(course.id)}>
                  {consts.EDIT_LABEL}
                </Link>
              )}

              {(!isClosed || stillListed) && (
                <a className="action" href={coursePath(course)} target="_blank" rel="noreferrer">
                  {consts.VIEW_ON_SITE_LABEL}
                </a>
              )}

              {!isClosed && (
                <>
                  <button type="button" className="action" onClick={() => setOpenSheet('full')}>
                    {consts.MARK_FULL_LABEL}
                  </button>
                  <button type="button" className="action" onClick={() => setOpenSheet('close')}>
                    {consts.CLOSE_REGISTRATION_LABEL}
                  </button>
                </>
              )}
            </div>
          </header>

          {isClosed && <p className="closedExplanation">{consts.CLOSED_EXPLANATION}</p>}

          <div className="fieldsGrid">
            <RecordField
              label={consts.TEACHER_LABEL}
              value={course.teacher.kind === 'rabbi' ? rabbiDisplayName(course.teacher.rabbi) : `${course.teacher.name} · ${consts.UNLINKED_TEACHER_SUFFIX}`}
              linkTo={course.teacher.kind === 'rabbi' ? ADMIN_ROUTES.rabbiView(course.teacher.rabbi.id) : undefined}
            />
            {course.cycle !== undefined && <RecordField label={consts.CYCLE_LABEL} value={String(course.cycle)} />}
            <RecordField className="wide" label={consts.DESCRIPTION_LABEL} value={course.description} />
            <RecordField label={consts.TOPIC_LABEL} isEmpty={!course.topic} value={course.topic ? courseTopicLabel(course.topic) : consts.NO_TOPIC_VALUE} />
            <RecordField label={consts.OPENING_DATE_LABEL} value={course.openingDate} />
            <RecordField label={consts.WEEKS_LABEL} value={String(course.weeks)} />
            <RecordField label={consts.SESSIONS_LABEL} value={String(course.sessions)} />
            <RecordField
              label={consts.HOURS_LABEL}
              isEmpty={course.hours === undefined}
              value={course.hours !== undefined ? String(course.hours) : consts.NO_HOURS_VALUE}
            />
            <RecordField label={consts.JOINABLE_LABEL} value={course.joinableAfterOpening ? consts.JOINABLE_YES_VALUE : consts.JOINABLE_NO_VALUE} />
            <RecordField
              className="wide"
              label={consts.VENUE_LABEL}
              value={`${course.venue.name}, ${addressLine(course.venue.street, course.venue.floor)}, ${venuePanelCityName(course.venue)}`}
            />
            <RecordField label={consts.AUDIENCE_LABEL} value={AUDIENCE_LABELS[course.audience]} />
            <RecordField label={consts.PHONE_LABEL} value={course.contactPhone} />
            <RecordField
              label={consts.PRICE_LABEL}
              isEmpty={course.priceShekels === undefined}
              value={course.priceShekels !== undefined ? String(course.priceShekels) : consts.NO_PRICE_VALUE}
            />
          </div>

          <div className="photosSection">
            <h2 className="sectionHeading">{consts.PHOTOS_HEADING}</h2>
            <div className="photosGrid">
              {photos.map((photo, index) => (
                <button key={photo.id} type="button" className="photoTile" onClick={() => setActivePhotoIndex(index)}>
                  <img className={photo.id === 'cover' ? 'photo cover' : 'photo'} src={photo.url} alt="" />
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="deleteAction" onClick={() => setOpenSheet('delete')}>
            {consts.DELETE_LABEL}
          </button>
        </div>

        <aside className="preview">
          <CoursePreviewCard course={course} />
        </aside>
      </div>

      {activePhotoIndex !== undefined && (
        <PhotoViewer
          {...{
            courseName: course.name,
            photos,
            activeIndex: activePhotoIndex,
            onNext: () => setActivePhotoIndex((index) => ((index ?? 0) + 1) % photos.length),
            onPrev: () => setActivePhotoIndex((index) => ((index ?? 0) - 1 + photos.length) % photos.length),
            onDismiss: () => setActivePhotoIndex(undefined),
          }}
        />
      )}

      {openSheet === 'close' && (
        <CloseCourseSheet
          {...{ courseId: course.id, courseName: courseNameForSheets, onDismiss: () => setOpenSheet(undefined), onClosed: () => setOpenSheet(undefined) }}
        />
      )}
      {openSheet === 'full' && (
        <MarkCourseFullSheet
          {...{
            courseId: course.id,
            courseName: courseNameForSheets,
            onDismiss: () => setOpenSheet(undefined),
            onMarkedFull: () => setOpenSheet(undefined),
          }}
        />
      )}
      {openSheet === 'duplicate' && (
        <DuplicateCourseSheet
          {...{
            courseId: course.id,
            courseName: courseNameForSheets,
            sourceCycle: course.cycle,
            onDismiss: () => setOpenSheet(undefined),
            onDuplicated: (duplicated) => navigate(ADMIN_ROUTES.courseEdit(duplicated.id)),
          }}
        />
      )}
      {openSheet === 'delete' && (
        <DeleteCourseSheet
          {...{
            courseId: course.id,
            courseName: courseNameForSheets,
            onDismiss: () => setOpenSheet(undefined),
            onDeleted: () => navigate(ADMIN_ROUTES.courses),
          }}
        />
      )}
    </div>
  );
})`
  ${styles.CourseViewPage}
`;
