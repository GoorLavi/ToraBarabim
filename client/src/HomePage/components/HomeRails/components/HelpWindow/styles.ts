import { css } from 'styled-components';

import { CLOSE_BUTTON_SIZE_PX, closeButtonClearance } from './consts';

// Styles `ResponsiveSheet`'s own public `.panel` slot directly, the way
// `DedicationWindow` does, rather than growing a prop on the sheet. The
// whole panel is one scroll region: the header scrolls away with the rest
// and only the close button stays pinned.
export const HelpWindow = css(
  ({ theme }) => `
  > .panel {
    padding: 0;
    gap: 0;

    > .close {
      /* Pinned to the top inline-end while the panel scrolls. It takes no
         room of its own: the negative end margin cancels its height, so the
         header sits where it would without it. */
      position: sticky;
      inset-block-start: ${theme.spacing.md};
      z-index: 1;
      align-self: flex-end;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: ${CLOSE_BUTTON_SIZE_PX}px;
      block-size: ${CLOSE_BUTTON_SIZE_PX}px;
      margin-inline-end: ${theme.spacing.md};
      margin-block-end: -${CLOSE_BUTTON_SIZE_PX}px;
      /* A solid fill with a hairline, not the translucent white the
         dedication window uses: once the header has scrolled away this sits
         on the white form, where a translucent fill disappears. */
      border: 1px solid ${theme.colors.borderOnPrimary};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primaryStrong};
      color: ${theme.colors.textOnPrimary};

      > .icon {
        inline-size: 20px;
        block-size: 20px;
      }

      /* Two tones: the button sits on the plum header and, once that has
         scrolled away, on the white form, and a ring of either colour alone
         disappears on one of them. */
      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
        box-shadow: 0 0 0 2px ${theme.colors.textOnPrimary};
      }
    }

    > .header {
      flex-shrink: 0;
      /* Clears the close button's own 48px plus its margin on the inline-end
         side, so even a four-line title never runs under it. */
      padding-block: ${theme.spacing.xl};
      padding-inline-start: ${theme.spacing.lg};
      padding-inline-end: ${closeButtonClearance(theme.spacing.md)};
      background: ${theme.colors.primaryStrong};

      > .title {
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.sectionHeading.fontWeight};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};
        text-wrap: balance;

        &:focus {
          outline: none;
        }

        @media (min-width: ${theme.breakpoints.md}) {
          font-size: ${theme.typography.sectionHeading.desktop.fontSize};
          line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
        }
      }
    }

    > .body {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xl};
      padding-block: ${theme.spacing.xl};
      padding-inline: ${theme.spacing.lg};

      @media (min-width: ${theme.breakpoints.md}) {
        padding-inline: ${theme.spacing.xl};
      }

      > .explanation {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.md};

        > .paragraph {
          color: ${theme.colors.text};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
        }
      }
    }

    > .thankYou {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${theme.spacing.lg};
      padding-block: ${theme.spacing.xxl};
      padding-inline: ${theme.spacing.lg};
      text-align: center;

      > .checkCircle {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 64px;
        block-size: 64px;
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};

        > svg {
          inline-size: 36px;
          block-size: 36px;
        }
      }

      > .message {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.sectionHeading.fontWeight};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};

        &:focus {
          outline: none;
        }

        @media (min-width: ${theme.breakpoints.md}) {
          font-size: ${theme.typography.sectionHeading.desktop.fontSize};
          line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
        }
      }

      > .done {
        align-self: stretch;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.xl};
        border: 1px solid ${theme.colors.primary};
        border-radius: ${theme.radii.md};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &:focus-visible {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
        }
      }
    }
  }
`,
);
