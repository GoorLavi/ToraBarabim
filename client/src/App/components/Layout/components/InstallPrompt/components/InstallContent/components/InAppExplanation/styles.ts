import { css } from 'styled-components';

export const InAppExplanation = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .headline {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
  }

  > .line {
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .hint {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};

    > .tile {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 48px;
      block-size: 48px;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.bg};
      color: ${theme.colors.primary};
    }

    > .hintText {
      flex: 1 1 0;
      min-inline-size: 0;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .copy.copied {
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};
  }

  /* A live region that is always in the DOM and filled only when the browser
     refused the clipboard, since a region inserted already filled may not be
     announced. Empty, it must take no room, so it cancels the column gap it
     would otherwise add: the root's gap is spacing.md, and the two change together. */
  > .manualCopyRegion {
    &:empty {
      margin-block-start: calc(-1 * ${theme.spacing.md});
    }

    /* The link as plain text the person can select and copy by hand. */
    > .manualCopy {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      padding: ${theme.spacing.md};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.bg};

      > .manualCopyHint {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .pageLink {
        color: ${theme.colors.text};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
        overflow-wrap: anywhere;
        user-select: all;
      }
    }
  }

  > .close {
    border-color: transparent;
    background: transparent;
  }
`,
);
