import { css } from 'styled-components';

import { PADDING_INLINE } from '~/components/CityChip/consts';

// The cell matches `CityChip`'s fill, border, radius and inline padding
// (`PADDING_INLINE`) so the two read as one vocabulary, even though this is
// a plain button rather than a link to a city page.
export const CityAreaBlock = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .areaLabel {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    font-weight: ${theme.typography.tagAndCaption.fontWeight};
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.spacing.md};

    > .cell {
      display: block;

      > .cityButton {
        inline-size: 100%;
        min-inline-size: 0;
        min-block-size: 64px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: ${theme.spacing.xs};
        padding-block: ${theme.spacing.md};
        padding-inline: ${PADDING_INLINE};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.md};
        background: ${theme.colors.surface};
        text-align: start;
        overflow-wrap: anywhere;

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            border-color: ${theme.colors.primary};
          }
        }

        &:active {
          background: ${theme.colors.primarySoft};
        }

        &:focus-visible {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
        }

        > .name {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
        }

        > .count {
          color: ${theme.colors.textSecondary};
          font-weight: ${theme.typography.fontWeight.regular};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }
      }
    }
  }

  > .expand {
    align-self: flex-start;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.sm};
    border: none;
    border-radius: ${theme.radii.sm};
    background: transparent;
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: ${theme.colors.primaryStrong};
      }
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
  }
`,
);
