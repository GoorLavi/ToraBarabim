import { css } from 'styled-components';

import { contentBandCap } from '~/HomePage/styles';

// Caps and centres its own box inside whatever gutter the outer `.footer`
// wrapper (HomePage/styles.ts) applies, the same split every content band
// on the page uses (design spec, "the exact geometry").
export const Footer = css(
  ({ theme }) => `
  ${contentBandCap(theme)}
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding-block-start: ${theme.spacing.xl};
  /* 28, not a spacing token: the frame's measured bottom padding. */
  padding-block-end: 28px;
  padding-inline: ${theme.spacing.lg};
  background: ${theme.colors.primarySoft};

  > .wordmark {
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.bold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .links {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.lg};
  }
`,
);
