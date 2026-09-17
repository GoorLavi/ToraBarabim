import { css } from 'styled-components';

export const LessonFilterBar = css(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.sm};

  > .rabbiChip {
    inline-size: fit-content;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.primary};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    > .clearGlyph {
      inline-size: 20px;
      block-size: 20px;
    }
  }

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

    /* Open on a phone, the panel is its own full-width row below the chip
       and the toggle (the outer bar's own flex-wrap forces the wrap, since a
       bare flex item would otherwise only be as wide as its widest child).
       From md up this width is dropped inside the media query below, which
       has to re-target the open class and not the panel alone: a media query
       adds no specificity, so resetting the width on the plain panel selector
       would lose to the more specific open one, and a panel opened narrow
       would keep its full width after the viewport grew. */
    &.open {
      display: flex;
      inline-size: 100%;
    }

    > .sort {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .recurrence,
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

      /* Takes the bar's remaining width instead of shrinking to its content:
         without this the panel is a bare flex item sized to its children, and
         the search field's own flex has nothing left to stretch into. */
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
