import { css } from 'styled-components';

import { TextSection } from '~/LessonPage/textSection';

// The cream band is what keeps the note, which is about this date, from
// reading as more of the rabbi's bio further down.
export const LessonNote = css`
  ${TextSection}

  ${({ theme }) => `
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.accentSoft};
  `}
`;
