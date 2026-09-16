import { css } from 'styled-components';

// Phone (design review): the emblem sits alone in the row's end corner
// (left in RTL), the title and count at the row's start, the inset and the
// button each full width below. Desktop: one row, text at the start, the
// inset in the middle, the button (260px) toward the end, the emblem at the
// far end. Never centred at either width.
export const WomensAreaBand = css(
  ({ theme }) => `
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: 'text emblem' 'inset inset' 'action action';
  align-items: start;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.primarySoft};

  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: auto 1fr auto auto;
    grid-template-areas: 'text inset action emblem';
    align-items: center;
    gap: ${theme.spacing.xl};
  }

  > .emblem {
    grid-area: emblem;
    justify-self: end;
  }

  > .text {
    grid-area: text;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    justify-self: start;
    text-align: start;

    > .title {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    > .count {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .inset {
    grid-area: inset;
    inline-size: 100%;
    display: flex;
    justify-content: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};

    @media (min-width: ${theme.breakpoints.lg}) {
      /* The grid's own \`1fr\` column already grows this; no flex property
         applies to a grid item. */
      inline-size: auto;
    }
  }

  > .action {
    grid-area: action;
    inline-size: 100%;

    @media (min-width: ${theme.breakpoints.lg}) {
      /* Off scale, measured from the design review's desktop frame. */
      inline-size: 260px;
    }
  }
`,
);
