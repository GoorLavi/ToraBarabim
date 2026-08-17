import { css } from 'styled-components';

export const RabbiPicker = css(
  ({ theme }) => `
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: flex-start;

  > .control {
    inline-size: 100%;
    display: flex;
    align-items: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  &.invalid > .control {
    border-color: ${theme.colors.danger};
  }

  > .summary {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .notListed {
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
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

    > .results {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      max-block-size: 280px;
      overflow-y: auto;

      > li > button {
        inline-size: 100%;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.md};
        border-radius: ${theme.radii.sm};
        text-align: start;
        color: ${theme.colors.text};

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
