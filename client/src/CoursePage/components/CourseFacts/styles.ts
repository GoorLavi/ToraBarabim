import { css } from 'styled-components';

export const CourseFacts = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding-block: ${theme.spacing.lg};
  border-block: 1px solid ${theme.colors.border};

  > .fact {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .label {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      font-weight: ${theme.typography.tagAndCaption.fontWeight};
    }

    > .value {
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .navLinks {
      display: flex;
      gap: ${theme.spacing.md};
      margin-block-start: ${theme.spacing.xs};

      > .navLink {
        display: flex;
        align-items: center;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.md};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }
    }
  }
`,
);
