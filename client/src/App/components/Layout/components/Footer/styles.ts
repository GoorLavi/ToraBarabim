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

      /* The same shape as a text link beside it, but a button: it opens the
         install flow in place rather than going to a page. Alone on its own
         row on a phone; from md up it joins the row behind a divider. */
      > .installLink {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-basis: 100%;
        justify-content: flex-start;
        padding-block: 13px;
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.sm};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};

        &:focus-visible {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
        }

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            color: ${theme.colors.primaryStrong};

            > .label {
              text-decoration: underline;
            }
          }
        }

        &:active {
          color: ${theme.colors.primaryStrong};
          background: ${theme.colors.primarySoft};
        }

        @media (min-width: ${theme.breakpoints.md}) {
          flex-basis: auto;
          padding-inline-start: ${theme.spacing.lg};
          border-inline-start: 1px solid ${theme.colors.border};
          border-start-start-radius: 0;
          border-end-start-radius: 0;
        }
      }
    }
  }
`,
);
