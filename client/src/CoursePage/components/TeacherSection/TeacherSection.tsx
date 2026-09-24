import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { teacherPageLink } from '~/CoursePage/helpers';

import * as consts from './consts';
import type { TeacherSectionProps } from './models';
import * as styles from './styles';

// Renders nothing for a free-text (unlinked) teacher: there is no rabbi
// record to say anything about. A row, portrait beside the text (design
// brief A, item 9).
export const TeacherSection = styled(({ className, teacher }: TeacherSectionProps) => {
  if (teacher.kind !== 'rabbi') return null;

  const { rabbi } = teacher;
  const link = teacherPageLink(teacher);

  return (
    <div className={className}>
      <h2 className="heading" dir="auto">
        {consts.ABOUT_TEACHER_HEADING[rabbi.honorific]}
      </h2>

      <div className="row">
        {rabbi.photoUrl && <img className="portrait" src={rabbi.photoUrl} alt="" />}

        <div className="text">
          <p className="name" dir="auto">
            {rabbi.name}
          </p>

          {rabbi.title && (
            <p className="title" dir="auto">
              {rabbi.title}
            </p>
          )}

          {rabbi.bio && (
            <p className="bio" dir="auto">
              {rabbi.bio}
            </p>
          )}

          <Link className="link" to={link.to} dir="auto">
            {link.label}
            <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
})`
  ${styles.TeacherSection}
`;
