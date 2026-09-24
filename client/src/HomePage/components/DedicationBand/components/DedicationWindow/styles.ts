import { css } from 'styled-components';

import { VARIANT_TOKENS, ornamentColorVarsCss } from '~/components/DedicationUnit/consts';
import { DEDICATION_WHATSAPP_COLOR, DEDICATION_WHATSAPP_COLOR_HOVER } from '~/consts';

import * as consts from './consts';

// Styles `ResponsiveSheet`'s own public `.panel` slot directly, the same way
// `FilterDrawer/styles.ts` already does, rather than growing a prop on
// `ResponsiveSheet` itself. Every one of this component's own elements is a
// DOM child of `.panel`, not of the sheet's backdrop root this generated
// class also lands on, so each is nested inside the `> .panel` block below.
export const DedicationWindow = css(
  ({ theme }) => `
  > .panel {
    position: relative;
    padding: 0;
    gap: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    > .close {
      position: absolute;
      inset-block-start: ${theme.spacing.md};
      inset-inline-end: ${theme.spacing.md};
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border: none;
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.surfaceOnPrimary};
      color: ${theme.colors.textOnPrimary};
      cursor: pointer;

      > .icon {
        inline-size: 20px;
        block-size: 20px;
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.textOnPrimary};
        outline-offset: 2px;
      }
    }

    > .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: ${theme.spacing.sm};
      padding-block: ${theme.spacing.xl} ${consts.HEADER_PADDING_BOTTOM_PX}px;
      padding-inline: ${theme.spacing.xl};
      background: ${theme.colors.primaryStrong};

      /* Two instances, real and mirrored: a custom property has no way to
         be set once and shared between two sibling elements. */
      > .ornament {
        ${ornamentColorVarsCss(VARIANT_TOKENS.onPrimary)}

        --dedication-scale-px: ${consts.ORNAMENT_SCALE_PX};
      }

      > .title {
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.pageHeading.fontWeight};
        font-size: ${theme.typography.pageHeading.phone.fontSize};
        line-height: ${theme.typography.pageHeading.phone.lineHeight};
      }

      > .formulas {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${theme.spacing.xs};

        > .formula {
          color: ${VARIANT_TOKENS.onPrimary.text};
          text-shadow: ${VARIANT_TOKENS.onPrimary.shadow};
          font-family: ${theme.typography.dedicationFormula.fontFamily};
          font-size: ${theme.typography.dedicationFormula.fontSize};
          line-height: ${theme.typography.dedicationFormula.lineHeight};
          font-weight: ${theme.typography.dedicationFormula.fontWeight};
          letter-spacing: ${theme.typography.dedicationFormula.letterSpacing};
        }
      }
    }

    > .body {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.lg};
      padding-block: ${consts.BODY_PADDING_TOP_PX}px ${theme.spacing.xl};
      padding-inline: ${theme.spacing.lg};
      overflow-y: auto;
      background: ${theme.colors.surface};

      @media (min-width: ${theme.breakpoints.md}) {
        padding-inline: ${theme.spacing.xl};
      }

      > .paragraph {
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .leadIn {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .actions {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};

        > .whatsapp {
          background: ${DEDICATION_WHATSAPP_COLOR};
          border-color: ${DEDICATION_WHATSAPP_COLOR};
          color: ${theme.colors.textOnPrimary};

          > .icon {
            inline-size: 22px;
            block-size: 22px;
          }

          &:hover,
          &:active {
            background: ${DEDICATION_WHATSAPP_COLOR_HOVER};
            border-color: ${DEDICATION_WHATSAPP_COLOR_HOVER};
            color: ${theme.colors.textOnPrimary};
          }
        }

        > .call {
          color: ${theme.colors.primary};

          > .icon {
            inline-size: 20px;
            block-size: 20px;
          }

          /* Only the number, not the whole button: the icon still sits at
             the true inline start, before this in DOM order. */
          > .label {
            direction: ltr;
          }
        }
      }
    }
  }
`,
);
