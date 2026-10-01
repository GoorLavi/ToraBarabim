import { css } from 'styled-components';

import { CARD_WIDE_THRESHOLD } from '~/consts';

// Every size here steps against the tile's own width (the rail item shell is
// the container), never the viewport: the same rule the lesson card follows.
// Thresholds 160 and 150 are the fallbacks for the narrowest tile (136 at a
// 320 screen), strictly ordered: the gaps and the icon tighten first, then
// the short line goes. The title and the pill are never dropped.
export const HelpTileContent = css(
  ({ theme }) => `
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing.md};

  @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
    padding: ${theme.spacing.lg};
  }

  > .group {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.xs};
    text-align: center;

    > .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      inline-size: 48px;
      block-size: 48px;
      margin-block-end: ${theme.spacing.md};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.primary};

      &.surface {
        background: ${theme.colors.surface};
      }

      &.primarySoft {
        background: ${theme.colors.primarySoft};
      }

      > svg {
        inline-size: 28px;
        block-size: 28px;
      }

      @media (min-width: ${theme.breakpoints.sm}) {
        inline-size: 64px;
        block-size: 64px;

        > svg {
          inline-size: 36px;
          block-size: 36px;
        }
      }

      @container (max-inline-size: 159px) {
        inline-size: 40px;
        block-size: 40px;
        margin-block-end: ${theme.spacing.sm};

        > svg {
          inline-size: 24px;
          block-size: 24px;
        }
      }
    }

    > .title {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitleCompact.phone.fontSize};
      line-height: ${theme.typography.cardTitleCompact.phone.lineHeight};
      overflow-wrap: break-word;
      text-wrap: balance;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
      }
    }

    > .line {
      color: ${theme.colors.text};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
      overflow-wrap: break-word;
      text-wrap: balance;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      @container (max-inline-size: 149px) {
        display: none;
      }
    }
  }

  > .pill {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-block-size: 48px;
    margin-block-start: ${theme.spacing.md};
    padding-inline: ${theme.spacing.sm};
    border: 1px solid ${theme.colors.primary};
    border-radius: ${theme.radii.md};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondaryCompact.phone.fontSize};
    line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
    text-align: center;
    overflow-wrap: break-word;

    @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  /* The pill fills when the pointer is over the tile, never over the pill
     alone: the whole tile is the target. */
  @media (hover: hover) and (pointer: fine) {
    :hover > & > .pill {
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
    }
  }
`,
);
