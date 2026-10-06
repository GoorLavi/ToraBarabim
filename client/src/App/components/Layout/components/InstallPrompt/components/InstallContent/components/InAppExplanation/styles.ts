import { css } from 'styled-components';

export const InAppExplanation = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .headline {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
  }

  > .line {
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .hint {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    > .tile {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.bg};
      color: ${theme.colors.primary};
    }

    > .hintText {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .copy.copied {
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};
  }

  > .close {
    border-color: transparent;
    background: transparent;
  }
`,
);
