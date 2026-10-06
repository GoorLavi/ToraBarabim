import { css } from 'styled-components';

import { DEDICATION_WHATSAPP_COLOR, DEDICATION_WHATSAPP_COLOR_HOVER } from '~/consts';

// Two renderings of the same actions, CSS-toggled by breakpoint (see
// ContactBar.tsx): `.phoneActions` is the fixed bottom bar below `lg`;
// `.desktopLabel`/`.desktopActions` are the side card's own inline
// registration section from `lg` up (design brief A, items 1 and 12).
export const ContactBar = css(
  ({ theme }) => `
  > .phoneActions {
    position: fixed;
    inset-inline: 0;
    inset-block-end: 0;
    z-index: ${theme.zIndex.header};
    block-size: ${theme.layout.fixedBottomBarBlockSize};
    display: flex;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.colors.surface};
    border-block-start: 1px solid ${theme.colors.border};
    box-shadow: ${theme.shadows.raised};

    > .whatsapp,
    > .call {
      flex: 1 1 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.md};
      font-weight: ${theme.typography.fontWeight.semiBold};

      > .icon {
        inline-size: 20px;
        block-size: 20px;
      }
    }

    > .whatsapp {
      border: 1px solid ${DEDICATION_WHATSAPP_COLOR};
      background: ${DEDICATION_WHATSAPP_COLOR};
      color: ${theme.colors.textOnPrimary};

      &:hover,
      &:active {
        border-color: ${DEDICATION_WHATSAPP_COLOR_HOVER};
        background: ${DEDICATION_WHATSAPP_COLOR_HOVER};
      }
    }

    > .call {
      border: 1px solid ${theme.colors.primary};
      color: ${theme.colors.primary};
    }
  }

  > .desktopLabel,
  > .desktopActions {
    display: none;
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    border-block-start: 1px solid ${theme.colors.border};
    padding-block-start: ${theme.spacing.lg};

    > .phoneActions {
      display: none;
    }

    > .desktopLabel {
      display: block;
      margin-block-end: ${theme.spacing.sm};
      color: ${theme.colors.textSecondary};
      font-weight: ${theme.typography.tagAndCaption.fontWeight};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }

    > .desktopActions {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      > .whatsapp,
      > .call {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${theme.spacing.xs};
        min-block-size: 48px;
        border-radius: ${theme.radii.pill};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        > .icon {
          inline-size: 22px;
          block-size: 22px;
        }
      }

      > .whatsapp {
        border: 1px solid ${DEDICATION_WHATSAPP_COLOR};
        background: ${DEDICATION_WHATSAPP_COLOR};
        color: ${theme.colors.textOnPrimary};

        &:hover,
        &:active {
          border-color: ${DEDICATION_WHATSAPP_COLOR_HOVER};
          background: ${DEDICATION_WHATSAPP_COLOR_HOVER};
        }
      }

      > .call {
        border: 1px solid ${theme.colors.primary};
        color: ${theme.colors.primary};

        /* Only the number, not the whole button (mirrors DedicationWindow). */
        > .label {
          direction: ltr;
        }
      }
    }
  }
`,
);
