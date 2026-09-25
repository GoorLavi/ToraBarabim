import styled from 'styled-components';

import { adminCourseStatusTagLabel, courseStatusBucket } from '~/AdminPanel/helpers';
import { CourseStateSeal } from '~/components/CourseStateSeal/CourseStateSeal';
import { AUDIENCE_LABELS, META_LINE_SEPARATOR } from '~/consts';
import { courseOpeningDateLongLabel, rabbiDisplayName, stateSealParts, venuePanelCityName } from '~/helpers';

import * as consts from './consts';
import type { CoursePreviewCardProps } from './models';
import * as styles from './styles';

// A static mimic of the public `CourseCard`, not that component itself: the
// admin's own `PanelCourseTeacher`/`LessonVenuePanel` shapes have no lossless
// conversion to the public `CourseTeacher`/`LessonVenue` (an address venue
// here carries a `cityCode`, never the `citySlug`/`area` pair the public
// venue needs), and a real `CourseCard` would also link out to the live
// page and fire a real click event on tap. Mirrors `AdminPanel/components/
// LessonPreviewCard`'s own precedent for the same reason. Lifted from
// `CourseViewPage/components/` once `CourseFormPage` became a second caller.
export const CoursePreviewCard = styled(({ className, course }: CoursePreviewCardProps) => {
  const teacherLabel = course.teacher.kind === 'rabbi' ? rabbiDisplayName(course.teacher.rabbi) : course.teacher.name;
  const isClosed = courseStatusBucket(course) === 'full' || courseStatusBucket(course) === 'closed';
  const seal = stateSealParts(adminCourseStatusTagLabel(course));

  return (
    <div className={className}>
      <p className="heading">{consts.HEADING}</p>

      <div className="card">
        <div className="poster">
          <img className="image" src={course.coverUrl} alt="" />
          <CourseStateSeal {...{ small: seal.small, big: seal.big, isClosed }} />
        </div>

        <div className="body">
          <h3 className="title" dir="auto">
            {course.name}
          </h3>
          <p className="teacher" dir="auto">
            {teacherLabel}
          </p>
          <p className="opening" dir="auto">
            {courseOpeningDateLongLabel(course.openingDate)}
          </p>
          <p className="meta" dir="auto">
            {AUDIENCE_LABELS[course.audience]}
            {META_LINE_SEPARATOR}
            {venuePanelCityName(course.venue)}
          </p>
        </div>
      </div>
    </div>
  );
})`
  ${styles.CoursePreviewCard}
`;
