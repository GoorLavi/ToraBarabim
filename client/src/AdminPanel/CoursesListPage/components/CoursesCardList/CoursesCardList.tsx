import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { cycleLabel } from '~/CoursePage/consts';
import { ADMIN_ROUTES, DETAILS_LABEL } from '~/AdminPanel/consts';
import { adminCourseClosedLineLabel, adminCourseStatusTagLabel } from '~/AdminPanel/helpers';
import { MIDDLE_DOT_SEPARATOR } from '~/consts';
import { venuePanelCityName } from '~/helpers';

import { adminCourseOpeningLineLabel, adminCourseTeacherLabel } from '../../helpers';
import type { CoursesCardListProps } from './models';
import * as styles from './styles';

// Phone only (hidden at `md` and up in styles.ts); `CoursesTable` carries
// the same data on desktop.
export const CoursesCardList = styled(({ className, rows }: CoursesCardListProps) => (
  <ul className={className}>
    {rows.map((course) => {
      const isClosed = course.lifecycle.status === 'closed';
      return (
        <li key={course.id} className="card">
          <div className="top">
            <img className="thumbnail" src={course.coverUrl} alt="" />

            <div className="titleBlock">
              <span className="title" dir="auto">
                {course.name}
                {course.cycle !== undefined && (
                  <span className="cycle">
                    {MIDDLE_DOT_SEPARATOR}
                    {cycleLabel(course.cycle)}
                  </span>
                )}
              </span>
              <span className="secondary" dir="auto">
                {adminCourseTeacherLabel(course)}
              </span>
            </div>
          </div>

          {isClosed ? (
            // Full width, not squeezed beside the thumbnail (design gate
            // round 2 finding): the closed line already runs long, and the
            // 64px poster left it too little room to keep the tag and the
            // line on one row.
            <div className="closedRow">
              <span className="tag">{adminCourseStatusTagLabel(course)}</span>
              <span className="closedLine">{adminCourseClosedLineLabel(course)}</span>
            </div>
          ) : (
            <>
              <span className="meta" dir="auto">
                {adminCourseOpeningLineLabel(course)}
              </span>
              <div className="tags">
                <span className="tag open">{adminCourseStatusTagLabel(course)}</span>
                <span className="tag city" dir="auto">
                  {venuePanelCityName(course.venue)}
                </span>
              </div>
            </>
          )}

          <Link className="details" to={ADMIN_ROUTES.courseView(course.id)}>
            {DETAILS_LABEL}
          </Link>
        </li>
      );
    })}
  </ul>
))`
  ${styles.CoursesCardList}
`;
