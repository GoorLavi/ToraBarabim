import { css } from 'styled-components';

export const LessonRow = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding-block: 14px;
  padding-inline: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  color: inherit;
  text-decoration: none;
  transition: border-color 150ms ease;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${theme.colors.primary};
    }
  }

  > .when {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: ${theme.spacing.md};

    > .time {
      font-size: ${theme.typography.timeInCard.phone.fontSize};
      line-height: ${theme.typography.timeInCard.phone.lineHeight};
      font-weight: ${theme.typography.timeInCard.fontWeight};
      color: ${theme.colors.text};
    }

    > .date {
      flex-shrink: 0;
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      color: ${theme.colors.textSecondary};
    }
  }

  > .title {
    font-size: ${theme.typography.cardTitle.phone.fontSize};
    line-height: ${theme.typography.cardTitle.phone.lineHeight};
    font-weight: ${theme.typography.cardTitle.fontWeight};
    color: ${theme.colors.text};
    overflow-wrap: break-word;
  }

  > .venue {
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
    color: ${theme.colors.textSecondary};
    overflow-wrap: break-word;
  }
`,
);
