import { css } from 'styled-components';

import { contentBandCap, contentGutterInline } from '~/styles/contentBand';

// `ContactCta` right above this footer is a `primarySoft` tinted card. Giving
// the footer that same tint made the two read as one continuous pink block
// with no boundary; a hairline alone was not enough to mark it (human
// report). The footer is a different material instead, plain `bg` with a
// `border` hairline along its top edge, so a tinted card sits on a plain
// footer and the seam is unambiguous. The tint still runs full-bleed, edge to
// edge: only `.inner` holds to the page's content band.
export const Footer = css(
  ({ theme }) => `
  background: ${theme.colors.bg};
  border-block-start: 1px solid ${theme.colors.border};

  > .inner {
    ${contentGutterInline(theme)}
    ${contentBandCap(theme)}
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding-block-start: ${theme.spacing.xl};
    /* 28, not a spacing token: the frame's measured bottom padding. */
    padding-block-end: 28px;

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
  }
`,
);
