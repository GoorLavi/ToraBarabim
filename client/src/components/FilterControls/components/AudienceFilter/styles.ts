import { css } from 'styled-components';

// Shaped like CityPicker: same pill, so the two read as a matched pair in
// the header. `.popover` positions `AudiencePanel`, the `sm`-and-up form;
// below `sm` the same panel renders inside `FilterDrawer` instead, which
// owns its own positioning.
export const AudienceFilter = css(
  ({ theme }) => `
  position: relative;
  display: flex;
  align-items: center;
  /* Exactly 48, matching the search field beside it (design review, frame
     9:94): the row this sits in only reads as 48 tall if neither child adds
     height of its own. */
  block-size: 48px;

  > .pill {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.surface};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    white-space: nowrap;

    > .icon {
      flex-shrink: 0;
      inline-size: 18px;
      block-size: 18px;
    }

    > .label {
      max-inline-size: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > .chevron {
      flex-shrink: 0;
      inline-size: 16px;
      block-size: 16px;
    }

    &.selected {
      color: ${theme.colors.primaryStrong};
    }
  }

  > .popover {
    position: absolute;
    z-index: ${theme.zIndex.popover};
    inset-block-start: calc(100% + ${theme.spacing.xs});
    inset-inline-end: 0;
    inline-size: max-content;
    min-inline-size: 240px;
    max-inline-size: calc(100vw - 2 * ${theme.spacing.lg});
    max-block-size: min(480px, calc(100dvh - 2 * ${theme.spacing.xl}));
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.raised};
    overflow: hidden;
  }
`,
);
