import { css } from 'styled-components';

export const SearchSelect = css(
  ({ theme }) => `
  position: relative;

  &.fullWidth {
    inline-size: 100%;

    > .control {
      flex: 1;
      min-inline-size: 0;
    }
  }

  > .control {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    min-block-size: 48px;
    padding-block: ${theme.spacing.xs};
    padding-inline: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    /* A caller's own renderTrigger markup reaches for these on whatever
       element it renders: a single-line pill that must not grow past its
       row truncates with .truncate, and a chosen value that outranks a
       placeholder reads through .triggerPrimary, the trigger's own
       counterpart to a result row's .optionPrimary below. */
    .truncate {
      flex: 1;
      min-inline-size: 0;
      text-align: start;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .triggerPrimary {
      font-weight: ${theme.typography.fontWeight.semiBold};
    }

    > .chevron {
      flex-shrink: 0;
      inline-size: 16px;
      block-size: 16px;
    }
  }

  &.invalid > .control {
    border-color: ${theme.colors.danger};
  }

  > .popover {
    position: absolute;
    z-index: ${theme.zIndex.popover};
    inset-block-start: calc(100% + ${theme.spacing.xs});
    inset-inline-start: 0;
    inline-size: min(360px, 100%);
    min-inline-size: min(280px, 90vw);
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.raised};

    > .search {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .hint {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      &.danger {
        color: ${theme.colors.danger};
      }
    }

    > .results {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      max-block-size: 280px;
      overflow-y: auto;

      > li > button {
        inline-size: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        min-block-size: 48px;
        padding-block: ${theme.spacing.xs};
        padding-inline: ${theme.spacing.md};
        border-radius: ${theme.radii.sm};
        text-align: start;
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        > .optionPrimary {
          font-weight: ${theme.typography.fontWeight.semiBold};
        }

        > .optionSecondary {
          display: block;
          color: ${theme.colors.textSecondary};
          font-weight: ${theme.typography.fontWeight.regular};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }

        &[aria-selected='true'] {
          background: ${theme.colors.primarySoft};
          color: ${theme.colors.primary};
          font-weight: ${theme.typography.fontWeight.semiBold};
        }

        &:hover {
          background: ${theme.colors.primarySoft};
        }
      }
    }
  }
`,
);
