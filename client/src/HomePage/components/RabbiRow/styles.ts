import { css } from 'styled-components';

export const RabbiRow = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: ${theme.spacing.md};

    > h2 {
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      color: ${theme.colors.text};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    > .seeAll {
      flex-shrink: 0;
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .state {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .state.error {
    color: ${theme.colors.danger};
  }

  > .row {
    display: flex;
    gap: ${theme.spacing.lg};
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    /* Cancels the page gutter and re-applies it as end padding, so the row
       runs full-bleed while the first avatar still lines up under the
       heading and the last one keeps trailing space (design-system.md,
       "A horizontally scrolling row runs full width"). */
    margin-inline: calc(-1 * ${theme.spacing.lg});
    padding-inline: ${theme.spacing.lg};
    scrollbar-width: none;

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${theme.spacing.xl});
      padding-inline: ${theme.spacing.xl};
    }

    &::-webkit-scrollbar {
      display: none;
    }

    @media (pointer: fine) {
      scrollbar-width: thin;

      &::-webkit-scrollbar {
        display: block;
        block-size: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: ${theme.colors.border};
        border-radius: ${theme.radii.pill};
      }
    }
  }
`,
);
