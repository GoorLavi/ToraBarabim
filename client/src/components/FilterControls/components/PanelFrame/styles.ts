import { css } from 'styled-components';

// The fixed region (handle, heading, close) never scrolls; the caller's own
// content, appended after the hairline, owns its own scrolling region. The
// root is a programmatic focus target (`tabIndex={-1}`), not itself a
// user-facing control, so it suppresses its own outline rather than adding
// a ring the interactive children already carry.
export const PanelFrame = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 0;
  overflow: hidden;

  &:focus-visible {
    outline: none;
  }

  > .handle {
    align-self: center;
    inline-size: 36px;
    block-size: 4px;
    margin-block: ${theme.spacing.sm};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.border};
    flex-shrink: 0;
  }

  > .headingRow {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.md};
    padding-inline: ${theme.spacing.lg};
    padding-block: ${theme.spacing.md};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .close {
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

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }

      > .closeIcon {
        inline-size: 24px;
        block-size: 24px;
      }
    }
  }

  > .hairline {
    flex-shrink: 0;
    border-block-end: 1px solid ${theme.colors.border};
  }
`,
);
