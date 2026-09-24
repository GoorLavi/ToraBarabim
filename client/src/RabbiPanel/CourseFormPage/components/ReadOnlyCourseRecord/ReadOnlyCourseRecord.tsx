import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ReadOnlyField } from '~/components/ReadOnlyField/ReadOnlyField';
import {
  AUDIENCE_LABELS,
  COURSE_FACT_AUDIENCE_LABEL,
  COURSE_FACT_OPENING_LABEL,
  COURSE_FACT_PRICE_LABEL,
  COURSE_FACT_SCOPE_LABEL,
  COURSE_FACT_VENUE_LABEL,
} from '~/consts';
import {
  addressLine,
  courseClosedLineLabel,
  courseOpeningDateLongLabel,
  courseTopicLabel,
  formatCourseScope,
  formatPriceShekels,
  placePath,
  venuePanelCityName,
} from '~/helpers';

import * as formConsts from '../../consts';
import * as consts from './consts';
import type { ReadOnlyCourseRecordProps } from './models';
import * as styles from './styles';

// The form's own counterpart once a course closes (design brief B, item 7,
// the owner's decision): every field the editable form shows, laid out as
// fixed values instead of inputs, plus the two actions that still apply to
// a closed course.
export const ReadOnlyCourseRecord = styled(({ className, course, onOpenDuplicate, onOpenDelete }: ReadOnlyCourseRecordProps) => {
  const venueValue =
    course.venue.kind === 'place' ? (
      <Link to={placePath({ id: course.venue.placeId, slug: course.venue.slug })}>{course.venue.name}</Link>
    ) : (
      course.venue.name
    );

  return (
    <div className={className}>
      <h1 className="heading" dir="auto">
        {course.name}
      </h1>
      <p className="explanation">{consts.RECORD_EXPLANATION}</p>

      {course.lifecycle.status === 'closed' && <p className="closedLine">{courseClosedLineLabel(course.lifecycle)}</p>}

      <img className="cover" src={course.coverUrl} alt="" />

      <div className="fields">
        {course.cycle !== undefined && <ReadOnlyField label={consts.FACT_CYCLE_LABEL} value={String(course.cycle)} />}
        <ReadOnlyField label={consts.FACT_DESCRIPTION_LABEL} value={course.description} />
        {course.topic && <ReadOnlyField label={consts.FACT_TOPIC_LABEL} value={courseTopicLabel(course.topic)} />}
        <ReadOnlyField label={COURSE_FACT_OPENING_LABEL} value={courseOpeningDateLongLabel(course.openingDate)} />
        <ReadOnlyField label={COURSE_FACT_SCOPE_LABEL} value={formatCourseScope(course.weeks, course.sessions, course.hours)} />
        <ReadOnlyField
          label={COURSE_FACT_VENUE_LABEL}
          value={`${course.venue.name}, ${addressLine(course.venue.street, course.venue.floor)}, ${venuePanelCityName(course.venue)}`}
        />
        <ReadOnlyField label={COURSE_FACT_AUDIENCE_LABEL} value={AUDIENCE_LABELS[course.audience]} />
        <ReadOnlyField label={consts.FACT_CONTACT_PHONE_LABEL} value={course.contactPhone} />
        {course.priceShekels !== undefined && <ReadOnlyField label={COURSE_FACT_PRICE_LABEL} value={formatPriceShekels(course.priceShekels)} />}
      </div>

      {course.venue.kind === 'place' && (
        <p className="explanation">
          {'הקורס רשום למקום '}
          {venueValue}
          {' באתר.'}
        </p>
      )}

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

      <div className="dangerZone">
        <span className="heading">{consts.DANGER_ZONE_HEADING}</span>
        <button type="button" className="action" onClick={onOpenDuplicate}>
          {formConsts.DUPLICATE_LABEL}
        </button>
        <button type="button" className="action delete" onClick={onOpenDelete}>
          {formConsts.DELETE_LABEL}
        </button>
      </div>
    </div>
  );
})`
  ${styles.ReadOnlyCourseRecord}
`;
