import { Link } from 'react-router-dom';
import styled from 'styled-components';

import * as consts from './consts';
import type { BackLinkProps } from './models';
import * as styles from './styles';

// A right-pointing chevron: in RTL, "back" (towards where the reader came
// from) points towards the reading-start side, the same direction the home
// rail uses for its "previous" arrow (HomePage/components/LessonRail).
export const BackLink = styled(({ className }: BackLinkProps) => (
  <Link to="/" className={className}>
    <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span>{consts.BACK_TO_ALL_LESSONS_LABEL}</span>
  </Link>
))`
  ${styles.BackLink}
`;
