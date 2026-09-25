import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { cycleLabel } from '~/CoursePage/consts';
import { ADMIN_ROUTES, DETAILS_LABEL } from '~/AdminPanel/consts';
import { adminCourseStatusTagLabel } from '~/AdminPanel/helpers';
import { israelDayMonthLabel, singularOrCount, venuePanelCityName } from '~/helpers';

import * as parentConsts from '../../consts';
import { adminCourseTeacherLabel } from '../../helpers';
import * as consts from './consts';
import type { CoursesTableProps } from './models';
import * as styles from './styles';

// Desktop only (hidden below `md` in styles.ts); `CoursesCardList` carries
// the same data on a phone. Mirrors `LessonsTable`'s own div-based ARIA
// table shape (root CLAUDE.md, Styling: never a bare-element selector).
export const CoursesTable = styled(({ className, rows }: CoursesTableProps) => (
  <div className={className} role="table">
    <div className="headRow" role="row">
      <span className="course" role="columnheader">
        {parentConsts.TABLE_NAME_HEADER}
      </span>
      <span className="teacher" role="columnheader">
        {parentConsts.TABLE_TEACHER_HEADER}
      </span>
      <span className="opening" role="columnheader">
        {parentConsts.TABLE_OPENING_HEADER}
      </span>
      <span className="weeks" role="columnheader">
        {parentConsts.TABLE_WEEKS_HEADER}
      </span>
      <span className="city" role="columnheader">
        {parentConsts.TABLE_CITY_HEADER}
      </span>
      <span className="statusCol" role="columnheader">
        {parentConsts.TABLE_STATUS_HEADER}
      </span>
      <span className="actions" role="columnheader" />
    </div>

    {rows.map((course) => (
      <div key={course.id} className="row" role="row">
        <span className="course" role="cell">
          <img className="thumbnail" src={course.coverUrl} alt="" />
          <span className="title" dir="auto">
            {course.name}
            {course.cycle !== undefined && (
              <span className="cycle">
                {consts.CYCLE_SEPARATOR}
                {cycleLabel(course.cycle)}
              </span>
            )}
          </span>
        </span>
        <span className="teacher" role="cell" dir="auto">
          {adminCourseTeacherLabel(course)}
        </span>
        <span className="opening" role="cell" dir="auto">
          {israelDayMonthLabel(course.openingDate)}
        </span>
        <span className="weeks" role="cell" dir="auto">
          {singularOrCount(course.weeks, 'שבוע אחד', 'שבועות')}
        </span>
        <span className="city" role="cell" dir="auto">
          {venuePanelCityName(course.venue)}
        </span>
        <span className="statusCol" role="cell">
          <span className="tag">{adminCourseStatusTagLabel(course)}</span>
        </span>
        <span className="actions" role="cell">
          <Link className="details" to={ADMIN_ROUTES.courseView(course.id)}>
            {DETAILS_LABEL}
          </Link>
        </span>
      </div>
    ))}
  </div>
))`
  ${styles.CoursesTable}
`;
