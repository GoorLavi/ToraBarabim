import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { teacherPageLink } from '~/CoursePage/helpers';

import * as consts from './consts';
import type { TeacherSectionProps } from './models';
import * as styles from './styles';

// Renders nothing for a free-text (unlinked) teacher: there is no rabbi
// record to say anything about (plan pass 1b, "none for a free-text
// teacher").
export const TeacherSection = styled(({ className, teacher }: TeacherSectionProps) => {
  if (teacher.kind !== 'rabbi') return null;

  const link = teacherPageLink(teacher);

  return (
    <div className={className}>
      <h2 className="heading" dir="auto">
        {consts.ABOUT_TEACHER_HEADING[teacher.rabbi.honorific]}
      </h2>

      {teacher.rabbi.bio && (
        <p className="bio" dir="auto">
          {teacher.rabbi.bio}
        </p>
      )}

      <Link className="link" to={link.to} dir="auto">
        {link.label}
      </Link>
    </div>
  );
})`
  ${styles.TeacherSection}
`;
