import { css } from 'styled-components';

// A full label rather than a bare arrow (design spec, "Header and the way
// back"): a target is not as tall as its text, so the 48px tap target comes
// from padding on the anchor itself, never the line's own height
// (design-system.md, "Mobile first").
export const BackLink = css(
  ({ theme }) => `
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  min-block-size: 48px;
  padding-inline-end: ${theme.spacing.sm};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.semiBold};
  font-size: ${theme.typography.secondary.phone.fontSize};
  line-height: ${theme.typography.secondary.phone.lineHeight};
  text-decoration: none;

  &:hover,
  &:active {
    color: ${theme.colors.primaryStrong};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${theme.radii.sm};
  }

  > .arrow {
    inline-size: 20px;
    block-size: 20px;
  }
`,
);
