import { css } from 'styled-components';

import { RUNNING_TEXT_MAX_INLINE_SIZE } from './consts';

// A heading over a paragraph of running text, shared by the lesson's note and
// the rabbi's bio. Capped like every other block of running text on the site
// (design-system.md, "Breakpoints and content width").
export const TextSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  max-inline-size: ${RUNNING_TEXT_MAX_INLINE_SIZE};

  > .heading {
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    color: ${theme.colors.text};
  }

  > .text {
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    color: ${theme.colors.text};
    white-space: pre-line;
  }
`,
);
