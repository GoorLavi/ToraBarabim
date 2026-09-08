import { css } from 'styled-components';

export const SiteLogoLink = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-block-size: 48px;
  /* Without this, a block-level flex box stretches to its containing
     block's own width, even inside FilterControls's own grid cell. */
  inline-size: fit-content;
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.textOnPrimary};
  text-decoration: none;

  &:hover,
  &:active {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.textOnPrimary};
    outline-offset: 2px;
  }

  > .wordmark {
    font-weight: ${theme.typography.fontWeight.bold};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    /* A long city name in the header's city pill can squeeze this track
       narrower than the wordmark's own natural width, wrapping it to two
       lines (measured at 375 with a long selected city). The wordmark
       holds one line and the city pill's own ellipsis absorbs the
       squeeze instead. */
    white-space: nowrap;
  }
`,
);
