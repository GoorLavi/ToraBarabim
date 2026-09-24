import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { teacherPageLink } from '~/CoursePage/helpers';

import * as consts from './consts';
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
      <h2 className="heading">{reason === 'full' ? consts.FULL_HEADING : consts.CLOSED_HEADING}</h2>
      <p className="factLine">{closedFactLine(openingDate, weeks)}</p>
      <Link className="link" to={teacherLink.to} dir="auto">
        {teacherLink.label}
      </Link>
    </div>
  );
})`
  ${styles.ClosedPanel}
`;
