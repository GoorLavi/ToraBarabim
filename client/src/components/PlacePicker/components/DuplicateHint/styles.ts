import { css } from 'styled-components';

export const DuplicateHint = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.primarySoft};

  > .message {
    color: ${theme.colors.text};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing.md};

    > .confirm,
    > .dismiss {
      display: inline-flex;
      align-items: center;
      min-block-size: 48px;
      padding-block: ${theme.spacing.sm};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          text-decoration: underline;
        }
      }

      &:focus-visible {
        text-decoration: underline;
      }
    }

    > .confirm {
      color: ${theme.colors.primary};
    }

    > .dismiss {
      color: ${theme.colors.textSecondary};
    }
  }
`,
);
