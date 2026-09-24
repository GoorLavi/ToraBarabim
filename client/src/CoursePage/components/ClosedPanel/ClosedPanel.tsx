import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { COURSE_STATE_TAG_CLOSED, COURSE_STATE_TAG_FULL } from '~/consts';
import { teacherPageLink } from '~/CoursePage/helpers';

import { closedFactLine } from './helpers';
import type { ClosedPanelProps } from './models';
import * as styles from './styles';

// Replaces `ContactBar` once a course is closed (CoursePage.tsx): the
// registration actions are gone (spec section 7), and this panel is the
// page's own way forward instead.
export const ClosedPanel = styled(({ className, reason, openingDate, weeks, teacher }: ClosedPanelProps) => {
  const teacherLink = teacherPageLink(teacher);

  return (
    <div className={className}>
      <span className="rule" aria-hidden="true" />
      <h2 className="heading">{reason === 'full' ? COURSE_STATE_TAG_FULL : COURSE_STATE_TAG_CLOSED}</h2>
      <p className="factLine">{closedFactLine(reason, openingDate, weeks)}</p>
      <Link className="link" to={teacherLink.to} dir="auto">
        {teacherLink.label}
      </Link>
    </div>
  );
})`
  ${styles.ClosedPanel}
`;
