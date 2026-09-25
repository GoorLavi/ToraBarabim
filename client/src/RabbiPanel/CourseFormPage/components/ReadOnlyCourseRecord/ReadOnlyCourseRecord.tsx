import styled from 'styled-components';

import { RecordField } from '~/components/RecordField/RecordField';
import {
  AUDIENCE_LABELS,
  COURSE_CLOSED_RECORD_EXPLANATION,
  COURSE_DELETE_ACTION_LABEL,
  COURSE_DUPLICATE_ACTION_LABEL,
  COURSE_FACT_AUDIENCE_LABEL,
  COURSE_FACT_OPENING_LABEL,
  COURSE_FACT_PRICE_LABEL,
  COURSE_FACT_SCOPE_LABEL,
  COURSE_FACT_VENUE_LABEL,
  COURSE_STATE_TAG_CLOSED,
  COURSE_STATE_TAG_FULL,
  COURSE_VIEW_ON_SITE_ACTION_LABEL,
} from '~/consts';
import {
  addressLine,
  courseClosedLineLabel,
  courseOpeningDateLongLabel,
  coursePath,
  courseStillListed,
  courseTopicLabel,
  formatCourseScope,
  formatPriceShekels,
  phoneDisplay,
  venuePanelCityName,
} from '~/helpers';

import * as consts from './consts';
import type { ReadOnlyCourseRecordProps } from './models';
import * as styles from './styles';

// The form's own counterpart once a course closes (design brief B, item 7,
// the owner's decision), shaped like `AdminPanel/LessonViewPage`'s own
// label-and-value record rather than a form of disabled inputs: a header
// with the cover thumbnail and the tag-and-line row, an actions row
// (duplicate as the primary action, the site link beside it while the
// course is still listed), the explanation, the fields, the photos, and
// delete on its own at the bottom.
export const ReadOnlyCourseRecord = styled(({ className, course, onOpenDuplicate, onOpenDelete }: ReadOnlyCourseRecordProps) => {
  const { lifecycle } = course;
  // Unreachable in practice, this component's one caller already checked
  // `lifecycle.status === 'closed'` before rendering it: kept as a real
  // guard rather than a type-level narrowing of `course` itself, since
  // TypeScript does not carry a discriminant check on a nested property
  // through an object spread at the call site.
  if (lifecycle.status !== 'closed') return null;
  const stillListed = courseStillListed(lifecycle.leavesListsOn);

  return (
    <div className={className}>
      <div className="header">
        <img className="cover" src={course.coverUrl} alt="" />
        <div className="identity">
          <h1 className="heading" dir="auto">
            {course.name}
          </h1>
          <div className="tagRow">
            <span className="tag">{lifecycle.reason === 'full' ? COURSE_STATE_TAG_FULL : COURSE_STATE_TAG_CLOSED}</span>
            <span className="closedLine">{courseClosedLineLabel(lifecycle)}</span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button type="button" className="action primary" onClick={onOpenDuplicate}>
          {COURSE_DUPLICATE_ACTION_LABEL}
        </button>
        {stillListed && (
          <a className="action viewOnSite" href={coursePath(course)} target="_blank" rel="noreferrer">
            {COURSE_VIEW_ON_SITE_ACTION_LABEL}
          </a>
        )}
      </div>

      <p className="explanation">{COURSE_CLOSED_RECORD_EXPLANATION}</p>

      <div className="fields">
        {course.cycle !== undefined && <RecordField {...{ label: consts.FACT_CYCLE_LABEL, value: String(course.cycle) }} />}
        <RecordField {...{ label: consts.FACT_DESCRIPTION_LABEL, value: course.description }} />
        {course.topic && <RecordField {...{ label: consts.FACT_TOPIC_LABEL, value: courseTopicLabel(course.topic) }} />}
        <RecordField {...{ label: COURSE_FACT_OPENING_LABEL, value: courseOpeningDateLongLabel(course.openingDate) }} />
        <RecordField {...{ label: COURSE_FACT_SCOPE_LABEL, value: formatCourseScope(course.weeks, course.sessions, course.hours) }} />
        <RecordField
          {...{
            label: COURSE_FACT_VENUE_LABEL,
            value: `${course.venue.name}, ${addressLine(course.venue.street, course.venue.floor)}, ${venuePanelCityName(course.venue)}`,
          }}
        />
        <RecordField {...{ label: COURSE_FACT_AUDIENCE_LABEL, value: AUDIENCE_LABELS[course.audience] }} />
        <RecordField {...{ label: consts.FACT_CONTACT_PHONE_LABEL, value: phoneDisplay(course.contactPhone), valueDir: 'ltr' }} />
        {course.priceShekels !== undefined && <RecordField {...{ label: COURSE_FACT_PRICE_LABEL, value: formatPriceShekels(course.priceShekels) }} />}
      </div>

      {course.photos.length > 0 && (
        <div className="gallery">
          <span className="heading">{consts.GALLERY_HEADING}</span>
          <div className="grid">
            {course.photos.map((photo) => (
              <img key={photo.id} className="photo" src={photo.url} alt="" />
            ))}
          </div>
        </div>
      )}

      <button type="button" className="deleteAction" onClick={onOpenDelete}>
        {COURSE_DELETE_ACTION_LABEL}
      </button>
    </div>
  );
})`
  ${styles.ReadOnlyCourseRecord}
`;
