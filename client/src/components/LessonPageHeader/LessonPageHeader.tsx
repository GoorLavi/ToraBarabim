import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LogoMark } from '~/HomePage/components/Header/components/LogoMark/LogoMark';
import { HOME_LINK_LABEL, LOGO_MARK_SIZE, WORDMARK } from '~/HomePage/components/Header/consts';

import type { LessonPageHeaderProps } from './models';
import * as styles from './styles';

export const LessonPageHeader = styled(({ className }: LessonPageHeaderProps) => (
  <header className={className}>
    <div className="bar">
      <Link to="/" className="logo" aria-label={HOME_LINK_LABEL}>
        <LogoMark size={LOGO_MARK_SIZE} variant="onDark" />
        <span className="wordmark" dir="auto">
          {WORDMARK}
        </span>
      </Link>
    </div>
  </header>
))`
  ${styles.LessonPageHeader}
`;
