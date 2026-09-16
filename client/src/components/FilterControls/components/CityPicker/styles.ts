import { css } from 'styled-components';

export const CityPicker = css(
  ({ theme }) => `
  position: relative;

  > .pill {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.surface};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    white-space: nowrap;

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    > .pin {
      flex-shrink: 0;
      inline-size: 18px;
      block-size: 18px;
    }

    > .label {
      max-inline-size: min(140px, 42vw);
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > .chevron {
      flex-shrink: 0;
      inline-size: 16px;
      block-size: 16px;
      transform: rotate(180deg);

      /* Below sm the panel rises from the bottom as a drawer, so the
         chevron points up to match; from sm up it opens as a popover
         below the pill, so it points down. */
      @media (min-width: ${theme.breakpoints.sm}) {
        transform: rotate(0deg);
      }
    }

    /* The path only fills half of its 24-unit viewBox, so a 28px box
       renders the glyph itself at roughly 14px, matched to the label's
       weight rather than reading as a faint afterthought (design review,
       item 7). */
    > .clearGlyph {
      flex-shrink: 0;
      inline-size: 28px;
      block-size: 28px;
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
    inline-size: min(320px, 90vw);
    max-inline-size: calc(100vw - 2 * ${theme.spacing.lg});
    max-block-size: min(560px, calc(100dvh - 2 * ${theme.spacing.xl}));
    display: flex;
    flex-direction: column;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.raised};
    overflow: hidden;
  }
`,
);
