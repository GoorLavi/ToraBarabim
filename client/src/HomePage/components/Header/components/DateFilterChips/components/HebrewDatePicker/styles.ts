import { css } from 'styled-components';

export const HebrewDatePicker = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;

  &.sheet > .header,
  &.sheet > .footer {
    /* Extra inset beyond the panel's own padding, so the day grid stays
       flush with the sheet's edge while these rows keep normal breathing
       room (build spec, section 8, "Sheet panel"). The popover's inset
       already applies uniformly and needs no such addition. */
    padding-inline: ${theme.spacing.sm};
  }

  > .header {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    padding-block-end: ${theme.spacing.sm};
    border-block-end: 1px solid ${theme.colors.border};

    > .navButton {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border: none;
      border-radius: ${theme.radii.md};
      background: transparent;
      color: ${theme.colors.text};

      &:disabled {
        color: ${theme.colors.textSecondary};
      }

      > .chevron {
        inline-size: 20px;
        block-size: 20px;
      }
    }

    > .monthLabel {
      flex: 1;
      min-inline-size: 0;
      text-align: center;
      white-space: nowrap;
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      font-weight: ${theme.typography.fontWeight.bold};
    }
  }

  > .weekdayRow {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding-block: ${theme.spacing.sm};

    > span {
      text-align: center;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }

  > .grid {
    display: flex;
    flex-direction: column;

    > .row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0;
    }

    > .row > .day {
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 100%;
      min-block-size: 48px;
      border: none;
      background: transparent;

      &:focus-visible {
        outline: none;

        > .mark {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
        }
      }

      > .mark {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 40px;
        block-size: 40px;
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }

      &.adjacent > .mark,
      &.past > .mark {
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.regular};
      }

      &.selectable:hover > .mark {
        background: ${theme.colors.primarySoft};
      }

      &.today > .mark {
        box-shadow: inset 0 0 0 1px ${theme.colors.accent};
      }

      &.selected > .mark {
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
      }

      &.today.selected > .mark {
        box-shadow:
          0 0 0 1px ${theme.colors.surface},
          0 0 0 2px ${theme.colors.accent};
      }
    }
  }

  > .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block-start: ${theme.spacing.md};
    margin-block-start: ${theme.spacing.sm};
    border-block-start: 1px solid ${theme.colors.border};

    > .footerAction {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: none;
      border-radius: ${theme.radii.md};
      background: transparent;
      color: ${theme.colors.primary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      font-weight: ${theme.typography.fontWeight.semiBold};

      &:disabled {
        color: ${theme.colors.textSecondary};
      }
    }
  }
`,
);
