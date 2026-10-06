import { css } from 'styled-components';

export const OfferCard = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .intro {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    > .appIcon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border-radius: ${theme.radii.md};
      background: ${theme.colors.primary};
    }

    > .text {
      min-inline-size: 0;

      > .headline {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
      }

      > .line {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }
  }

  > .actions {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    > .accept {
      flex: 1 1 auto;
    }

    /* A text button beside the filled one: the same 48px target, none of
       the quiet button's outline, so declining reads lighter than accepting. */
    > .dismiss {
      flex-shrink: 0;
      padding-inline: ${theme.spacing.lg};
      border-color: transparent;
      background: transparent;
    }
  }
`,
);
