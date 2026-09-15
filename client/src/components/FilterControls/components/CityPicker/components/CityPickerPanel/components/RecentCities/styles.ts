import { css } from 'styled-components';

export const RecentCities = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .label {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    font-weight: ${theme.typography.tagAndCaption.fontWeight};
  }

  > .pills {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};

    > li > .pill {
      display: flex;
      align-items: center;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          border-color: ${theme.colors.primary};
        }
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }
    }
  }
`,
);
