import { css } from 'styled-components';

import { VARIANT_TOKENS, ornamentColorVarsCss } from '~/components/DedicationUnit/consts';
import { WHATSAPP_BRAND_COLOR, WHATSAPP_BRAND_COLOR_HOVER } from '~/consts';

import * as consts from './consts';

// Inset: option C (root plan's "Area ownership" table). This styles
// `ResponsiveSheet`'s own public `.panel` slot directly, the same way
// `FilterDrawer/styles.ts` already does, rather than growing a prop on
// `ResponsiveSheet` itself: the panel goes edge to edge and this component
// pads its own header and body separately, at two different paddings.
//
// Every one of this component's own elements (`.close`, `.header`, `.body`)
// is a DOM child of `.panel`, not of the sheet's backdrop root this
// generated class also lands on (`ResponsiveSheet.tsx` renders `{children}`
// inside `.panel`), so each has to be nested inside the `> .panel` block
// below to actually match anything: written as siblings of it, as this once
// was, matches nothing and every one of them rendered with browser
// defaults instead (an unset `<svg>` defaults to 300x150, which is the
// "giant black X" that finding was).
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

      > svg {
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
      padding-block: ${consts.HEADER_PADDING_TOP_PX}px ${consts.HEADER_PADDING_BOTTOM_PX}px;
      padding-inline: ${theme.spacing.xl};
      background: ${theme.colors.primaryStrong};

      /* Two instances, real and mirrored, same as a dedication unit's own
         ornament pair (DedicationUnit/styles.ts): the design frames the
         gold lines above and below, not once. Each sets its own colour
         scope, since a custom property has no way to be set once and
         shared between two sibling elements that are not one another's
         ancestor. */
      > .ornament {
        ${ornamentColorVarsCss(VARIANT_TOKENS.onPrimary)}

        --dedication-scale-px: ${consts.ORNAMENT_SCALE_PX};
      }

      > .title {
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.sectionHeading.fontWeight};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};
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
      padding-inline: ${theme.spacing.xl};
      overflow-y: auto;
      background: ${theme.colors.surface};

      > .paragraph,
      > .leadIn {
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .leadIn {
        font-weight: ${theme.typography.fontWeight.semiBold};
      }

      > .actions {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};

        > .whatsapp {
          background: ${WHATSAPP_BRAND_COLOR};
          border-color: ${WHATSAPP_BRAND_COLOR};
          color: ${theme.colors.textOnPrimary};

          &:hover,
          &:active {
            background: ${WHATSAPP_BRAND_COLOR_HOVER};
            border-color: ${WHATSAPP_BRAND_COLOR_HOVER};
            color: ${theme.colors.textOnPrimary};
          }
        }

        > .call {
          direction: ltr;
        }
      }
    }
  }
`,
);
