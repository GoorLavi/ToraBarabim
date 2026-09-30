import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { rabbiDisplayName, rabbiPath } from '~/helpers';

import type { TeacherLineProps } from './models';
import * as styles from './styles';

// A linked rabbi's own portrait and name, or an unlinked course's free text
// alone, no avatar and no link (design brief A, item 6).
export const TeacherLine = styled(({ className, teacher }: TeacherLineProps) => (
  <div className={className}>
    {teacher.kind === 'rabbi' ? (
      <Link className="link" to={rabbiPath(teacher.rabbi)}>
        {teacher.rabbi.photoUrl && <img className="avatar" src={teacher.rabbi.photoUrl} alt="" />}
        <span className="name" dir="auto">
          {rabbiDisplayName(teacher.rabbi)}
        </span>
      </Link>
    ) : (
      <span className="name" dir="auto">
        {teacher.name}
      </span>
    )}
  </div>
))`
  ${styles.TeacherLine}
`;
