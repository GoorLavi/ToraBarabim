import { css } from 'styled-components';

import { RAIL_HEADING_CHEVRON_SIZE, RAIL_HEADING_LINK_MIN_BLOCK_SIZE } from './consts';

export const RailHeading = css(
  ({ theme }) => `
  font-size: ${theme.typography.sectionHeading.phone.fontSize};
  line-height: ${theme.typography.sectionHeading.phone.lineHeight};
  font-weight: ${theme.typography.sectionHeading.fontWeight};
  color: ${theme.colors.text};
  text-align: start;

  @media (min-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.sectionHeading.desktop.fontSize};
    line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
  }

  &.linked {
    display: flex;

    > .link {
      display: inline-block;
      max-inline-size: 100%;
      min-block-size: ${RAIL_HEADING_LINK_MIN_BLOCK_SIZE};
      /* Pads the text up to the 48px target: half of what the line height
         leaves short of it, on each side. */
      padding-block: calc((${RAIL_HEADING_LINK_MIN_BLOCK_SIZE} - ${theme.typography.sectionHeading.phone.lineHeight}) / 2);
      color: ${theme.colors.primary};
      text-decoration: none;

      @media (min-width: ${theme.breakpoints.md}) {
        padding-block: calc((${RAIL_HEADING_LINK_MIN_BLOCK_SIZE} - ${theme.typography.sectionHeading.desktop.lineHeight}) / 2);
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          color: ${theme.colors.primaryStrong};
          text-decoration: underline;
        }
      }

      &:active {
        color: ${theme.colors.primaryStrong};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
        border-radius: ${theme.radii.sm};
      }

      > .tail {
        white-space: nowrap;

        > .chevron {
          display: inline-block;
          inline-size: ${RAIL_HEADING_CHEVRON_SIZE};
          block-size: ${RAIL_HEADING_CHEVRON_SIZE};
          margin-inline-start: ${theme.spacing.xs};
          vertical-align: middle;
        }
      }
    }
  }
`,
);
