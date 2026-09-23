import { css } from 'styled-components';

export const SearchSelect = css(
  ({ theme }) => `
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};

  &.rowLayout {
    flex-direction: row;
    align-items: center;

    > .control {
      inline-size: auto;
    }
  }

  &.fullWidth {
    inline-size: 100%;

    > .control {
      flex: 1;
      min-inline-size: 0;
    }
  }

  > .control {
    inline-size: 100%;
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

    > .triggerLabel {
      min-inline-size: 0;
      flex: 1;
      text-align: start;

      &.truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.emphasized {
        font-weight: ${theme.typography.fontWeight.semiBold};
      }
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

  /* A caller's own sibling content (a clear button, a "not listed" link, a
     lesson-count summary, a field-level error) renders through the children
     prop as a direct child of this root, styled through one of these three
     roles rather than each caller owning its own copy. */
  > .actionLink {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.sm};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
    text-decoration: none;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:focus-visible {
      text-decoration: underline;
    }
  }

  > .summaryText {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .errorText {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .popover {
    position: absolute;
    z-index: 20;
    inset-block-start: 52px;
    inset-inline-start: 0;
    inline-size: min(360px, 100%);
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
    }

    > .results {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      max-block-size: 280px;
      overflow-y: auto;

      &.twoLine > li > button {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding-block: ${theme.spacing.xs};
      }

      > li > button {
        inline-size: 100%;
        min-block-size: 48px;
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
