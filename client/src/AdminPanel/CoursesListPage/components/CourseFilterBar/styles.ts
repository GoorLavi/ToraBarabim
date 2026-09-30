import { css } from 'styled-components';

export const CourseFilterBar = css(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.sm};

  > .mobileToggle {
    display: flex;
    align-items: center;
    justify-content: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.surface};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    @media (min-width: ${theme.breakpoints.md}) {
      display: none;
    }
  }

  > .panel {
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.spacing.sm};

    &.open {
      display: flex;
      inline-size: 100%;
    }

    > .status,
    > .search {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .clear {
      align-self: flex-start;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.sm};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    @media (min-width: ${theme.breakpoints.md}) {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
      flex: 1 1 auto;
      min-inline-size: 0;

      &,
      &.open {
        inline-size: auto;
      }

      > .search {
        flex: 1;
        min-inline-size: 220px;
      }
    }
  }
`,
);
