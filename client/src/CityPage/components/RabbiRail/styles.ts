import { css } from 'styled-components';

export const RabbiRail = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .heading {
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    color: ${theme.colors.text};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.sectionHeading.desktop.fontSize};
      line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
    }
  }

  > .rail {
    display: flex;
    gap: ${theme.spacing.md};
    align-items: flex-start;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    /* Cancels the page gutter and re-applies it as end padding, so the rail
       runs full-bleed while the first cell still lines up under the
       heading (design-system.md, "A horizontally scrolling row runs full
       width"). */
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
